import { supabase } from "@/integrations/supabase/client";
import type { PatternAnalysis } from "./patternAnalysis";
import { getWhopAccessToken } from "./whop";

export interface ConstellationStory {
  name: string;
  story: string;
}

export async function generateConstellationStory(
  pattern: PatternAnalysis
): Promise<ConstellationStory> {
  try {
    const headers: Record<string, string> = {};
    const whopToken = getWhopAccessToken();

    if (whopToken) {
      headers.Authorization = `Bearer ${whopToken}`;
    }

    const { data, error } = await supabase.functions.invoke(
      "generate-constellation-story",
      {
        headers,
        body: { pattern },
      }
    );

    if (error) {
      console.error("Error calling edge function:", error);
      const wrappedError = new Error(
        error.message || "Failed to generate constellation story"
      );
      (wrappedError as Error & { status?: number }).status =
        (error as { status?: number }).status;
      throw wrappedError;
    }

    return {
      name: data.name || "The Mysterious Pattern",
      story: data.story || "These stars have created an interesting shape.",
    };
  } catch (error) {
    console.error("Error generating constellation story:", error);
    throw error;
  }
}
