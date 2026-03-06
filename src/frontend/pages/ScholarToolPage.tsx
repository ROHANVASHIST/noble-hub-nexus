import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Sparkles,
    Send,
    FileText,
    Search,
    Layers,
    Cpu,
    Brain,
    ShieldCheck,
    Zap,
    History,
    Save,
    Share2,
    Download,
    TrendingUp,
    Quote,
    Loader2
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
        id: 'semantic-search',
        title: 'Semantic Search Engine',
        description: 'Deep neural search that understands research intent beyond keywords.',
        icon: <Search className="h-6 w-6" />,
        placeholder: 'Describe the concept or research problem you are investigating...',
        accentColor: 'blue',
        category: 'Discovery',
        suggestions: ['Quantum entanglement in biological systems', 'Ethical implications of CRISPR', 'Stable coins and inflation']
    },
    'pdf-parser': {
        id: 'pdf-parser',
        title: 'PDF Structural Parser',
        description: 'Extract semantics, method constraints, and hidden metadata from research papers.',
        icon: <FileText className="h-6 w-6" />,
        placeholder: 'Paste text or describe findings you want to extract from a PDF...',
        accentColor: 'emerald',
        category: 'Discovery',
        suggestions: ['Extract methodology settings', 'Summarize key mathematical proofs', 'Identify all primary citations']
    },
    'gap-analysis': {
        id: 'gap-analysis',
        title: 'Research Gap Analysis',
        description: 'AI-driven identification of untrodden paths in current literature.',
        icon: <Zap className="h-6 w-6" />,
        placeholder: 'Enter a research topic to find unexplored areas...',
        accentColor: 'amber',
        category: 'Discovery',
        suggestions: ['Gaps in current AI safety frameworks', 'Under-researched areas of dark matter', 'Missing datasets in urban studies']
    },
    'limitation-extractor': {
        id: 'limitation-extractor',
        title: 'Limitation Extractor',
        description: 'Automatically isolate study constraints and generalizability bounds.',
        icon: <ShieldCheck className="h-6 w-6" />,
        placeholder: 'Paste a paper abstract or conclusion to extract limitations...',
        accentColor: 'rose',
        category: 'Understanding',
        suggestions: ['What are the sampling errors?', 'Identify hardware constraints', 'Statistical significance boundaries']
    },
    'equation-explainer': {
        id: 'equation-explainer',
        title: 'Equation Explainer',
        description: 'Breaking down complex formalisms into intuitive conceptual frameworks.',
        icon: <Cpu className="h-6 w-6" />,
        placeholder: 'Paste an equation (Latex or text) or describe a formula...',
        accentColor: 'purple',
        category: 'Understanding',
        suggestions: ['Explain Bell Inequality', 'Deconstruct Black-Scholes', 'Visual breakdown of Schrodinger']
    },
    'compare-papers': {
        id: 'compare-papers',
        title: 'Paper Comparative Engine',
        description: 'Side-by-side analysis of methodologies and results across multiple papers.',
        icon: <Layers className="h-6 w-6" />,
        placeholder: 'Describe the two papers or methodologies you want to compare...',
        accentColor: 'cyan',
        category: 'Understanding',
        suggestions: ['Compare BERT vs T5', 'Contrast Keynesian vs Monetarist', 'RAG vs Fine-tuning']
    },
    'tone-checker': {
        id: 'tone-checker',
        title: 'Academic Tone Refiner',
        description: 'Refining your manuscript for high-impact journal standards.',
        icon: <Sparkles className="h-6 w-6" />,
        placeholder: 'Paste your draft text here to evaluate academic rigor...',
        accentColor: 'indigo',
        category: 'Writing Assistant',
        suggestions: ['Is this abstract too informal?', 'Convert to Nature-style tone', 'Identify passive voice clusters']
    },
    'lit-review': {
        id: 'lit-review',
        title: 'Auto-Lit Review',
        description: 'Drafting comprehensive thematic reviews from your citation matrix.',
        icon: <History className="h-6 w-6" />,
        placeholder: 'Enter your research focus to generate a review draft...',
        accentColor: 'orange',
        category: 'Writing Assistant',
        suggestions: ['Review of carbon capture 2024', 'Historical context of gene editing', 'Solid-state batteries trajectory']
    },
    'scholar-ai': {
        id: 'scholar-ai',
        title: 'Scholar AI Assistant',
        description: 'Your open-ended research collaborator. Ask anything about your research.',
        icon: <Brain className="h-6 w-6" />,
        placeholder: 'Ask me a question about your research or methodology...',
        accentColor: 'violet',
        category: 'General AI',
        suggestions: ['How do I structure a Nature paper?', 'Explain peer review', 'Find 3 novel angles for my thesis']
    },
    'highlight-sync': {
        id: 'highlight-sync',
        title: 'Highlight Synthesis',
        description: 'Syncing reading highlights across devices into a unified knowledge graph.',
        icon: <Layers className="h-6 w-6" />,
        placeholder: 'Describe your sync source or highlight collection...',
        accentColor: 'indigo',
        category: 'Knowledge Base',
        suggestions: ['Sync highlights from last 3 papers', 'Merge notes on thermal dynamics', 'Export Kindle highlights']
    },
    'citation-graph': {
        id: 'citation-graph',
        title: 'Citation Network Mapping',
        description: 'Visualizing the historical and conceptual lineage of your research.',
        icon: <Share2 className="h-6 w-6" />,
        placeholder: 'Enter a seed paper or author to map their network...',
        accentColor: 'slate',
        category: 'Knowledge Base',
        suggestions: ['Map influence of John Hopfield', 'Visualize CRISPR patent lineage', 'Bridge Physics and AI']
    },
    'influence-explorer': {
        id: 'influence-explorer',
        title: 'Influence Explorer',
        description: 'Identify impactful studies and hidden gem papers in your area.',
        icon: <TrendingUp className="h-6 w-6" />,
        placeholder: 'Enter a research area to find primary influencers...',
        accentColor: 'green',
        category: 'Knowledge Base',
        suggestions: ['Top researchers in LLM safety', 'Who defined the Higgs field?', 'Foundational gene therapy papers']
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
                title: `${config.title} Fragment`,
                content: `Prompt: ${prompt}\n\nResult:\n${fullText}`,
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

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <Button
                    variant="ghost"
                    className="mb-8 rounded-xl font-bold uppercase text-[10px] tracking-widest text-muted-foreground"
                    onClick={() => navigate("/research")}
                >
                    <ArrowLeft className="h-3 w-3 mr-2" /> Back to Research Archive
                </Button>

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
                                            className="w-full text-left p-3 text-xs bg-secondary/50 rounded-xl hover:bg-secondary transition-colors border border-border/30 italic text-muted-foreground hover:text-foreground line-clamp-1"
                                        >
                                            "{s}"
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent History */}
                        <div className="bg-slate-900/40 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-sm">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-slate-400">
                                <History className="h-4 w-4" /> Tool History
                            </h3>
                            <div className="space-y-4">
                                {history.map((h, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-bold text-primary mb-1 uppercase">{h.timestamp}</p>
                                        <p className="text-xs font-medium line-clamp-1 text-slate-300">{h.prompt}</p>
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="text-center py-4 text-xs text-slate-600 italic">No history yet</div>
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
                            className="bg-slate-950 rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Brain className="h-32 w-32 " />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                                        <Zap className="h-5 w-5 text-amber-500" /> Virtual Workspace
                                    </h2>
                                    <p className="text-slate-400 text-sm">Status: <span className="text-emerald-500 font-mono text-[10px]">OS_SYNC_COMPLETED</span></p>
                                </div>

                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={config.placeholder}
                                        className="w-full h-40 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                    <Button
                                        disabled={!prompt.trim() || isProcessing}
                                        onClick={handleExecute}
                                        className="absolute bottom-6 right-6 h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                    >
                                        {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                                        {isProcessing ? "Computing..." : "Execute tool"}
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
                                    className="bg-card border border-border/50 rounded-[3rem] p-10 shadow-2xl flex-1"
                                >
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                <Cpu className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight text-white">{isEditing ? "Editing Result" : "Generated Insights"}</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">ENGINE_SOURCE: NOBLE_HUB_AI</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`rounded-xl h-9 px-4 font-bold uppercase text-[10px] tracking-widest ${isEditing ? 'bg-primary/20 text-primary' : 'text-slate-400 border border-white/5'}`}
                                                onClick={() => {
                                                    if (!isEditing) setEditedResult(result);
                                                    setIsEditing(!isEditing);
                                                }}
                                            >
                                                {isEditing ? "Done" : "Edit"}
                                            </Button>
                                            <Button variant="outline" size="sm" className="rounded-xl border-white/5 h-9 w-9 p-0 text-slate-400" onClick={() => {
                                                const printWindow = window.open('', '_blank');
                                                if (printWindow) {
                                                    printWindow.document.write(`<html><body style="font-family:sans-serif;padding:40px;"><h1>${config.title} Report</h1><pre style="white-space:pre-wrap;">${editedResult || result}</pre></body></html>`);
                                                    printWindow.document.close();
                                                    printWindow.print();
                                                }
                                            }}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                                        {isEditing ? (
                                            <textarea
                                                value={editedResult}
                                                onChange={(e) => setEditedResult(e.target.value)}
                                                className="w-full h-80 bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-serif text-lg focus:outline-none focus:ring-1 focus:ring-primary/40 leading-relaxed resize-none"
                                            />
                                        ) : (
                                            <div className="font-serif text-lg bg-secondary/20 p-8 rounded-[2rem] border border-border/30 prose prose-sm max-w-none">
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
                                                        title: `${config.title} Validated`,
                                                        content: editedResult || (result as string),
                                                        type: 'breakthrough'
                                                    });
                                                    toast.success("Final result saved to breakthrough notes");
                                                    navigate("/profile");
                                                }}
                                            >
                                                Save as Breakthrough
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Empty State */}
                        {!result && !isProcessing && (
                            <div className="flex-1 rounded-[3rem] border-2 border-dashed border-border/30 flex flex-col items-center justify-center text-muted-foreground p-12 text-center opacity-40">
                                <Cpu className="h-12 w-12 mb-4" />
                                <p className="text-lg font-display">Kernel Active. Awaiting Command.</p>
                                <p className="text-[10px] mt-2 uppercase font-black tracking-widest text-slate-500">The Virtualized Scholar Environment is ready for processing.</p>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="flex-1 rounded-[3rem] bg-slate-900/10 border border-white/5 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                                <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                                <h3 className="text-2xl font-display font-bold text-white">Neural Synthesis in Progress</h3>
                                <p className="text-slate-500 mt-2 font-mono text-[10px] animate-pulse tracking-[0.4em]">ACCESSING_GLOBAL_CROSS_REF_DATABASE</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ScholarToolPage;
