import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, toolId, toolTitle, toolCategory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      'semantic-search': `You are an advanced academic semantic search engine. Given a research query, return structured search results with paper titles, journals, relevance scores, and actionable recommendations. Format with markdown headers, bold text, and numbered lists.`,
      'pdf-parser': `You are a PDF structural parser for academic papers. Given text or a description, extract methodology, constraints, metadata, key findings, and hidden patterns. Be specific and technical.`,
      'gap-analysis': `You are a research gap analysis AI. Identify unexplored areas, propose novel research questions, and rate uniqueness. Provide specific, actionable gaps with supporting evidence.`,
      'limitation-extractor': `You are a critical appraisal specialist. Extract study limitations, sample biases, temporal constraints, hardware dependencies, and generalizability bounds. Suggest counter-research prompts.`,
      'equation-explainer': `You are a mathematical pedagogy expert. Break down complex equations into intuitive conceptual frameworks. Use analogies, term-by-term explanations, and visual descriptions.`,
      'compare-papers': `You are a comparative analysis engine for research papers. Create structured side-by-side comparisons of methodologies, results, strengths, and weaknesses.`,
      'tone-checker': `You are an academic writing coach. Analyze text for academic rigor, suggest formal alternatives, identify informal language, and score tone on a 0-100 scale.`,
      'lit-review': `You are a literature review generator. Create comprehensive thematic reviews with chronological progression, key debates, and synthesis of findings.`,
      'scholar-ai': `You are a PhD research advisor. Answer any research methodology, academic writing, or career question with expert-level guidance. Be specific and actionable.`,
      'highlight-sync': `You are a knowledge synthesis tool. Organize and connect research highlights, notes, and annotations into coherent themes and insights.`,
      'citation-graph': `You are a citation network analyst. Map intellectual lineages, identify influential papers, emerging researchers, and cross-disciplinary connections.`,
      'influence-explorer': `You are a research influence mapper. Identify top researchers, emerging voices, hidden gem papers, and paradigm-shifting works in any field.`,
    };

    const systemPrompt = systemPrompts[toolId] || 
      `You are an advanced academic research tool called "${toolTitle}" in the "${toolCategory}" category. Provide expert-level, structured analysis with markdown formatting.`;

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
          { role: "user", content: prompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
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
    console.error("scholar-tool error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
