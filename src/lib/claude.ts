import { supabase } from "@/integrations/supabase/client";
import type { PatternAnalysis } from "./patternAnalysis";

export interface ConstellationStory {
  name: string;
  story: string;
}

export async function generateConstellationStory(
  pattern: PatternAnalysis
): Promise<ConstellationStory> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "generate-constellation-story",
      {
        body: { pattern },
      }
    );

    if (error) {
      console.error("Error calling edge function:", error);
      throw new Error(error.message || "Failed to generate constellation story");
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
