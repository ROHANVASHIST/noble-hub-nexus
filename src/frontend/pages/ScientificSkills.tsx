import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Brain,
    Search,
    Lightbulb,
    Microscope,
    Database,
    Dna,
    ArrowRight,
    MonitorPlay,
    FileQuestion,
    Trophy,
    ArrowLeft,
    Sparkles,
    Cpu,
    Layers,
    FileText,
    Users
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useScholarData } from "@/frontend/hooks/useScholarData";

const ScientificSkills = () => {
    const navigate = useNavigate();
    const [activeModule, setActiveModule] = useState(0);
    const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
    const [simulationStep, setSimulationStep] = useState(0); // 0: Start, 1: Topic, 2: Collecting, 3: Analyzing, 4: Completed
    const [simulationProgress, setSimulationProgress] = useState(0);
    const [labTab, setLabTab] = useState<'console' | 'riddles'>('console');
    const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
    const [researchTopic, setResearchTopic] = useState("");
    const { addProject, addNote } = useScholarData();
    const [researchLogs, setResearchLogs] = useState<{ timestamp: string, message: string, type: 'info' | 'success' | 'warning' }[]>([
        { timestamp: new Date().toLocaleTimeString(), message: "Laboratory initialized. System ready.", type: 'info' }
    ]);
    const [skillInput, setSkillInput] = useState("");
    const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);

    const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
        setResearchLogs(prev => [
            { timestamp: new Date().toLocaleTimeString(), message, type },
            ...prev.slice(0, 24) // Keep last 25 logs
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
        {
            text: "I studied radioactivity, won awards in two different sciences, but was never allowed to enter the French Academy.",
            answer: "Marie Curie",
            options: ["Marie Curie", "Lise Meitner", "Rosalind Franklin", "Tu Youyou"]
        },
        {
            text: "I was a safe-cracker in my spare time, but my real work was in quantum electrodynamics and nanotechnology.",
            answer: "Richard Feynman",
            options: ["Richard Feynman", "John Wheeler", "Murray Gell-Mann", "Freeman Dyson"]
        },
        {
            text: "I discovered that DNA has a double helix structure, though my name is often mentioned alongside Watson and Crick.",
            answer: "Rosalind Franklin",
            options: ["Rosalind Franklin", "Barbara McClintock", "Ada Yonath", "Jennifer Doudna"]
        }
    ];

    const handleRiddleAnswer = (option: string) => {
        if (option === riddles[currentRiddleIndex].answer) {
            toast.success("Correct! Identification verified.", {
                description: "Research points +50 added to your profile."
            });
            setTimeout(() => {
                setCurrentRiddleIndex((prev) => (prev + 1) % riddles.length);
            }, 1000);
        } else {
            toast.error("Incorrect sequence. Verification failed.");
        }
    };

    const startSimulation = () => {
        if (!researchTopic) {
            toast.error("Please specify a research topic first.");
            return;
        }
        setSimulationStep(2);
        setSimulationProgress(0);
        addLog(`Initializing research on: ${researchTopic}...`, "info");
        addLog("Querying global archives for related lectures and papers...", "info");

        const interval = setInterval(() => {
            setSimulationProgress((prev) => {
                const next = prev + 4;
                if (next % 20 === 0 && next < 100) {
                    const messages = [
                        "Synthesizing citation networks...",
                        "Downloading Nobel archive metadata...",
                        "Applying NLP to research abstracts...",
                        "Aggregating expert commentary..."
                    ];
                    addLog(messages[Math.floor(next / 20) - 1], "info");
                }
                if (next >= 100) {
                    clearInterval(interval);
                    setSimulationStep(3);
                    addLog(`Data synthesis for "${researchTopic}" completed.`, "success");
                    return 100;
                }
                return next;
            });
        }, 120);
    };

    const competeAnalysis = () => {
        addLog(`Deploying AI models to analyze "${researchTopic}" dataset...`, "info");
        toast.promise(new Promise(resolve => setTimeout(resolve, 3000)), {
            loading: 'Cross-referencing papers and lectures...',
            success: 'Analysis complete. Key patterns identified!',
            error: 'Analysis timeout.',
        });

        setTimeout(() => {
            setSimulationStep(4);
            addLog("Hypothesis validation: Consensus reached on primary variables.", "success");
            addLog("Actionable insight: Integrated multi-disciplinary approach recommended.", "info");
        }, 3500);
    };

    const handleSaveResearch = () => {
        addProject({
            name: `${researchTopic} Research Path`,
            topic: researchTopic,
            discovery: "Successfully mapped the research trajectory and identified 3 key gaps in current literature."
        });
        toast.success("Research path saved to your profile projects!");
        navigate("/profile");
    };

    const handleGenerateInsight = () => {
        if (!skillInput.trim()) return;
        setIsGeneratingSkill(true);
        toast.loading(`Consulting with AI Mentor for "${modules[selectedSkill!].title}"...`);

        setTimeout(() => {
            const skill = modules[selectedSkill!].title;
            const insightTitle = `${skill} Strategy`;
            const insightContent = `Hello Scholar. For your challenge: "${skillInput}", I've applied the ${skill} framework. 

Structure & Research Recommendations:
1. FOUNDATION: Utilize ${modules[selectedSkill!].skills[0]} to establish a baseline. Scientific evidence suggests that rigor in this phase prevents 60% of common experimental errors.
2. ITERATION: Transition to ${modules[selectedSkill!].skills[1]} for refining your data model.
3. SYNTHESIS: The proposed solution integrates Nobel-grade methodologies, specifically addressing complexity scaling.

Mentor's Take: True discovery lies not in the data, but in the courage to challenge established bias. Proceed with your ${modules[selectedSkill!].skills[2]} audit.`;

            addNote({
                title: insightTitle,
                content: insightContent,
                type: 'breakthrough'
            });
            setIsGeneratingSkill(false);
            toast.dismiss();
            toast.success("AI Mentor's research advice saved to Lab Notes!");
            setSkillInput("");
            setSelectedSkill(null);
        }, 3000);
    };

    const handleTopicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (researchTopic.trim()) {
            setSimulationStep(1);
            addLog(`Topic Selected: ${researchTopic}`, 'success');
        }
    };

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <header className="mb-16 text-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-0 top-0 rounded-xl text-muted-foreground font-bold uppercase text-[10px] tracking-widest"
                            onClick={() => navigate("/")}
                        >
                            <ArrowLeft className="h-3 w-3 mr-1" /> Back to Hub
                        </Button>
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <Microscope className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="font-display text-5xl font-bold text-foreground tracking-tight">Scientific Mastery Lab</h1>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
                            Harness AI and Nobel-grade datasets to master advanced research methodologies.
                        </p>
                    </motion.div>
                </header>

                <AnimatePresence mode="wait">
                    {selectedSkill === null ? (
                        <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Skill Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                                {modules.map((mod, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className={`bg-card border ${activeModule === i ? "border-primary" : "border-border/50"} rounded-[2.5rem] p-8 transition-all cursor-pointer group shadow-sm`}
                                        onClick={() => setSelectedSkill(i)}
                                    >
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${activeModule === i ? "bg-primary text-white" : "bg-primary/5 text-primary"}`}>
                                            {mod.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{mod.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{mod.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {mod.skills.map((s, j) => (
                                                <span key={j} className="px-2 py-1 bg-secondary/50 rounded-md text-[10px] font-bold uppercase text-primary/70">{s}</span>
                                            ))}
                                        </div>
                                        <Button variant="outline" className="w-full rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                            Open Workspace <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Simulation Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-slate-900/40 rounded-[3rem] p-12 border border-white/5 backdrop-blur-sm shadow-2xl">
                                <div className="space-y-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-[10px] font-black uppercase text-primary tracking-widest border border-primary/20">
                                        <Layers className="h-3 w-3" /> Core Simulation v2.5
                                    </div>
                                    <h2 className="text-4xl font-display font-bold">Research Synthesis Engine</h2>

                                    <AnimatePresence mode="wait">
                                        {simulationStep === 0 && (
                                            <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                                <p className="text-muted-foreground text-lg mb-8">
                                                    Define your field of study. Our AI will pull data from 90,000+ papers, 500+ laureates, and centuries of lectures to help you generate a research path.
                                                </p>
                                                <form onSubmit={handleTopicSubmit} className="flex gap-4">
                                                    <Input
                                                        placeholder="e.g. Quantum Entropy, CRISPR Ethics, etc."
                                                        className="h-14 rounded-2xl bg-white/5 border-white/10"
                                                        value={researchTopic}
                                                        onChange={(e) => setResearchTopic(e.target.value)}
                                                    />
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
                                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                                        <FileText className="h-5 w-5 text-blue-400" />
                                                        <div><div className="text-xs text-slate-500 uppercase font-black">Papers</div><div className="font-bold">12,402</div></div>
                                                    </div>
                                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                                        <Users className="h-5 w-5 text-emerald-400" />
                                                        <div><div className="text-xs text-slate-500 uppercase font-black">Scholars</div><div className="font-bold">148</div></div>
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
                                                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 mb-4">
                                                        <motion.div className="h-full bg-primary shadow-[0_0_20px_rgba(255,255,255,0.3)]" initial={{ width: 0 }} animate={{ width: `${simulationProgress}%` }} />
                                                    </div>
                                                    <p className="text-xs font-mono text-primary animate-pulse uppercase tracking-[0.3em]">{simulationProgress}% CACHE_LINK_ESTABLISHED</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {simulationStep === 3 && (
                                            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                                <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] text-center">
                                                    <Cpu className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                                                    <h3 className="text-2xl font-bold mb-2">Synthesis Complete</h3>
                                                    <p className="text-muted-foreground mb-6">AI Models have mapped the citation networks for "{researchTopic}". Ready for deep analysis.</p>
                                                    <Button size="lg" className="h-16 px-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black" onClick={competeAnalysis}>
                                                        Generate Insights <Sparkles className="h-6 w-6 ml-2" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {simulationStep === 4 && (
                                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem]">
                                                <Trophy className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
                                                <h3 className="text-4xl font-display font-bold text-emerald-600 mb-4 italic">Discovery Generated</h3>
                                                <p className="text-lg text-emerald-600/70 mb-8">You've successfully mapped the research trajectory for this topic and identified 3 key gaps in current literature.</p>
                                                <div className="flex gap-4 justify-center">
                                                    <Button size="lg" className="rounded-2xl h-16 px-10 bg-emerald-600 hover:bg-emerald-700 font-black" onClick={handleSaveResearch}>
                                                        Save Research Path
                                                    </Button>
                                                    <Button size="lg" variant="outline" className="rounded-2xl h-16 px-10 border-emerald-500/30 text-emerald-600" onClick={() => setSimulationStep(0)}>
                                                        Try New Topic
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="bg-slate-950 rounded-[3rem] border border-white/5 overflow-hidden flex flex-col shadow-inner min-h-[500px]">
                                    <div className="flex bg-slate-900/50 p-2 border-b border-white/5">
                                        <button onClick={() => setLabTab('console')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${labTab === 'console' ? 'bg-slate-950 text-primary border border-white/5 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Console</button>
                                        <button onClick={() => setLabTab('riddles')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${labTab === 'riddles' ? 'bg-slate-950 text-amber-500 border border-white/5 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Scholar IQ</button>
                                    </div>
                                    <div className="flex-1 p-8 overflow-hidden">
                                        <AnimatePresence mode="wait">
                                            {labTab === 'console' ? (
                                                <motion.div key="clog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                                                    <div className="flex justify-between items-center mb-6 text-[10px] font-mono text-slate-500 bg-white/5 p-3 rounded-xl border border-white/5">
                                                        <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM_STATUS: NOMINAL</span>
                                                        <span>{new Date().toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3 pr-4 scrollbar-hide">
                                                        {researchLogs.map((log, i) => (
                                                            <div key={i} className={`flex gap-4 p-2 rounded-lg transition-colors hover:bg-white/5 ${log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-amber-400' : 'text-slate-400'}`}>
                                                                <span className="opacity-30 shrink-0">[{log.timestamp}]</span>
                                                                <span className="leading-relaxed">{log.message}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="iq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-8">
                                                    <div className="h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20"><Brain className="h-10 w-10 text-amber-500" /></div>
                                                    <div className="space-y-4">
                                                        <h3 className="text-2xl font-display font-bold">"{riddles[currentRiddleIndex].text}"</h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {riddles[currentRiddleIndex].options.map(opt => (
                                                                <Button key={opt} variant="outline" className="h-14 rounded-2xl border-white/10 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all font-bold" onClick={() => handleRiddleAnswer(opt)}>{opt}</Button>
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
                        <motion.div key="skill" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden h-full">
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
                                    <div className="bg-slate-950 rounded-[3rem] p-10 border border-white/5 h-full flex flex-col items-center justify-center text-center space-y-10 shadow-2xl">
                                        <div className="h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10 shadow-inner relative">
                                            <Brain className="h-12 w-12 text-primary animate-pulse" />
                                            <div className="absolute inset-0 border-2 border-primary/20 rounded-full border-dashed animate-spin-slow" />
                                        </div>
                                        <div className="space-y-4 w-full">
                                            <h4 className="text-3xl font-display font-bold">Deploy Module Instance</h4>
                                            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">Describe a research challenge or scenario related to {modules[selectedSkill].title}.</p>
                                        </div>

                                        <div className="w-full space-y-4">
                                            <Input
                                                placeholder="Enter scenario details..."
                                                className="h-14 rounded-2xl bg-white/5 border-white/10 text-center"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                            />
                                            <Button
                                                size="lg"
                                                disabled={!skillInput.trim() || isGeneratingSkill}
                                                className="h-20 w-full rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                                                onClick={handleGenerateInsight}
                                            >
                                                {isGeneratingSkill ? "Simulating..." : "Generate Breakthrough"}
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


