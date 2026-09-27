import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_BYTES = 40 * 1024 * 1024;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data, error } = await supabase.auth.getClaims(auth.slice(7));
  if (error || !data?.claims) return json({ error: "Unauthorized" }, 401);

  const raw = new URL(req.url).searchParams.get("url") || "";
  let target: URL;
  try {
    target = new URL(raw.replace(/^http:\/\//, "https://"));
  } catch {
    return json({ error: "Invalid url" }, 400);
  }
  if (target.protocol !== "https:" || /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(target.hostname)) {
    return json({ error: "URL not allowed" }, 400);
  }

  try {
    const res = await fetch(target.toString(), {
      redirect: "follow",
      headers: { "User-Agent": "NobelHub/1.0 (research reader)", Accept: "application/pdf,*/*" },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return json({ error: `Source returned ${res.status}` }, 502);
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) return json({ error: "PDF too large" }, 413);
    const head = new TextDecoder().decode(buf.slice(0, 5));
    if (head !== "%PDF-") return json({ error: "Source did not return a PDF" }, 415);
    return new Response(buf, { headers: { ...corsHeaders, "Content-Type": "application/pdf" } });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Fetch failed" }, 502);
  }
});
