import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Brain,
    Search,
    Lightbulb,
    Microscope,
    Dna,
    ArrowRight,
    MonitorPlay,
    Trophy,
    ArrowLeft,
    Sparkles,
    Cpu,
    Layers,
    FileText,
    Users,
    Save,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useScholarData } from "@/frontend/hooks/useScholarData";

const ScientificSkills = () => {
    const navigate = useNavigate();
    const [activeModule] = useState(0);
    const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
    const [simulationStep, setSimulationStep] = useState(0);
    const [simulationProgress, setSimulationProgress] = useState(0);
    const [labTab, setLabTab] = useState<'console' | 'riddles' | 'notebook'>('console');
    const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
    const [researchTopic, setResearchTopic] = useState("");
    const { addProject, addNote, notes } = useScholarData();
    const [researchLogs, setResearchLogs] = useState<{ timestamp: string, message: string, type: 'info' | 'success' | 'warning' }[]>([
        { timestamp: new Date().toLocaleTimeString(), message: "Laboratory initialized. System ready.", type: 'info' }
    ]);
    const [skillInput, setSkillInput] = useState("");
    const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);
    const [generatedInsight, setGeneratedInsight] = useState<string | null>(null);

    // Notebook state
    const [notebookTitle, setNotebookTitle] = useState("");
    const [notebookContent, setNotebookContent] = useState("");
    const [notebookType, setNotebookType] = useState<'note' | 'insight' | 'breakthrough'>('note');
    const [isSavingNote, setIsSavingNote] = useState(false);

    const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
        setResearchLogs(prev => [
            { timestamp: new Date().toLocaleTimeString(), message, type },
            ...prev.slice(0, 24)
        ]);
    };

    const modules = [
        {
            title: "Evidence & Iteration",
            icon: <Search className="h-6 w-6" />,
            description: "Learn how Nobel laureates refine their hypotheses through rigorous data collection and constant iteration.",
            examples: ["Marie Curie's refinement of pitchblende", "Einstein's multiple versions of General Relativity"],
            skills: ["Data Validation", "Hypothesis Refinement", "Systematic Review"]
        },
        {
            title: "Modeling Complexity",
            icon: <Brain className="h-6 w-6" />,
            description: "Master the art of creating simplified models of complex systems in Physics and Chemistry.",
            examples: ["Bohr Model of the Atom", "Pauling's molecular structures"],
            skills: ["Mathematical Modeling", "Simplification Principles", "Scaling Analysis"]
        },
        {
            title: "Detecting Bias",
            icon: <Lightbulb className="h-6 w-6" />,
            description: "Identify cognitive biases and systematic errors that can lead research astray.",
            examples: ["Kahneman's work on Prospect Theory", "Blind testing in pharmaceutical Nobel discoveries"],
            skills: ["Critical Thinking", "Statistical Bias", "Cognitive Awareness"]
        }
    ];

    const riddles = [
        { text: "I studied radioactivity, won awards in two different sciences, but was never allowed to enter the French Academy.", answer: "Marie Curie", options: ["Marie Curie", "Lise Meitner", "Rosalind Franklin", "Tu Youyou"] },
        { text: "I was a safe-cracker in my spare time, but my real work was in quantum electrodynamics and nanotechnology.", answer: "Richard Feynman", options: ["Richard Feynman", "John Wheeler", "Murray Gell-Mann", "Freeman Dyson"] },
        { text: "I discovered that DNA has a double helix structure, though my name is often mentioned alongside Watson and Crick.", answer: "Rosalind Franklin", options: ["Rosalind Franklin", "Barbara McClintock", "Ada Yonath", "Jennifer Doudna"] }
    ];

    const handleRiddleAnswer = (option: string) => {
        if (option === riddles[currentRiddleIndex].answer) {
            toast.success("Correct! Identification verified.");
            setTimeout(() => setCurrentRiddleIndex((prev) => (prev + 1) % riddles.length), 1000);
        } else {
            toast.error("Incorrect sequence. Verification failed.");
        }
    };

    const startSimulation = () => {
        if (!researchTopic) { toast.error("Please specify a research topic first."); return; }
        setSimulationStep(2);
        setSimulationProgress(0);
        addLog(`Initializing research on: ${researchTopic}...`, "info");

        const interval = setInterval(() => {
            setSimulationProgress((prev) => {
                const next = prev + 4;
                if (next % 20 === 0 && next < 100) {
                    const messages = ["Synthesizing citation networks...", "Downloading Nobel archive metadata...", "Applying NLP to research abstracts...", "Aggregating expert commentary..."];
                    addLog(messages[Math.floor(next / 20) - 1], "info");
                }
                if (next >= 100) { clearInterval(interval); setSimulationStep(3); addLog(`Data synthesis for "${researchTopic}" completed.`, "success"); return 100; }
                return next;
            });
        }, 120);
    };

    const competeAnalysis = () => {
        addLog(`Deploying AI models to analyze "${researchTopic}" dataset...`, "info");
        toast.promise(new Promise(resolve => setTimeout(resolve, 3000)), { loading: 'Cross-referencing papers and lectures...', success: 'Analysis complete!', error: 'Analysis timeout.' });
        setTimeout(() => { setSimulationStep(4); addLog("Hypothesis validation complete.", "success"); }, 3500);
    };

    const handleSaveResearch = async () => {
        await addProject({ name: `${researchTopic} Research Path`, topic: researchTopic, discovery: "Successfully mapped the research trajectory and identified 3 key gaps in current literature." });
        toast.success("Research path saved to your profile!");
        navigate("/profile");
    };

    const handleGenerateInsight = async () => {
        if (!skillInput.trim() || selectedSkill === null) return;
        setIsGeneratingSkill(true);
        setGeneratedInsight("");

        try {
            const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`;
            const resp = await fetch(CHAT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
                body: JSON.stringify({
                    messages: [{ role: "user", content: `I need help with a ${modules[selectedSkill].title} challenge: "${skillInput}". Give me a structured research strategy using these skills: ${modules[selectedSkill].skills.join(', ')}. Be specific and actionable.` }],
                    mentorName: "Richard Feynman",
                    mentorField: modules[selectedSkill].title,
                    mentorDescription: `Expert research methodology coach specializing in ${modules[selectedSkill].title}`,
                }),
            });

            if (!resp.ok || !resp.body) throw new Error("Failed to get AI response");

            let fullText = "";
            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let textBuffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                textBuffer += decoder.decode(value, { stream: true });
                let idx: number;
                while ((idx = textBuffer.indexOf("\n")) !== -1) {
                    let line = textBuffer.slice(0, idx);
                    textBuffer = textBuffer.slice(idx + 1);
                    if (line.endsWith("\r")) line = line.slice(0, -1);
                    if (!line.startsWith("data: ")) continue;
                    const jsonStr = line.slice(6).trim();
                    if (jsonStr === "[DONE]") break;
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            fullText += content;
                            setGeneratedInsight(fullText);
                        }
                    } catch { textBuffer = line + "\n" + textBuffer; break; }
                }
            }

            await addNote({ title: `${modules[selectedSkill].title} Strategy`, content: fullText || "AI-generated research strategy saved.", type: 'breakthrough' });
            toast.success("AI research advice saved to your Lab Notes!");
            setSkillInput("");
        } catch {
            toast.error("Failed to generate insight. Please try again.");
        } finally {
            setIsGeneratingSkill(false);
        }
    };

    const handleSaveNotebookNote = async () => {
        if (!notebookTitle.trim()) { toast.error("Please enter a title"); return; }
        setIsSavingNote(true);
        await addNote({ title: notebookTitle, content: notebookContent || "Empty note", type: notebookType });
        toast.success("Note saved to your profile!");
        setNotebookTitle("");
        setNotebookContent("");
        setIsSavingNote(false);
    };

    const handleTopicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (researchTopic.trim()) { setSimulationStep(1); addLog(`Topic Selected: ${researchTopic}`, 'success'); }
    };

    const handleExportLogs = () => {
        if (researchLogs.length === 0) {
            toast.error("No logs to export.");
            return;
        }

        const logContent = researchLogs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
        addNote({
            title: `Lab Console Execution Logs`,
            content: `Execution Logs for topic: ${researchTopic || "General"}\n\n${logContent}`,
            type: 'note'
        });
        toast.success("Lab logs saved to your Lab Notes!");
    };

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <header className="mb-16 text-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative">
                        <Button variant="ghost" size="sm" className="absolute left-0 top-0 rounded-xl text-muted-foreground font-bold uppercase text-[10px] tracking-widest" onClick={() => navigate("/")}>
                            <ArrowLeft className="h-3 w-3 mr-1" /> Back to Hub
                        </Button>
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <Microscope className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="font-display text-5xl font-bold text-foreground tracking-tight">Scientific Mastery Lab</h1>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
                            Harness AI and Nobel-grade datasets to master advanced research methodologies. Everything you create is saved to your profile.
                        </p>
                    </motion.div>
                </header>

                <AnimatePresence mode="wait">
                    {selectedSkill === null ? (
                        <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Skill Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                                {modules.map((mod, i) => (
                                    <motion.div key={i} whileHover={{ y: -5 }} className={`bg-card border ${activeModule === i ? "border-primary" : "border-border/50"} rounded-[2.5rem] p-8 transition-all cursor-pointer group shadow-sm`} onClick={() => setSelectedSkill(i)}>
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${activeModule === i ? "bg-primary text-primary-foreground" : "bg-primary/5 text-primary"}`}>
                                            {mod.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{mod.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{mod.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {mod.skills.map((s, j) => (
                                                <span key={j} className="px-2 py-1 bg-secondary/50 rounded-md text-[10px] font-bold uppercase text-primary/70">{s}</span>
                                            ))}
                                        </div>
                                        <Button variant="outline" className="w-full rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                            Open Workspace <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Simulation + Console/Notebook */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-card rounded-[3rem] p-12 border border-border/50 shadow-sm">
                                <div className="space-y-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-[10px] font-black uppercase text-primary tracking-widest border border-primary/20">
                                        <Layers className="h-3 w-3" /> Core Simulation v2.5
                                    </div>
                                    <h2 className="text-4xl font-display font-bold">Research Synthesis Engine</h2>

                                    <AnimatePresence mode="wait">
                                        {simulationStep === 0 && (
                                            <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                                <p className="text-muted-foreground text-lg mb-8">Define your field of study. Our AI will generate a research path saved directly to your profile.</p>
                                                <form onSubmit={handleTopicSubmit} className="flex gap-4">
                                                    <Input placeholder="e.g. Quantum Entropy, CRISPR Ethics, etc." className="h-14 rounded-2xl" value={researchTopic} onChange={(e) => setResearchTopic(e.target.value)} />
                                                    <Button size="lg" className="rounded-2xl h-14 px-8 font-black">Next</Button>
                                                </form>
                                            </motion.div>
                                        )}
                                        {simulationStep === 1 && (
                                            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                                                    <div className="text-sm font-bold mb-2">Selected Topic:</div>
                                                    <div className="text-2xl font-display italic text-primary">"{researchTopic}"</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 flex items-center gap-4">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                        <div><div className="text-xs text-muted-foreground uppercase font-black">Papers</div><div className="font-bold">12,402</div></div>
                                                    </div>
                                                    <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 flex items-center gap-4">
                                                        <Users className="h-5 w-5 text-primary" />
                                                        <div><div className="text-xs text-muted-foreground uppercase font-black">Scholars</div><div className="font-bold">148</div></div>
                                                    </div>
                                                </div>
                                                <Button size="lg" className="h-16 w-full rounded-2xl font-black text-xl shadow-xl shadow-primary/20" onClick={startSimulation}>
                                                    Start Data Synthesis <MonitorPlay className="h-6 w-6 ml-3" />
                                                </Button>
                                            </motion.div>
                                        )}
                                        {simulationStep === 2 && (
                                            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                                <div className="text-center">
                                                    <h3 className="text-2xl font-bold mb-4 font-display">Archival Retrieval in Progress</h3>
                                                    <div className="h-4 w-full bg-secondary rounded-full overflow-hidden border border-border/50 mb-4">
                                                        <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${simulationProgress}%` }} />
                                                    </div>
                                                    <p className="text-xs font-mono text-primary animate-pulse uppercase tracking-[0.3em]">{simulationProgress}% SYNTHESIS IN PROGRESS</p>
                                                </div>
                                            </motion.div>
                                        )}
                                        {simulationStep === 3 && (
                                            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                                <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] text-center">
                                                    <Cpu className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                                                    <h3 className="text-2xl font-bold mb-2">Synthesis Complete</h3>
                                                    <p className="text-muted-foreground mb-6">Ready for deep analysis on "{researchTopic}".</p>
                                                    <Button size="lg" className="h-16 px-12 rounded-2xl font-black" onClick={competeAnalysis}>
                                                        Generate Insights <Sparkles className="h-6 w-6 ml-2" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                        {simulationStep === 4 && (
                                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem]">
                                                <Trophy className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
                                                <h3 className="text-4xl font-display font-bold text-emerald-600 mb-4 italic">Discovery Generated</h3>
                                                <p className="text-lg text-emerald-600/70 mb-8">Research trajectory mapped with 3 key literature gaps identified.</p>
                                                <div className="flex gap-4 justify-center">
                                                    <Button size="lg" className="rounded-2xl h-16 px-10 font-black" onClick={handleSaveResearch}>
                                                        <Save className="h-5 w-5 mr-2" /> Save to Profile
                                                    </Button>
                                                    <Button size="lg" variant="outline" className="rounded-2xl h-16 px-10" onClick={() => setSimulationStep(0)}>
                                                        Try New Topic
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Console / Riddles / Notebook */}
                                <div className="bg-secondary/30 rounded-[3rem] border border-border/50 overflow-hidden flex flex-col shadow-inner min-h-[500px]">
                                    <div className="flex bg-secondary/50 p-2 border-b border-border/50">
                                        <button onClick={() => setLabTab('console')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${labTab === 'console' ? 'bg-card text-primary border border-border/50 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Console</button>
                                        <button onClick={() => setLabTab('notebook')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${labTab === 'notebook' ? 'bg-card text-primary border border-border/50 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Notebook</button>
                                        <button onClick={() => setLabTab('riddles')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${labTab === 'riddles' ? 'bg-card text-amber-500 border border-border/50 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Scholar IQ</button>
                                    </div>
                                    <div className="flex-1 p-8 overflow-hidden">
                                        <AnimatePresence mode="wait">
                                            {labTab === 'console' && (
                                                <motion.div key="clog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                                                    <div className="flex justify-between items-center mb-6 text-[10px] font-mono text-muted-foreground bg-secondary/50 p-3 rounded-xl border border-border/50">
                                                        <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM_STATUS: NOMINAL</span>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={handleExportLogs}
                                                                className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                                                                title="Export Logs to Notes"
                                                            >
                                                                <Save className="h-3 w-3" /> <span className="uppercase font-bold tracking-widest text-[8px]">Export</span>
                                                            </button>
                                                            <span>{new Date().toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3 pr-4">
                                                        {researchLogs.map((log, i) => (
                                                            <div key={i} className={`flex gap-4 p-2 rounded-lg transition-colors hover:bg-secondary/50 ${log.type === 'success' ? 'text-emerald-500' : log.type === 'warning' ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                                                <span className="opacity-30 shrink-0">[{log.timestamp}]</span>
                                                                <span className="leading-relaxed">{log.message}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                            {labTab === 'notebook' && (
                                                <motion.div key="notebook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col space-y-4">
                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                                        <FileText className="h-4 w-4" /> Quick Note — saves to Profile
                                                    </h3>
                                                    <Input placeholder="Note title..." value={notebookTitle} onChange={(e) => setNotebookTitle(e.target.value)} className="rounded-xl" />
                                                    <Textarea placeholder="Write your research observations, hypotheses, or breakthroughs here..." value={notebookContent} onChange={(e) => setNotebookContent(e.target.value)} className="flex-1 rounded-xl min-h-[200px]" />
                                                    <div className="flex items-center gap-2">
                                                        <select value={notebookType} onChange={(e) => setNotebookType(e.target.value as any)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
                                                            <option value="note">📝 Note</option>
                                                            <option value="insight">💡 Insight</option>
                                                            <option value="breakthrough">🚀 Breakthrough</option>
                                                        </select>
                                                        <Button onClick={handleSaveNotebookNote} disabled={isSavingNote} className="flex-1 rounded-xl">
                                                            <Save className="h-4 w-4 mr-2" /> {isSavingNote ? "Saving..." : "Save Note"}
                                                        </Button>
                                                    </div>
                                                    {notes.length > 0 && (
                                                        <div className="mt-2 text-[10px] text-muted-foreground">
                                                            {notes.length} note{notes.length !== 1 ? 's' : ''} saved • View all in <button onClick={() => navigate("/profile")} className="text-primary underline">Profile</button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                            {labTab === 'riddles' && (
                                                <motion.div key="iq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-8">
                                                    <div className="h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20"><Brain className="h-10 w-10 text-amber-500" /></div>
                                                    <div className="space-y-4">
                                                        <h3 className="text-2xl font-display font-bold">"{riddles[currentRiddleIndex].text}"</h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {riddles[currentRiddleIndex].options.map(opt => (
                                                                <Button key={opt} variant="outline" className="h-14 rounded-2xl hover:bg-amber-500 hover:text-amber-950 hover:border-amber-500 transition-all font-bold" onClick={() => handleRiddleAnswer(opt)}>{opt}</Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="skill" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-[3rem] p-12 shadow-sm relative overflow-hidden h-full">
                            <Button variant="ghost" className="mb-8 rounded-xl font-bold uppercase text-[10px] tracking-widest text-muted-foreground" onClick={() => setSelectedSkill(null)}>
                                <ArrowLeft className="h-3 w-3 mr-2" /> Back to Dashboard
                            </Button>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="space-y-12">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-inner">{modules[selectedSkill].icon}</div>
                                        <div>
                                            <h2 className="text-5xl font-display font-bold">{modules[selectedSkill].title}</h2>
                                            <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-2">Active Learning Workspace</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <p className="text-2xl text-muted-foreground leading-relaxed font-display italic">"{modules[selectedSkill].description}"</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            {modules[selectedSkill].skills.map((s, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                                    <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Dna className="h-5 w-5" /></div>
                                                    <span className="font-bold text-lg">{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 h-full">
                                    <div className="bg-secondary/30 rounded-[3rem] p-10 border border-border/50 h-full flex flex-col space-y-6 shadow-inner">
                                        {!generatedInsight && !isGeneratingSkill && (
                                            <div className="flex flex-col items-center justify-center text-center space-y-6 flex-1">
                                                <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10 shadow-inner">
                                                    <Brain className="h-10 w-10 text-primary animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-2xl font-display font-bold">AI Research Assistant</h4>
                                                    <p className="text-muted-foreground max-w-sm mx-auto text-sm">Describe a research challenge. AI will generate a strategy and save it to your Lab Notes.</p>
                                                </div>
                                            </div>
                                        )}
                                        {(generatedInsight || isGeneratingSkill) && (
                                            <div className="flex-1 overflow-y-auto rounded-2xl bg-card/50 border border-border/30 p-6">
                                                <div className="prose prose-sm max-w-none">
                                                    <ReactMarkdown>{generatedInsight || ""}</ReactMarkdown>
                                                </div>
                                                {isGeneratingSkill && <div className="mt-4 flex items-center gap-2 text-primary text-xs font-bold animate-pulse"><Sparkles className="h-3 w-3" /> Generating...</div>}
                                            </div>
                                        )}
                                        <div className="w-full space-y-3">
                                            <Input placeholder="Enter scenario details..." className="h-12 rounded-2xl" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
                                            <Button size="lg" disabled={!skillInput.trim() || isGeneratingSkill} className="h-14 w-full rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all" onClick={handleGenerateInsight}>
                                                {isGeneratingSkill ? <><Sparkles className="h-5 w-5 mr-2 animate-spin" /> Generating...</> : "Generate Breakthrough"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageLayout>
    );
};

export default ScientificSkills;
