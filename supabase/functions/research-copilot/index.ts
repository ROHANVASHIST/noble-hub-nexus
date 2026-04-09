import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are the Nobel Research Copilot — an advanced AI research assistant embedded in NobelHub, a platform for exploring Nobel Prize history and conducting academic research.

Your capabilities:
1. **Context-Aware Analysis**: You have access to the user's research notes, projects, and bookmarks. Use this to provide personalized suggestions.
2. **Nobel Knowledge**: You have deep knowledge of Nobel Prize history, laureates, their discoveries, and the connections between them.
3. **Research Guidance**: Suggest related discoveries, potential research directions, and connections the user might not have considered.
4. **Academic Rigor**: Provide well-reasoned, evidence-based suggestions with specific laureate names, years, and discoveries.
5. **Comprehensive Coverage**: Every response must be EXHAUSTIVE and cover ALL aspects of the topic.

User's Research Context:
${context || "No context provided."}

Guidelines:
- Be extremely specific: mention laureate names, years, discoveries, institutions, key papers, and experimental details
- Draw unexpected connections between different fields and across time periods
- Suggest actionable next steps for the user's research with detailed reasoning
- Use markdown formatting for clarity with headers, lists, tables, and blockquotes
- Keep responses LONG and DETAILED — aim for 1000-2500 words minimum
- Cover the topic from multiple angles: historical context, scientific significance, methodology, impact, controversies, and future directions
- Include relevant statistics, timelines, and data points
- Provide bibliography-style references to key papers and works
- Analyze the broader implications and connections to current research frontiers
- When suggesting research directions, provide detailed rationale and methodology ideas`;

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
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("research-copilot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
