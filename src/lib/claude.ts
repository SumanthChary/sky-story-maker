import Anthropic from "@anthropic-ai/sdk";

export interface ConstellationStory {
  name: string;
  story: string;
}

export async function generateConstellationStory(
  starCount: number,
  patternType: string
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

  const prompt = `Analyze this star constellation: ${starCount} stars arranged in a ${patternType} pattern. Create a relatable, everyday constellation name starting with 'The' (like 'The Dancing Umbrella' or 'The Sleepy Cat') that reflects the shape. Then write a short 3-sentence poetic story about what this constellation represents in daily life. Make it whimsical and heartwarming.

Return your response in this exact format:
NAME: [constellation name]
STORY: [3-sentence story]`;

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

    // Parse response
    const nameMatch = responseText.match(/NAME:\s*(.+)/);
    const storyMatch = responseText.match(/STORY:\s*(.+)/s);

    if (!nameMatch || !storyMatch) {
      throw new Error("Failed to parse Claude response");
    }

    return {
      name: nameMatch[1].trim(),
      story: storyMatch[1].trim(),
    };
  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
}
