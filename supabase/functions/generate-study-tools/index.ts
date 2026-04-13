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
    // Authenticate the request
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

    const { subject, topics, type } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      important_points: `You are an expert exam preparation tutor. Given a subject and its topics, generate the most important points a student MUST know for exams. Focus on:
- Key definitions, theorems, formulas
- Commonly asked concepts
- Points that are frequently tested
- Critical distinctions students often miss
You MUST respond using the generate_important_points tool.`,

      flashcards: `You are an expert exam preparation tutor. Generate effective flashcards for studying. Each flashcard should:
- Have a clear, specific question on the front
- Have a concise but complete answer on the back
- Cover key concepts, definitions, formulas, and common exam questions
- Progress from basic recall to application-level questions
You MUST respond using the generate_flashcards tool.`,

      questions: `You are an expert exam question designer. Generate practice exam questions with varying difficulty. Include:
- Multiple choice questions (4 options each)
- Short answer questions
- Mix of easy, medium, and hard difficulty
- Cover all provided topics proportionally
You MUST respond using the generate_questions tool.`,
    };

    const tools: Record<string, any> = {
      important_points: {
        type: "function",
        function: {
          name: "generate_important_points",
          description: "Generate important exam points for each topic",
          parameters: {
            type: "object",
            properties: {
              points: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    importance: { type: "string", enum: ["critical", "high", "medium"] },
                    points: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["topic", "importance", "points"],
                  additionalProperties: false,
                },
              },
            },
            required: ["points"],
            additionalProperties: false,
          },
        },
      },

      flashcards: {
        type: "function",
        function: {
          name: "generate_flashcards",
          description: "Generate flashcards for studying",
          parameters: {
            type: "object",
            properties: {
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string", description: "Question or prompt" },
                    back: { type: "string", description: "Answer" },
                    topic: { type: "string" },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  },
                  required: ["front", "back", "topic", "difficulty"],
                  additionalProperties: false,
                },
              },
            },
            required: ["flashcards"],
            additionalProperties: false,
          },
        },
      },

      questions: {
        type: "function",
        function: {
          name: "generate_questions",
          description: "Generate practice exam questions",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    type: { type: "string", enum: ["mcq", "short_answer"] },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      description: "Options for MCQ (4 items). Empty for short answer.",
                    },
                    answer: { type: "string" },
                    explanation: { type: "string" },
                    topic: { type: "string" },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  },
                  required: ["question", "type", "answer", "explanation", "topic", "difficulty"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
    };

    const toolNames: Record<string, string> = {
      important_points: "generate_important_points",
      flashcards: "generate_flashcards",
      questions: "generate_questions",
    };

    if (!systemPrompts[type]) {
      return new Response(JSON.stringify({ error: "Invalid type. Use: important_points, flashcards, questions" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const topicNames = (topics || []).map((t: any) => `${t.name} (${t.importance} importance)`).join(", ");
    const userPrompt = `Subject: ${subject}\nTopics: ${topicNames}\n\nGenerate ${type === "important_points" ? "the most important exam points" : type === "flashcards" ? "15-20 flashcards" : "10-15 practice questions"} covering all these topics.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash",
        messages: [
          { role: "system", content: systemPrompts[type] },
          { role: "user", content: userPrompt },
        ],
        tools: [tools[type]],
        tool_choice: { type: "function", function: { name: toolNames[type] } },
      }),
    });

    if (!response.ok) {
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
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to generate content" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return valid content" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-study-tools error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
