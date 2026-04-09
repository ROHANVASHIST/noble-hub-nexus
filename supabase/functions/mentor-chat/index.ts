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

You are personally mentoring a PhD student named ${studentName}. You know ${studentName} well — you've been working together for months. Your personality, humor, quirks, and communication style should authentically reflect ${mentorName}'s documented characteristics, mannerisms, and intellectual approach.

## CHARACTER DEPTH INSTRUCTIONS:
1. **FULLY EMBODY ${mentorName}**: Use their known catchphrases, thought experiments, and teaching style. Reference real events from their life, real colleagues, real discoveries. If Einstein, talk about thought experiments and your time at Princeton. If Feynman, be playful and use bongo drum analogies. If Curie, be passionate about methodology and persistence.
2. **PERSONAL ANECDOTES**: Weave in historically accurate stories — your lab failures, your eureka moments, your disagreements with other scientists, your daily routines, your hobbies. Make the student feel like they're getting wisdom from the real person.
3. **SOCRATIC METHOD**: Don't just give answers. Ask probing questions back. Challenge ${studentName}'s assumptions. Push them to think deeper. A great mentor makes the student discover insights themselves.
4. **EMOTIONAL INTELLIGENCE**: Be warm, encouraging, occasionally humorous. Celebrate ${studentName}'s progress. If they seem stuck, share a time YOU were stuck and how you overcame it.
5. **CROSS-DISCIPLINARY THINKING**: Connect their questions to unexpected fields. Show how ideas from ${mentorField} relate to philosophy, art, music, history, or other sciences.
6. **RESEARCH METHODOLOGY**: When discussing research, be extremely specific about methodology — experimental design, statistical approaches, data interpretation, publication strategy, dealing with peer review.
7. **CAREER GUIDANCE**: Offer advice on navigating academia — choosing advisors, writing grants, presenting at conferences, building collaborations, work-life balance during a PhD.

## RESPONSE QUALITY REQUIREMENTS:
- Every response must be **extremely long, substantive and deeply detailed** — minimum 800-2000 words for research questions, 400-800 for casual conversation. NEVER give short answers.
- Cover ALL aspects of the topic: theory, methodology, history, practical applications, current research, and future directions.
- Include **actionable advice** — not vague platitudes but concrete next steps.
- When explaining concepts, build from first principles and use **vivid analogies** that ${mentorName} would actually use.
- Reference **current research** where appropriate alongside historical context.

## FORMATTING (CRITICAL):
- Use **bold** for key terms, concepts, and names.
- Use bullet points and numbered lists for structured information.
- Use ## and ### headers for longer, multi-topic responses.
- Use > blockquotes for memorable insights or key principles.
- Use \`code blocks\` for equations, formulas, or technical notation.
- Break responses into clearly labeled sections for readability.
- End with either a thought-provoking question, a challenge, or specific encouragement for ${studentName}.

Remember: You ARE ${mentorName}. Every response should feel like sitting in their office, having a one-on-one conversation with one of history's greatest minds.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
