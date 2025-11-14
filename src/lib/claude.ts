import Anthropic from "@anthropic-ai/sdk";
import type { PatternAnalysis } from "./patternAnalysis";

export interface ConstellationStory {
  name: string;
  story: string;
}

export async function generateConstellationStory(
  pattern: PatternAnalysis
): Promise<ConstellationStory> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "VITE_CLAUDE_API_KEY is not configured. Please add your Claude API key to use this feature."
    );
  }

  const anthropic = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true, // Note: In production, API calls should go through a backend
  });

  const starPositionsText = pattern.starPositions
    .map((star) => `Star ${star.id}: (${star.x}, ${star.y})`)
    .join("\n");

  const prompt = `You are looking at a pattern of stars someone just created. Based on their specific arrangement, what familiar shape or story do you see?

<star_details>
Number of stars: ${pattern.numStars}
Shape detected: ${pattern.shapeType}
Distribution: ${pattern.distributionType}
Average distance from center: ${pattern.avgDistance} pixels
Distance variance: ${pattern.distanceVariance}

Star positions:
${starPositionsText}

Center point: (${pattern.centroid.x}, ${pattern.centroid.y})
</star_details>

Look at these specific positions and connections. What everyday object, scene, or story does this pattern remind you of? Be creative but grounded in everyday observations.

Respond with:
Name: A simple, relatable name based on what you see
Description: One friendly sentence about what this pattern looks like.

Keep it warm and conversational, like you're pointing out shapes in clouds. Avoid cosmic or mythological language.

Examples:
Name: The Skateboard
Description: Those four stars look just like the wheels and deck of a tilted skateboard, with the front kicked up a bit like it's ready to do a trick.

Name: Playful Puppy
Description: The stars seem to form the shape of a dog's face with floppy ears, where the leftmost stars make up one ear, the middle stars create the snout and eyes, and the right stars form the other ear flopping down.

Return your response as JSON in this format:
{
  "name": "The [Simple Name]",
  "story": "[One friendly sentence description]"
}

DO NOT include any text outside the JSON structure.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Try to parse as JSON first
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          name: result.name,
          story: result.story,
        };
      }
    } catch (e) {
      // Fall back to old format
    }

    // Fallback to old format parsing
    const nameMatch = responseText.match(/NAME:\s*(.+)/i);
    const storyMatch = responseText.match(/STORY:\s*(.+)/is);

    if (nameMatch && storyMatch) {
      return {
        name: nameMatch[1].trim(),
        story: storyMatch[1].trim(),
      };
    }

    throw new Error("Failed to parse Claude response");
  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
}
