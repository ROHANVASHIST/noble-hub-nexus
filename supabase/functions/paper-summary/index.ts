import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return json({ error: "Unauthorized" }, 401);

    const { paperId } = await req.json();
    if (typeof paperId !== "string" || paperId.length > 64) return json({ error: "Invalid paper" }, 400);
    const { data: p, error } = await supabase.from("saved_papers").select("*").eq("id", paperId).maybeSingle();
    if (error || !p) return json({ error: "Paper not found" }, 404);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    const prompt = `Title: ${p.title}\nAuthors: ${(p.authors || []).join(", ")}\nYear: ${p.year ?? "n/a"}\nVenue: ${p.venue ?? "n/a"}\nAbstract: ${p.abstract || "(no abstract available — rely on title and general knowledge, and say so)"}`;
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You summarise academic papers for researchers. Reply in markdown with these sections: **TL;DR** (2 sentences), **Key contributions** (bullets), **Methods**, **Findings**, **Limitations**, **Why it matters**, **Questions to explore**. Be precise and never invent numbers.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (r.status === 429) return json({ error: "Too many requests, try again shortly." }, 429);
    if (r.status === 402) return json({ error: "AI credits exhausted." }, 402);
    if (!r.ok) return json({ error: "AI service error" }, 500);
    const out = await r.json();
    const summary = out.choices?.[0]?.message?.content?.trim();
    if (!summary) return json({ error: "Empty summary" }, 500);
    await supabase.from("saved_papers").update({ ai_summary: summary }).eq("id", paperId);
    return json({ summary });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
