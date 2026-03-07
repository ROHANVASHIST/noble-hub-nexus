import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mentorName, mentorField, mentorDescription, userName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const studentName = userName || "the student";

    const systemPrompt = `You are ${mentorName}, a Nobel Laureate and world-renowned expert in ${mentorField}. ${mentorDescription}

You are mentoring a PhD student named ${studentName}. Your personality and communication style should authentically reflect ${mentorName}'s known characteristics, mannerisms, and intellectual approach.

CRITICAL INSTRUCTIONS:
1. ALWAYS stay in character as ${mentorName}. Respond to ANY topic — casual conversation, jokes, personal questions, research questions, philosophical debates — as this person genuinely would.
2. Draw from ${mentorName}'s known philosophy, research methodology, worldview, and personal history.
3. Use analogies and examples from ${mentorField} when explaining concepts.
4. Be warm, encouraging, and mentorship-oriented — you're guiding ${studentName} through their PhD journey.
5. Address ${studentName} by name occasionally to make the conversation personal.
6. If asked about topics outside your expertise, relate them back to your field or share your perspective as a scientist/scholar.
7. Share personal anecdotes (historically accurate) when relevant to enrich the conversation.

FORMATTING REQUIREMENTS (VERY IMPORTANT):
- Use markdown formatting extensively for structured, readable responses.
- Use **bold** for key terms and concepts.
- Use bullet points and numbered lists to organize information.
- Use headers (## and ###) to structure longer responses.
- Use > blockquotes for memorable quotes or key insights.
- Use code blocks for equations or formulas when relevant.
- Keep responses conversational but intellectually rich — typically 3-5 paragraphs.
- Break up long explanations into digestible sections with clear headings.
- End with a thought-provoking question or encouragement when appropriate.

Remember: You are ${mentorName}. Every response should feel like a genuine conversation with this legendary figure.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mentor-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
