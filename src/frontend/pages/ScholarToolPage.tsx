import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Sparkles, Send, FileText, Search, Layers, Cpu, Brain, ShieldCheck, Zap,
    History, Save, Share2, Download, TrendingUp, Loader2, Copy, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useScholarData } from "@/frontend/hooks/useScholarData";

interface ToolConfig {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    placeholder: string;
    accentColor: string;
    category: string;
    suggestions: string[];
}

const TOOL_CONFIGS: Record<string, ToolConfig> = {
    'semantic-search': {
        id: 'semantic-search', title: 'Semantic Search Engine',
        description: 'Deep neural search that understands research intent beyond keywords. Returns comprehensive analysis with real citations.',
        icon: <Search className="h-6 w-6" />, placeholder: 'Describe the concept or research problem you are investigating...',
        accentColor: 'blue', category: 'Discovery',
        suggestions: ['Quantum entanglement in biological systems', 'Ethical implications of CRISPR gene editing in human embryos', 'Transformer architectures for protein folding prediction', 'Carbon capture and storage efficiency comparison']
    },
    'pdf-parser': {
        id: 'pdf-parser', title: 'PDF Structural Parser',
        description: 'Extract semantics, method constraints, and hidden metadata from research papers with publication-ready analysis.',
        icon: <FileText className="h-6 w-6" />, placeholder: 'Paste text or describe findings you want to extract from a PDF...',
        accentColor: 'emerald', category: 'Discovery',
        suggestions: ['Extract methodology from a machine learning paper', 'Summarize key mathematical proofs and theorems', 'Identify all primary citations and their roles', 'Analyze statistical methods and sample sizes']
    },
    'gap-analysis': {
        id: 'gap-analysis', title: 'Research Gap Analysis',
        description: 'AI-driven identification of untrodden paths in current literature with feasibility assessment and publication strategy.',
        icon: <Zap className="h-6 w-6" />, placeholder: 'Enter a research topic to find unexplored areas...',
        accentColor: 'amber', category: 'Discovery',
        suggestions: ['Gaps in current AI safety and alignment research', 'Under-researched areas of dark matter detection', 'Missing datasets in urban climate modeling', 'Unexplored applications of mRNA technology beyond vaccines']
    },
    'limitation-extractor': {
        id: 'limitation-extractor', title: 'Limitation Extractor',
        description: 'Automatically isolate study constraints, threats to validity, and generalizability bounds with severity ratings.',
        icon: <ShieldCheck className="h-6 w-6" />, placeholder: 'Paste a paper abstract or conclusion to extract limitations...',
        accentColor: 'rose', category: 'Understanding',
        suggestions: ['Analyze sampling bias in clinical trials', 'Identify hardware and computational constraints', 'Statistical significance and power analysis issues', 'External validity threats in social science studies']
    },
    'equation-explainer': {
        id: 'equation-explainer', title: 'Equation Explainer',
        description: 'Breaking down complex formalisms into intuitive frameworks with derivations, analogies, and implementation guides.',
        icon: <Cpu className="h-6 w-6" />, placeholder: 'Paste an equation (LaTeX or text) or describe a formula...',
        accentColor: 'purple', category: 'Understanding',
        suggestions: ["Explain Bell's Inequality and its physical meaning", 'Deconstruct the Black-Scholes option pricing model', 'Visual breakdown of Schrödinger equation', 'Explain the attention mechanism equation in transformers']
    },
    'compare-papers': {
        id: 'compare-papers', title: 'Paper Comparative Engine',
        description: 'Side-by-side analysis of methodologies, results, and impact across multiple papers with synthesis recommendations.',
        icon: <Layers className="h-6 w-6" />, placeholder: 'Describe the two papers or methodologies you want to compare...',
        accentColor: 'cyan', category: 'Understanding',
        suggestions: ['Compare BERT vs GPT-4 architectures', 'Contrast Keynesian vs Austrian economics', 'RAG vs Fine-tuning for domain-specific LLMs', 'Compare CRISPR-Cas9 vs base editing approaches']
    },
    'tone-checker': {
        id: 'tone-checker', title: 'Academic Tone Refiner',
        description: 'Refining your manuscript for Nature, Science, and Cell-level publication standards with complete rewrites.',
        icon: <Sparkles className="h-6 w-6" />, placeholder: 'Paste your draft text here to evaluate academic rigor...',
        accentColor: 'indigo', category: 'Writing Assistant',
        suggestions: ['Is this abstract too informal for Nature?', 'Convert to Science journal style', 'Identify passive voice clusters and fix them', 'Improve hedging language precision']
    },
    'lit-review': {
        id: 'lit-review', title: 'Auto-Lit Review',
        description: 'Drafting comprehensive thematic reviews with real citations, synthesis matrices, and research agendas.',
        icon: <History className="h-6 w-6" />, placeholder: 'Enter your research focus to generate a review draft...',
        accentColor: 'orange', category: 'Writing Assistant',
        suggestions: ['Literature review on carbon capture technologies 2020-2025', 'Historical context of gene editing from restriction enzymes to CRISPR', 'Solid-state battery trajectory and commercialization', 'Review of federated learning in healthcare']
    },
    'scholar-ai': {
        id: 'scholar-ai', title: 'Scholar AI Assistant',
        description: 'Your open-ended research collaborator. Expert-level guidance on any research question with actionable next steps.',
        icon: <Brain className="h-6 w-6" />, placeholder: 'Ask me a question about your research or methodology...',
        accentColor: 'violet', category: 'General AI',
        suggestions: ['How do I structure a paper for Nature?', 'Design a robust experimental methodology', 'Find 3 novel angles for my thesis on AI ethics', 'Help me write a compelling grant proposal abstract']
    },
    'highlight-sync': {
        id: 'highlight-sync', title: 'Highlight Synthesis',
        description: 'Organize reading highlights into a unified knowledge graph with thematic clusters and gap analysis.',
        icon: <Layers className="h-6 w-6" />, placeholder: 'Paste your research highlights or notes...',
        accentColor: 'indigo', category: 'Knowledge Base',
        suggestions: ['Synthesize highlights from 3 papers on neural architecture search', 'Merge notes on thermodynamics of black holes', 'Organize notes from a conference workshop']
    },
    'citation-graph': {
        id: 'citation-graph', title: 'Citation Network Mapping',
        description: 'Visualizing the historical and conceptual lineage of research with upstream and downstream influence analysis.',
        icon: <Share2 className="h-6 w-6" />, placeholder: 'Enter a seed paper or author to map their network...',
        accentColor: 'slate', category: 'Knowledge Base',
        suggestions: ['Map influence of John Hopfield on modern AI', 'Trace the CRISPR patent lineage', 'Bridge between physics and machine learning research', 'Citation network of Transformer architecture paper']
    },
    'influence-explorer': {
        id: 'influence-explorer', title: 'Influence Explorer',
        description: 'Identify impactful studies, hidden gem papers, and rising stars in any research area.',
        icon: <TrendingUp className="h-6 w-6" />, placeholder: 'Enter a research area to find primary influencers...',
        accentColor: 'green', category: 'Knowledge Base',
        suggestions: ['Top researchers in LLM safety and alignment', 'Who defined the field of quantum error correction?', 'Foundational gene therapy papers and their legacy', 'Rising stars in computational neuroscience']
    }
};

const ScholarToolPage = () => {
    const { toolId } = useParams();
    const navigate = useNavigate();
    const { addNote } = useScholarData();
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedResult, setEditedResult] = useState("");
    const [history, setHistory] = useState<{ prompt: string, result: string, timestamp: string }[]>([]);

    const config = (toolId && TOOL_CONFIGS[toolId]) || TOOL_CONFIGS['semantic-search'];

    const wordCount = (result || "").split(/\s+/).filter(Boolean).length;

    const handleExecute = async () => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        setResult(null);
        setIsEditing(false);
        setEditedResult("");

        const TOOL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scholar-tool`;
        let fullText = "";

        try {
            const resp = await fetch(TOOL_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({
                    prompt: prompt,
                    toolId: toolId || 'semantic-search',
                    toolTitle: config.title,
                    toolCategory: config.category,
                }),
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                throw new Error(errData.error || `Error ${resp.status}`);
            }

            if (!resp.body) throw new Error("No response body");

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let textBuffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                textBuffer += decoder.decode(value, { stream: true });

                let newlineIndex: number;
                while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
                    let line = textBuffer.slice(0, newlineIndex);
                    textBuffer = textBuffer.slice(newlineIndex + 1);
                    if (line.endsWith("\r")) line = line.slice(0, -1);
                    if (line.startsWith(":") || line.trim() === "") continue;
                    if (!line.startsWith("data: ")) continue;
                    const jsonStr = line.slice(6).trim();
                    if (jsonStr === "[DONE]") break;
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            fullText += content;
                            setResult(fullText);
                        }
                    } catch {
                        textBuffer = line + "\n" + textBuffer;
                        break;
                    }
                }
            }

            if (!fullText) fullText = "No response generated. Please try again.";
            setResult(fullText);
            const newHistory = { prompt, result: fullText, timestamp: new Date().toLocaleTimeString() };
            setHistory(prev => [newHistory, ...prev]);

            await addNote({
                title: `${config.title} — ${prompt.slice(0, 60)}`,
                content: `**Query:** ${prompt}\n\n---\n\n${fullText}`,
                type: 'insight'
            });
            toast.success("Result saved to Lab Notes");
        } catch (error: any) {
            console.error("Scholar tool error:", error);
            toast.error(error.message || "Failed to get AI response. Please try again.");
            setResult("An error occurred while processing your request. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const copyResult = () => {
        if (result) {
            navigator.clipboard.writeText(editedResult || result);
            toast.success("Copied to clipboard");
        }
    };

    const resetTool = () => {
        setPrompt("");
        setResult(null);
        setIsEditing(false);
        setEditedResult("");
    };

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        className="rounded-xl font-bold uppercase text-[10px] tracking-widest text-muted-foreground"
                        onClick={() => navigate("/research")}
                    >
                        <ArrowLeft className="h-3 w-3 mr-2" /> Back to Research Archive
                    </Button>
                    {result && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold uppercase" onClick={copyResult}>
                                <Copy className="h-3 w-3 mr-1" /> Copy
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold uppercase" onClick={resetTool}>
                                <RotateCcw className="h-3 w-3 mr-1" /> New Query
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Panel */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-sm"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner">
                                {config.icon}
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">{config.category}</span>
                                <h1 className="text-3xl font-display font-bold">{config.title}</h1>
                                <p className="text-muted-foreground leading-relaxed">{config.description}</p>
                            </div>

                            <div className="mt-8 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Suggestions</h4>
                                <div className="space-y-2">
                                    {config.suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPrompt(s)}
                                            className="w-full text-left p-3 text-xs bg-secondary/50 rounded-xl hover:bg-secondary transition-colors border border-border/30 italic text-muted-foreground hover:text-foreground line-clamp-2"
                                        >
                                            "{s}"
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent History */}
                        <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-muted-foreground">
                                <History className="h-4 w-4" /> Tool History
                            </h3>
                            <div className="space-y-4">
                                {history.map((h, i) => (
                                    <button key={i} onClick={() => { setPrompt(h.prompt); setResult(h.result); }}
                                        className="w-full text-left p-4 bg-secondary/30 rounded-2xl border border-border/30 hover:bg-secondary/50 transition-colors">
                                        <p className="text-[10px] font-bold text-primary mb-1 uppercase">{h.timestamp}</p>
                                        <p className="text-xs font-medium line-clamp-2">{h.prompt}</p>
                                    </button>
                                ))}
                                {history.length === 0 && (
                                    <div className="text-center py-4 text-xs text-muted-foreground italic">No history yet</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="lg:col-span-8 flex flex-col space-y-8">
                        {/* Input Area */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border/50 rounded-[3rem] p-10 shadow-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Brain className="h-32 w-32 " />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-500" /> Virtual Workspace
                                    </h2>
                                    <p className="text-muted-foreground text-sm">Powered by advanced AI • Results auto-saved to Lab Notes</p>
                                </div>

                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={config.placeholder}
                                        className="w-full h-40 bg-secondary/30 border border-border/50 rounded-[2rem] p-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                    <Button
                                        disabled={!prompt.trim() || isProcessing}
                                        onClick={handleExecute}
                                        className="absolute bottom-6 right-6 h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                    >
                                        {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                                        {isProcessing ? "Computing..." : "Execute Tool"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Result Area */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-card border border-border/50 rounded-[3rem] p-10 shadow-sm flex-1"
                                >
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                <Cpu className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{isEditing ? "Editing Result" : "Generated Insights"}</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{wordCount} words • Auto-saved</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="rounded-xl h-9 px-3 text-[10px] font-bold uppercase" onClick={copyResult}>
                                                <Copy className="h-3 w-3 mr-1" /> Copy
                                            </Button>
                                            <Button
                                                variant="ghost" size="sm"
                                                className={`rounded-xl h-9 px-4 font-bold uppercase text-[10px] tracking-widest ${isEditing ? 'bg-primary/20 text-primary' : 'border border-border/50'}`}
                                                onClick={() => { if (!isEditing) setEditedResult(result); setIsEditing(!isEditing); }}
                                            >
                                                {isEditing ? "Done" : "Edit"}
                                            </Button>
                                            <Button variant="outline" size="sm" className="rounded-xl border-border/50 h-9 w-9 p-0" onClick={() => {
                                                const printWindow = window.open('', '_blank');
                                                if (printWindow) {
                                                    printWindow.document.write(`<html><head><title>${config.title} Report</title><style>body{font-family:'Georgia',serif;padding:60px;max-width:800px;margin:0 auto;color:#1a1a1a;line-height:1.8;}h1{color:#6d28d9;border-bottom:2px solid #6d28d9;padding-bottom:10px;}h2{color:#374151;margin-top:30px;}h3{color:#6b7280;}blockquote{border-left:4px solid #6d28d9;padding-left:16px;color:#4b5563;font-style:italic;}code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:13px;}table{width:100%;border-collapse:collapse;margin:20px 0;}th,td{border:1px solid #d1d5db;padding:8px 12px;text-align:left;}th{background:#f9fafb;}ul,ol{padding-left:24px;}strong{color:#1f2937;}.footer{margin-top:60px;border-top:1px solid #e5e7eb;padding-top:20px;font-size:11px;color:#9ca3af;}</style></head><body><h1>${config.title} Report</h1><div class="meta" style="color:#6b7280;font-size:12px;margin-bottom:30px;">Generated: ${new Date().toLocaleString()} | Words: ${wordCount}</div><div>${(editedResult || result).replace(/\n/g, '<br>')}</div><div class="footer">Generated by PhD Research OS — Noble Hub Nexus</div></body></html>`);
                                                    printWindow.document.close();
                                                    printWindow.print();
                                                }
                                            }}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="prose prose-sm max-w-none leading-relaxed">
                                        {isEditing ? (
                                            <textarea
                                                value={editedResult}
                                                onChange={(e) => setEditedResult(e.target.value)}
                                                className="w-full h-80 bg-secondary/30 border border-border/50 rounded-2xl p-6 font-serif text-lg focus:outline-none focus:ring-1 focus:ring-primary/40 leading-relaxed resize-none"
                                            />
                                        ) : (
                                            <div className="bg-secondary/20 p-8 rounded-[2rem] border border-border/30 prose prose-sm max-w-none">
                                                <ReactMarkdown>{editedResult || result}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>

                                    {!isEditing && (
                                        <div className="mt-12 flex justify-center gap-4">
                                            <Button
                                                className="rounded-2xl h-14 px-12 font-black shadow-lg shadow-primary/20"
                                                onClick={async () => {
                                                    await addNote({
                                                        title: `${config.title} — Breakthrough`,
                                                        content: `**Query:** ${prompt}\n\n---\n\n${editedResult || result}`,
                                                        type: 'breakthrough'
                                                    });
                                                    toast.success("Saved as breakthrough to your profile");
                                                    navigate("/profile");
                                                }}
                                            >
                                                <Save className="h-5 w-5 mr-2" /> Save as Breakthrough
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Empty State */}
                        {!result && !isProcessing && (
                            <div className="flex-1 rounded-[3rem] border-2 border-dashed border-border/30 flex flex-col items-center justify-center text-muted-foreground p-12 text-center opacity-60">
                                <Cpu className="h-12 w-12 mb-4" />
                                <p className="text-lg font-display font-bold">Ready for Your Query</p>
                                <p className="text-sm mt-2 max-w-md">Enter a research question above or click a suggestion to get started. Results are automatically saved to your Lab Notes.</p>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="flex-1 rounded-[3rem] bg-secondary/10 border border-border/30 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                                <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                                <h3 className="text-2xl font-display font-bold">Generating Research Analysis</h3>
                                <p className="text-muted-foreground mt-2 text-sm">This may take 15-30 seconds for comprehensive results...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ScholarToolPage;
