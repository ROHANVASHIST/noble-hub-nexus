import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScholarData } from "@/frontend/hooks/useScholarData";
import AchievementBadges from "@/frontend/components/AchievementBadges";
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
    FileEdit,
    FolderKanban,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const ScholarDashboard = () => {
    const navigate = useNavigate();
    const { notes, projects, bookmarks } = useScholarData();
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState({
        text: "Nature uses only the longest threads to weave her patterns, so that each small piece of her fabric reveals the organization of the entire tapestry.",
        author: "Richard Feynman"
    });

    const quotes = [
        { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
        { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
        { text: "The first principle is that you must not fool yourself and you are the easiest person to fool.", author: "Richard Feynman" },
        { text: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan" },
        { text: "We cannot solve our problems with the same thinking we used when we created them.", author: "Albert Einstein" },
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
    const resetTimer = () => { setIsActive(false); setTimeLeft(25 * 60); };
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const breakthroughs = notes.filter(n => n.type === 'breakthrough');
    const insights = notes.filter(n => n.type === 'insight');
    const activeProjects = projects.filter(p => p.status !== 'Completed');
    const completedProjects = projects.filter(p => p.status === 'Completed');

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <header className="mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                    <div className="lg:col-span-2 space-y-8">
                        {/* Real Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <motion.div whileHover={{ y: -5 }} className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                                <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
                                    <FileEdit className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="text-3xl font-display font-bold">{notes.length}</div>
                                <div className="text-xs text-muted-foreground">Lab Notes</div>
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                                <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-3">
                                    <FolderKanban className="h-5 w-5 text-amber-500" />
                                </div>
                                <div className="text-3xl font-display font-bold">{projects.length}</div>
                                <div className="text-xs text-muted-foreground">Research Projects</div>
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-3xl font-display font-bold">{breakthroughs.length}</div>
                                <div className="text-xs text-muted-foreground">Breakthroughs</div>
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3">
                                    <BookOpen className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="text-3xl font-display font-bold">{bookmarks.length}</div>
                                <div className="text-xs text-muted-foreground">Bookmarks</div>
                            </motion.div>
                        </div>

                        {/* Active Projects */}
                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FolderKanban className="h-5 w-5 text-primary" /> Active Projects
                                </h2>
                                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest text-primary" onClick={() => navigate("/profile")}>
                                    View All <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                            {activeProjects.length > 0 ? (
                                <div className="space-y-4">
                                    {activeProjects.slice(0, 4).map(proj => (
                                        <div key={proj.id} className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-sm font-bold">{proj.name}</div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{proj.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${proj.progress}%` }} />
                                            </div>
                                            <div className="mt-2 text-[10px] text-muted-foreground">Topic: {proj.topic} · {proj.date}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    <p className="italic">No active projects.</p>
                                    <Button variant="outline" size="sm" className="mt-4 rounded-xl" onClick={() => navigate("/scientific-skills")}>Start a Research Project</Button>
                                </div>
                            )}
                        </div>

                        {/* Recent Notes */}
                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" /> Recent Lab Notes
                                </h2>
                                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest text-primary" onClick={() => navigate("/profile")}>
                                    View All <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {notes.slice(0, 4).map((note) => (
                                    <div key={note.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${note.type === 'breakthrough' ? 'bg-primary' : note.type === 'insight' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                            <div>
                                                <div className="text-sm font-bold">{note.title}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{note.date}</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-background rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest text-primary">
                                            {note.type}
                                        </div>
                                    </div>
                                ))}
                                {notes.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm italic">
                                        No notes yet. Use Scholar Tools or the Lab to create your first note.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

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
                                    <div className="text-6xl font-display font-bold tracking-tighter text-primary tabular-nums">{formatTime(timeLeft)}</div>
                                    <div className="mt-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">Focused Research Session</div>
                                </div>
                                <div className="flex items-center justify-center gap-4">
                                    <Button variant={isActive ? "outline" : "default"} className="h-12 w-12 rounded-full p-0 flex items-center justify-center" onClick={toggleTimer}>
                                        {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                    </Button>
                                    <Button variant="ghost" className="h-12 w-12 rounded-full p-0 flex items-center justify-center text-muted-foreground hover:text-foreground" onClick={resetTimer}>
                                        <RotateCcw className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Progress Summary */}
                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" /> Research Summary
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Completed Projects</span>
                                    <span className="text-sm font-bold text-emerald-500">{completedProjects.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">AI Insights Generated</span>
                                    <span className="text-sm font-bold text-amber-500">{insights.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Breakthroughs Saved</span>
                                    <span className="text-sm font-bold text-primary">{breakthroughs.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Items Bookmarked</span>
                                    <span className="text-sm font-bold">{bookmarks.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Inspiration Card */}
                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                            <Quote className="h-8 w-8 text-primary/30 mb-4" />
                            <p className="text-sm italic leading-relaxed text-foreground">"{selectedQuote.text}"</p>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs font-bold text-primary italic">— {selectedQuote.author}</div>
                                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest" onClick={() => setSelectedQuote(quotes[Math.floor(Math.random() * quotes.length)])}>
                                    New Insight
                                </Button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-violet-500/5 border border-violet-500/20 rounded-3xl p-8 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap className="h-4 w-4" /> Quick Actions
                            </h3>
                            <Button variant="outline" size="sm" className="w-full rounded-xl border-violet-500/30 text-violet-600 hover:bg-violet-500/10 justify-start" onClick={() => navigate("/mentorship")}>
                                <Award className="h-4 w-4 mr-2" /> Chat with AI Mentor
                            </Button>
                            <Button variant="outline" size="sm" className="w-full rounded-xl border-violet-500/30 text-violet-600 hover:bg-violet-500/10 justify-start" onClick={() => navigate("/research")}>
                                <BookOpen className="h-4 w-4 mr-2" /> Open Research Archive
                            </Button>
                            <Button variant="outline" size="sm" className="w-full rounded-xl border-violet-500/30 text-violet-600 hover:bg-violet-500/10 justify-start" onClick={() => navigate("/scientific-skills")}>
                                <Target className="h-4 w-4 mr-2" /> Scientific Mastery Lab
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ScholarDashboard;
