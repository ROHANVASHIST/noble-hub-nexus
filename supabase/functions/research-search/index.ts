// Aggregated research paper search across free academic APIs.
// Sources: arXiv, Semantic Scholar, OpenAlex, Crossref, PubMed, DOAJ.
// All sources are free and require no API key.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Paper {
  id: string;
  source: string;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string | null;
  url: string;
  pdfUrl: string | null;
  doi: string | null;
  venue: string | null;
  citations: number | null;
}

const clean = (s: string | null | undefined) =>
  (s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const withTimeout = async <T>(p: Promise<T>, ms: number): Promise<T | null> => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    const result = await Promise.race([
      p,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
    clearTimeout(t);
    return result as T | null;
  } catch {
    return null;
  }
};

// ---------------- arXiv (Atom XML) ----------------
async function searchArxiv(q: string, limit: number): Promise<Paper[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(q)}&start=0&max_results=${limit}&sortBy=relevance`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const xml = await r.text();
  const entries = xml.split("<entry>").slice(1);
  return entries.map((e): Paper => {
    const m = (re: RegExp) => (e.match(re)?.[1] ?? "").trim();
    const id = m(/<id>([^<]+)<\/id>/);
    const title = clean(m(/<title>([\s\S]*?)<\/title>/));
    const summary = clean(m(/<summary>([\s\S]*?)<\/summary>/));
    const published = m(/<published>([^<]+)<\/published>/);
    const authors = [...e.matchAll(/<name>([^<]+)<\/name>/g)].map((x) => x[1].trim());
    const pdf = e.match(/href="([^"]+\.pdf[^"]*)"/)?.[1] ?? null;
    return {
      id: `arxiv:${id}`,
      source: "arXiv",
      title,
      authors,
      year: published ? Number(published.slice(0, 4)) : null,
      abstract: summary,
      url: id,
      pdfUrl: pdf,
      doi: null,
      venue: "arXiv preprint",
      citations: null,
    };
  });
}

// ---------------- Semantic Scholar ----------------
async function searchSemanticScholar(q: string, limit: number): Promise<Paper[]> {
  const fields = "title,abstract,authors,year,venue,citationCount,externalIds,openAccessPdf,url";
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(q)}&limit=${limit}&fields=${fields}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j = await r.json();
  return (j.data ?? []).map((p: Record<string, unknown>): Paper => {
    const ids = (p.externalIds ?? {}) as Record<string, string>;
    const authors = (p.authors as Array<{ name: string }> | undefined)?.map((a) => a.name) ?? [];
    return {
      id: `s2:${p.paperId}`,
      source: "Semantic Scholar",
      title: clean(p.title as string),
      authors,
      year: (p.year as number) ?? null,
      abstract: clean(p.abstract as string),
      url: (p.url as string) ?? `https://www.semanticscholar.org/paper/${p.paperId}`,
      pdfUrl: (p.openAccessPdf as { url?: string } | null)?.url ?? null,
      doi: ids.DOI ?? null,
      venue: (p.venue as string) ?? null,
      citations: (p.citationCount as number) ?? null,
    };
  });
}

// ---------------- OpenAlex ----------------
async function searchOpenAlex(q: string, limit: number): Promise<Paper[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=${limit}`;
  const r = await fetch(url, { headers: { "User-Agent": "NobelHub/1.0 (mailto:research@nobelhub.app)" } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.results ?? []).map((w: Record<string, unknown>): Paper => {
    const authorships = (w.authorships as Array<{ author: { display_name: string } }>) ?? [];
    const oa = (w.open_access as { oa_url?: string } | undefined) ?? {};
    const pl = (w.primary_location as { source?: { display_name?: string } } | undefined) ?? {};
    return {
      id: `openalex:${w.id}`,
      source: "OpenAlex",
      title: clean(w.title as string),
      authors: authorships.map((a) => a.author.display_name),
      year: (w.publication_year as number) ?? null,
      abstract: null, // OpenAlex returns inverted index, skip for speed
      url: (w.id as string),
      pdfUrl: oa.oa_url ?? null,
      doi: (w.doi as string)?.replace("https://doi.org/", "") ?? null,
      venue: pl.source?.display_name ?? null,
      citations: (w.cited_by_count as number) ?? null,
    };
  });
}

// ---------------- Crossref ----------------
async function searchCrossref(q: string, limit: number): Promise<Paper[]> {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(q)}&rows=${limit}`;
  const r = await fetch(url, { headers: { "User-Agent": "NobelHub/1.0 (mailto:research@nobelhub.app)" } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.message?.items ?? []).map((it: Record<string, unknown>): Paper => {
    const authors = ((it.author as Array<{ given?: string; family?: string }>) ?? []).map(
      (a) => `${a.given ?? ""} ${a.family ?? ""}`.trim()
    );
    const date = (it["published-print"] ?? it["published-online"] ?? it.created) as { "date-parts"?: number[][] } | undefined;
    const year = date?.["date-parts"]?.[0]?.[0] ?? null;
    return {
      id: `crossref:${it.DOI}`,
      source: "Crossref",
      title: clean(((it.title as string[]) ?? [""])[0]),
      authors,
      year,
      abstract: clean((it.abstract as string) ?? ""),
      url: (it.URL as string) ?? `https://doi.org/${it.DOI}`,
      pdfUrl: null,
      doi: (it.DOI as string) ?? null,
      venue: ((it["container-title"] as string[]) ?? [])[0] ?? null,
      citations: (it["is-referenced-by-count"] as number) ?? null,
    };
  });
}

// ---------------- PubMed (E-utilities) ----------------
async function searchPubMed(q: string, limit: number): Promise<Paper[]> {
  const esearch = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${limit}&term=${encodeURIComponent(q)}`;
  const r1 = await fetch(esearch);
  if (!r1.ok) return [];
  const ids: string[] = (await r1.json()).esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];
  const esummary = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`;
  const r2 = await fetch(esummary);
  if (!r2.ok) return [];
  const result = (await r2.json()).result ?? {};
  return ids
    .map((id): Paper | null => {
      const p = result[id];
      if (!p) return null;
      const authors = ((p.authors as Array<{ name: string }>) ?? []).map((a) => a.name);
      const year = p.pubdate ? Number(String(p.pubdate).slice(0, 4)) : null;
      const doi = ((p.articleids as Array<{ idtype: string; value: string }>) ?? []).find((x) => x.idtype === "doi")?.value ?? null;
      return {
        id: `pubmed:${id}`,
        source: "PubMed",
        title: clean(p.title),
        authors,
        year: Number.isFinite(year) ? year : null,
        abstract: null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        pdfUrl: null,
        doi,
        venue: clean(p.fulljournalname || p.source),
        citations: null,
      };
    })
    .filter((p): p is Paper => p !== null);
}

// ---------------- DOAJ ----------------
async function searchDOAJ(q: string, limit: number): Promise<Paper[]> {
  const url = `https://doaj.org/api/search/articles/${encodeURIComponent(q)}?pageSize=${limit}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j = await r.json();
  return (j.results ?? []).map((it: Record<string, unknown>): Paper => {
    const bib = (it.bibjson as Record<string, unknown>) ?? {};
    const authors = ((bib.author as Array<{ name: string }>) ?? []).map((a) => a.name);
    const ids = ((bib.identifier as Array<{ type: string; id: string }>) ?? []);
    const doi = ids.find((x) => x.type === "doi")?.id ?? null;
    const links = ((bib.link as Array<{ url: string; type?: string }>) ?? []);
    const main = links[0]?.url ?? (doi ? `https://doi.org/${doi}` : "");
    const journal = (bib.journal as { title?: string } | undefined)?.title ?? null;
    return {
      id: `doaj:${it.id}`,
      source: "DOAJ",
      title: clean(bib.title as string),
      authors,
      year: bib.year ? Number(bib.year) : null,
      abstract: clean((bib.abstract as string) ?? ""),
      url: main,
      pdfUrl: links.find((l) => l.type === "fulltext")?.url ?? null,
      doi,
      venue: journal,
      citations: null,
    };
  });
}

// ---------------- Nobel Prize API (official) ----------------
// Public REST API at https://api.nobelprize.org/2.1 — no key required.
// Docs: https://www.nobelprize.org/about/developer-zone-2/
async function searchNobel(q: string, limit: number): Promise<Paper[]> {
  const url = `https://api.nobelprize.org/2.1/laureates?name=${encodeURIComponent(q)}&limit=${limit}&format=json`;
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) return [];
  const j = await r.json();
  const laureates = (j.laureates ?? []) as Array<Record<string, unknown>>;

  const tidy = (s: string) => s.replace(/^["“”\s]+|["“”\s.;,]+$/g, "").trim();
  const summarise = (s: string, max = 220) => {
    const t = tidy(s).replace(/\s+/g, " ");
    if (t.length <= max) return t;
    const cut = t.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
  };

  return laureates.flatMap((l): Paper[] => {
    const knownName = (l.knownName as { en?: string } | undefined)?.en;
    const fullName = (l.fullName as { en?: string } | undefined)?.en;
    const orgName = (l.orgName as { en?: string } | undefined)?.en;
    const displayName = knownName ?? fullName ?? orgName ?? "Unknown laureate";

    const prizes = (l.nobelPrizes as Array<Record<string, unknown>>) ?? [];
    const laureateLinks = (l.links as Array<{ href?: string; rel?: string }>) ?? [];
    const wiki = (l.wikipedia as { english?: string } | undefined)?.english;
    const laureateId = l.id ?? "";

    // Normalise category names from the API (which may be lowercase, abbreviated,
    // or vary between "economic sciences" / "economics") into a consistent label.
    const CATEGORY_LABELS: Record<string, string> = {
      physics: "Physics",
      chemistry: "Chemistry",
      medicine: "Physiology or Medicine",
      "physiology or medicine": "Physiology or Medicine",
      literature: "Literature",
      peace: "Peace",
      economics: "Economic Sciences",
      "economic sciences": "Economic Sciences",
      "the sveriges riksbank prize in economic sciences in memory of alfred nobel": "Economic Sciences",
    };
    const normaliseCategory = (raw: string): string => {
      const key = raw.trim().toLowerCase();
      if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
      return raw
        .trim()
        .split(/\s+/)
        .map((w) => (w.length <= 2 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
        .join(" ");
    };

    return prizes.map((pz, idx): Paper => {
      const rawCat = (pz.category as { en?: string } | undefined)?.en ?? "";
      const cat = rawCat ? normaliseCategory(rawCat) : "";
      const motivation = tidy((pz.motivation as { en?: string } | undefined)?.en ?? "");
      const year = pz.awardYear ? Number(pz.awardYear) : null;

      const prizeLabel = cat ? `Nobel Prize in ${cat}` : "Nobel Prize";

      const prizeLinks = (pz.links as Array<{ href?: string; rel?: string }>) ?? [];
      const prizeSelf = prizeLinks.find((x) => x.rel === "nobelPrize" || x.rel === "self")?.href;
      const laureateSelf = laureateLinks.find((x) => x.rel === "self")?.href;
      const canonicalPrize =
        year && cat
          ? `https://www.nobelprize.org/prizes/${cat.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}/${year}/summary/`
          : null;
      const href =
        prizeSelf ??
        canonicalPrize ??
        wiki ??
        (laureateId ? `https://www.nobelprize.org/prizes/lists/all-nobel-prizes/?laureate=${laureateId}` : null) ??
        laureateSelf ??
        "https://www.nobelprize.org/prizes/";

      const title = year
        ? `${displayName} — ${prizeLabel} (${year})`
        : `${displayName} — ${prizeLabel}`;
      const abstract = motivation
        ? `For ${summarise(motivation)}`
        : year
          ? `Laureate of the ${prizeLabel} (${year}).`
          : `Laureate of the ${prizeLabel}.`;

      return {
        id: `nobel:${laureateId || displayName}-${year ?? "x"}-${idx}`,
        source: "Nobel Prize",
        title,
        authors: [displayName],
        year,
        abstract,
        url: href,
        pdfUrl: null,
        doi: null,
        venue: cat
          ? `NobelPrize.org · ${cat}${year ? ` · ${year}` : ""}`
          : `NobelPrize.org${year ? ` · ${year}` : ""}`,
        citations: null,
      };
    });
  });
}

const SOURCES: Record<string, (q: string, n: number) => Promise<Paper[]>> = {
  arxiv: searchArxiv,
  semantic_scholar: searchSemanticScholar,
  openalex: searchOpenAlex,
  crossref: searchCrossref,
  pubmed: searchPubMed,
  doaj: searchDOAJ,
  nobel: searchNobel,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 10), 1), 25);
    const requested = (url.searchParams.get("sources") ?? "arxiv,semantic_scholar,openalex,crossref,pubmed,doaj,nobel")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s in SOURCES);

    if (!q || q.length < 2) {
      return new Response(JSON.stringify({ error: "Query must be at least 2 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (q.length > 200) {
      return new Response(JSON.stringify({ error: "Query too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const settled = await Promise.allSettled(
      requested.map((s) => withTimeout(SOURCES[s](q, limit), 8000))
    );

    const bySource: Record<string, Paper[]> = {};
    const errors: string[] = [];
    settled.forEach((res, i) => {
      const src = requested[i];
      if (res.status === "fulfilled" && res.value) bySource[src] = res.value;
      else { bySource[src] = []; errors.push(src); }
    });

    const merged = Object.values(bySource).flat();

    return new Response(
      JSON.stringify({ query: q, count: merged.length, bySource, errors, results: merged }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
