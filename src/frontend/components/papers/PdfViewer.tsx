import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, Copy } from "lucide-react";
import { toast } from "sonner";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

type Props = { src: string; onText?: (text: string) => void };

export default function PdfViewer({ src, onText }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [doc, setDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [pageText, setPageText] = useState("");
  const [view, setView] = useState<"pdf" | "text">("pdf");

  useEffect(() => {
    let cancelled = false;
    setDoc(null); setError(null); setPage(1);
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/pdf-proxy?url=${encodeURIComponent(src)}`;
        const res = await fetch(url, { headers: session ? { Authorization: `Bearer ${session.access_token}` } : {} });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `Could not load PDF (${res.status})`);
        }
        const data = new Uint8Array(await res.arrayBuffer());
        const pdf = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;
        setDoc(pdf);
        // Extract full text (first 40 pages) for search / AI use
        const parts: string[] = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 40); i++) {
          const tc = await (await pdf.getPage(i)).getTextContent();
          parts.push(tc.items.map((it) => ("str" in it ? it.str : "")).join(" "));
        }
        if (!cancelled) onText?.(parts.join("\n\n"));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load PDF");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (!doc) return;
    let task: pdfjs.RenderTask | null = null;
    (async () => {
      const p = await doc.getPage(page);
      const tc = await p.getTextContent();
      setPageText(tc.items.map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : " ") : "")).join(""));
      const canvas = canvasRef.current;
      if (!canvas) return;
      const vp = p.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
      canvas.width = vp.width; canvas.height = vp.height;
      canvas.style.width = `${vp.width / (window.devicePixelRatio || 1)}px`;
      task = p.render({ canvasContext: canvas.getContext("2d")!, viewport: vp });
      await task.promise.catch(() => {});
    })();
    return () => task?.cancel();
  }, [doc, page, scale]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <FileText className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{error}</p>
        <Button asChild className="rounded-xl"><a href={src} target="_blank" rel="noreferrer">Open PDF directly</a></Button>
      </div>
    );
  }
  if (!doc) return <div className="h-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 p-2 border-b border-border bg-card/60">
        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-xs text-muted-foreground tabular-nums">{page} / {doc.numPages}</span>
        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={page >= doc.numPages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
        <div className="mx-2 h-4 w-px bg-border" />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setScale(Math.max(0.6, scale - 0.2))} aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setScale(Math.min(3, scale + 0.2))} aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></Button>
        <div className="flex-1" />
        <Button size="sm" variant={view === "text" ? "secondary" : "ghost"} className="h-8 text-xs" onClick={() => setView(view === "pdf" ? "text" : "pdf")}>
          {view === "pdf" ? "Show text" : "Show PDF"}
        </Button>
        {view === "text" && (
          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Copy text"
            onClick={() => { navigator.clipboard.writeText(pageText); toast.success("Page text copied"); }}>
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        <canvas ref={canvasRef} className={`mx-auto my-4 shadow-lg ${view === "pdf" ? "" : "hidden"}`} data-testid="pdf-canvas" />
        {view === "text" && (
          <pre className="whitespace-pre-wrap text-sm text-foreground p-6 font-sans leading-relaxed">{pageText || "No selectable text on this page (it may be a scanned image)."}</pre>
        )}
      </div>
    </div>
  );
}
