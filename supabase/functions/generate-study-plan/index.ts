import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subjects, topics, dailyHours, examDates, demo } = await req.json();

    // Authenticate unless demo mode
    if (!demo) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const systemPrompt = `You are an expert study planner. Generate a detailed, day-by-day study plan based on the student's subjects, topics, available study hours, and exam dates.

Rules:
- Prioritize topics marked as "high" importance
- Schedule harder/high-importance topics earlier in the day when focus is best
- Include revision days before exams
- Balance subjects across days
- Each day's total study time should not exceed the daily study hours
- Include short breaks between study blocks

You MUST respond using the generate_study_plan tool.`;

    const userPrompt = `Create a study plan with:
- Daily study hours: ${dailyHours || 4}
- Subjects and exam dates: ${JSON.stringify(examDates || [])}
- Topics to cover: ${JSON.stringify(topics || [])}

Generate a plan starting from today for the next 14 days (or until all exams are covered).`;

    const requestBody = JSON.stringify({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_study_plan",
            description: "Generate a structured day-by-day study plan",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "A descriptive title for the study plan" },
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string", description: "Date in YYYY-MM-DD format" },
                      dayLabel: { type: "string", description: "e.g. Day 1, Day 2, Revision Day" },
                      blocks: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            subject: { type: "string" },
                            topic: { type: "string" },
                            duration: { type: "number", description: "Duration in minutes" },
                            notes: { type: "string", description: "Study tips or focus areas" },
                          },
                          required: ["subject", "topic", "duration"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["date", "dayLabel", "blocks"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "days"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_study_plan" } },
    });

    const makeRequest = async () => {
      return await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
      });
    };

    let response = await makeRequest();
    if (response.status === 500) {
      console.log("First attempt failed with 500, retrying...");
      await new Promise(r => setTimeout(r, 1000));
      response = await makeRequest();
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to generate study plan" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return a valid study plan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-study-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
