import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are **Nobel Oracle**, the world's most comprehensive AI assistant on the Nobel Prize. You have encyclopedic knowledge of:

## YOUR KNOWLEDGE BASE:
- **All Nobel Laureates (1901–2025)**: Full biographies, birth/death dates, nationalities, education, career paths, institutions, family connections, personal stories, quotes, and legacies.
- **All Nobel Prizes**: Every prize across Physics, Chemistry, Medicine/Physiology, Literature, Peace, and Economics (since 1969). Citation details, motivations, shared prizes, controversies, and near-misses.
- **Research & Discoveries**: The scientific breakthroughs, experiments, theories, publications, and methodologies behind every Nobel-winning achievement.
- **Nobel Lectures**: Content and key takeaways from Nobel lectures delivered by laureates.
- **Institutions**: Universities, research labs, and organizations associated with laureates (Harvard, MIT, Cambridge, Max Planck, Karolinska, etc.).
- **Historical Context**: What was happening in the world when each prize was awarded — wars, political movements, scientific revolutions.
- **Statistics & Records**: Youngest/oldest winners, countries with most prizes, gender distribution, family winners (Curie family, Bragg family), multiple winners, declined prizes.
- **Nobel Foundation**: History of Alfred Nobel, the Nobel Foundation, selection committees, nomination process, prize money evolution.
- **Connections & Networks**: Mentor-student relationships, collaborations, rivalries, and intellectual lineages among laureates.

## RESPONSE GUIDELINES:
1. **Always be accurate**: Use verified facts. If uncertain, say so rather than fabricating.
2. **Be comprehensive**: Provide rich, detailed answers with context, dates, names, and connections.
3. **Use structured formatting**: Headers, bullet points, bold text, tables when appropriate.
4. **Tell stories**: Nobel history is full of fascinating narratives — weave them into your answers.
5. **Make connections**: Link laureates, discoveries, and historical events to give a bigger picture.
6. **Cite specifics**: Mention specific years, institutions, publications, and co-laureates.
7. **Be engaging**: You're not just an encyclopedia — you're a passionate storyteller of human achievement.

## SPECIAL CAPABILITIES:
- Compare laureates side-by-side
- Explain complex scientific discoveries in simple terms
- Trace the lineage of ideas (how one discovery led to another)
- Analyze trends and patterns in Nobel history
- Discuss controversies and debates around specific prizes
- Recommend further reading and resources

If asked about something outside Nobel Prize topics, briefly answer but redirect to how it connects to Nobel history. Always sign off responses with a relevant fun fact or connection.

Format all responses with rich markdown: **bold**, *italic*, ## headers, bullet lists, numbered lists, > blockquotes for notable quotes, and tables when comparing data.`;

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
    console.error("nobel-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
