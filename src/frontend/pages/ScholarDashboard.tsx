import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import {
    Timer,
    BookOpen,
    TrendingUp,
    Target,
    Quote,
    Award,
    CheckCircle2,
    Zap,
    Play,
    Pause,
    RotateCcw,
    Plus
} from "lucide-react";
import { toast } from "sonner";

const ScholarDashboard = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [readCount, setReadCount] = useState(12);
    const [selectedQuote, setSelectedQuote] = useState({
        text: "Nature uses only the longest threads to weave her patterns, so that each small piece of her fabric reveals the organization of the entire tapestry.",
        author: "Richard Feynman"
    });

    const quotes = [
        { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
        { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
        { text: "The first principle is that you must not fool yourself and you are the easiest person to fool.", author: "Richard Feynman" },
        { text: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan" }
    ];

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            toast.success("Focus session completed!");
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(25 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                        <div>
                            <h1 className="font-display text-4xl font-bold text-foreground">Scholar Dashboard</h1>
                            <p className="mt-2 text-muted-foreground max-w-xl">
                                Track your research productivity and benchmark your progress against the world's greatest minds.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold text-primary italic">Deep Work Mode</span>
                            </div>
                        </div>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Progress */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm"
                            >
                                <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="text-3xl font-display font-bold">14</div>
                                <div className="text-sm text-muted-foreground">Papers Read (Monthly)</div>
                                <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[70%]" />
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm"
                            >
                                <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <TrendingUp className="h-5 w-5 text-amber-500" />
                                </div>
                                <div className="text-3xl font-display font-bold">+12%</div>
                                <div className="text-sm text-muted-foreground">Novelty Index</div>
                                <div className="mt-4 text-xs font-medium text-emerald-500 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> Trending Up
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm"
                            >
                                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <Target className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="text-3xl font-display font-bold">8/10</div>
                                <div className="text-sm text-muted-foreground">Weekly Goals</div>
                                <div className="mt-4 text-xs text-muted-foreground">2 goals remaining</div>
                            </motion.div>
                        </div>

                        {/* Benchmarking Section */}
                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                Laureate Benchmarking
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium">Current Paper Output Rate</span>
                                        <span className="text-muted-foreground italic">Target: Richard Feynman (Post-Nobel)</span>
                                    </div>
                                    <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full bg-primary w-[45%] rounded-full z-10" />
                                        <div className="absolute top-0 left-[65%] h-full w-[2px] bg-amber-500 z-20" />
                                    </div>
                                    <div className="flex justify-between text-[10px] mt-1 text-muted-foreground uppercase tracking-widest font-bold">
                                        <span>You: 1.2 papers/yr</span>
                                        <span>Benchmark: 3.5 papers/yr</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium">Citation Impact Trajectory</span>
                                        <span className="text-muted-foreground italic">Target: Marie Curie (Early Career)</span>
                                    </div>
                                    <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full bg-primary/60 w-[30%] rounded-full z-10" />
                                        <div className="absolute top-0 left-[25%] h-full w-[2px] bg-emerald-500 z-20" />
                                    </div>
                                    <div className="flex justify-between text-[10px] mt-1 text-muted-foreground uppercase tracking-widest font-bold">
                                        <span>Current H-Index: 4</span>
                                        <span>Marie at your age: 3</span>
                                    </div>
                                    <div className="mt-2 text-xs text-emerald-500 font-bold italic">
                                        You are currently outperforming early-career Marie Curie in citation metrics!
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reading Log */}
                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    Recent Reading Log
                                </h2>
                                <Button size="sm" variant="outline" className="rounded-xl border-dashed">
                                    <Plus className="h-4 w-4 mr-1" /> Add Entry
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { title: "On the Electrodynamics of Moving Bodies", date: "2 hours ago", status: "Analyzed" },
                                    { title: "A New Approach to Quantum Mechanics", date: "Yesterday", status: "Summarized" },
                                    { title: "Probabilistic Logic in Neural Networks", date: "Oct 24", status: "Annotating" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                        <div>
                                            <div className="text-sm font-bold">{item.title}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.date}</div>
                                        </div>
                                        <div className="px-3 py-1 bg-background rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest text-primary">
                                            {item.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pomodoro & Quotes */}
                    <div className="space-y-8">
                        {/* Pomodoro Timer */}
                        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
                            <div className="absolute -top-12 -right-12 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-primary mb-6">
                                    <Timer className="h-5 w-5" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Deep Work Timer</span>
                                </div>

                                <div className="text-center py-8">
                                    <div className="text-6xl font-display font-bold tracking-tighter text-primary tabular-nums">
                                        {formatTime(timeLeft)}
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">
                                        Focused Research Session
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        variant={isActive ? "outline" : "default"}
                                        className="h-12 w-12 rounded-full p-0 flex items-center justify-center"
                                        onClick={toggleTimer}
                                    >
                                        {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="h-12 w-12 rounded-full p-0 flex items-center justify-center text-muted-foreground hover:text-foreground"
                                        onClick={resetTimer}
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Inspiration Card */}
                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                            <Quote className="h-8 w-8 text-primary/30 mb-4" />
                            <p className="text-sm italic leading-relaxed text-foreground">
                                "{selectedQuote.text}"
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs font-bold text-primary italic">— {selectedQuote.author}</div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[10px] uppercase font-bold tracking-widest"
                                    onClick={() => {
                                        const next = quotes[Math.floor(Math.random() * quotes.length)];
                                        setSelectedQuote(next);
                                    }}
                                >
                                    New Insight
                                </Button>
                            </div>
                        </div>

                        {/* Interdisciplinary Connector */}
                        <div className="bg-violet-500/5 border border-violet-500/20 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap className="h-4 w-4" /> Cross-Field Link
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Based on your interest in <strong>Physics</strong>, we recommend exploring <strong>Neuroscience</strong> laureates like John Hopfield.
                            </p>
                            <Button variant="outline" size="sm" className="w-full rounded-xl border-violet-500/30 text-violet-600 hover:bg-violet-500/10">
                                Explore Connections
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ScholarDashboard;
