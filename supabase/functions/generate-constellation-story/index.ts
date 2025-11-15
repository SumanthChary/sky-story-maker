import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WHOP_APP_ID = Deno.env.get("WHOP_APP_ID");
const WHOP_ACCESS_CHECK_DISABLED = Deno.env.get("WHOP_ACCESS_CHECK_DISABLED") === "true";

const jsonResponse = (data: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const extractWhopToken = (req: Request): string | null => {
  const header = req.headers.get("Authorization") || req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  const cookieHeader = req.headers.get("Cookie") || req.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  for (const entry of cookieHeader.split(";")) {
    const [rawKey, ...rest] = entry.trim().split("=");
    if (rawKey === "whop_user_token" && rest.length > 0) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch (error) {
        console.error("Failed to decode whop_user_token cookie", error);
        return null;
      }
    }
  }

  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pattern } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!WHOP_ACCESS_CHECK_DISABLED) {
      if (!WHOP_APP_ID) {
        console.error("WHOP_APP_ID is not configured");
        return jsonResponse({ error: "Configuration error" }, 500);
      }

      const whopToken = extractWhopToken(req);

      if (!whopToken) {
        return jsonResponse({ error: "Whop sign-in required" }, 401);
      }

      const accessExpression = `app:${WHOP_APP_ID}`;
      const accessResponse = await fetch(
        `https://access.api.whop.com/check/${encodeURIComponent(accessExpression)}`,
        {
          headers: {
            Authorization: `Bearer ${whopToken}`,
          },
        }
      );

      if (accessResponse.status === 401) {
        return jsonResponse({ error: "Whop session expired" }, 401);
      }

      if (!accessResponse.ok) {
        const accessError = await accessResponse.text();
        console.error(
          "Whop access API error:",
          accessResponse.status,
          accessError
        );
        return jsonResponse({ error: "Failed to verify Whop access" }, 500);
      }

      const accessData = await accessResponse.json();
      if (!accessData?.access) {
        return jsonResponse({ error: "Active Whop membership not found" }, 403);
      }
    }
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const starPositionsText = pattern.starPositions
      .map((star: any) => `Star ${star.id}: (${star.x}, ${star.y})`)
      .join('\n');

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

    console.log("Calling Lovable AI with pattern:", pattern);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Lovable AI response:", data);

    let content = data.choices[0].message.content;
    
    // Strip markdown code blocks if present (AI sometimes wraps JSON in ```json ... ```)
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Parse JSON from response
    let result;
    try {
      result = JSON.parse(content);
      console.log("Successfully parsed AI response:", result);
    } catch (e) {
      console.error("Failed to parse JSON response:", content);
      // Fallback: try to extract name and story from text
      const nameMatch = content.match(/[Nn]ame:\s*(.+?)(?:\n|$)/);
      const storyMatch = content.match(/[Dd]escription:\s*(.+?)(?:\n|$)/);
      
      result = {
        name: nameMatch ? nameMatch[1].trim() : "The Mysterious Pattern",
        story: storyMatch ? storyMatch[1].trim() : "These stars have created an interesting shape."
      };
    }

    return jsonResponse(result);
  } catch (error) {
    console.error("Error in generate-constellation-story:", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        name: "The Mysterious Pattern",
        story: "These stars have created an interesting shape - what do you see?",
      },
      500
    );
  }
});
