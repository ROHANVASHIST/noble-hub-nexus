import { motion } from "framer-motion";
import { User, Bookmark, Heart, Clock, Settings, LogOut, ChevronRight, Award, BookOpen, Video, Sparkles, FolderKanban, FileEdit, Plus, Trash2, ExternalLink, Share2 } from "lucide-react";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { useScholarData } from "@/frontend/hooks/useScholarData";

const Profile = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [activeTab, setActiveTab] = useState<"library" | "projects" | "notes">("library");
    const navigate = useNavigate();

    const { notes, projects, bookmarks, addNote: addNoteHook, deleteNote, addBookmark } = useScholarData();
    const [newNoteTitle, setNewNoteTitle] = useState("");

    const handleAddNote = () => {
        if (!newNoteTitle.trim()) return;
        addNoteHook({
            title: newNoteTitle,
            content: "Start writing your research notes here...",
            type: 'note'
        });
        setNewNoteTitle("");
        toast.success("Note created in Research Lab");
    };

    useEffect(() => {
        // Set up auth listener BEFORE getting session (correct pattern)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) navigate("/auth");
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) navigate("/auth");
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        toast.success("Signed out successfully");
        navigate("/auth");
    };

    if (!session) return null;

    const user = session.user;
    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 lg:grid-cols-4">
                    {/* User Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-xl">
                                    <User className="h-10 w-10 text-primary" />
                                </div>
                                <h2 className="mt-4 font-display text-xl font-bold text-foreground capitalize">{displayName}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                                    Academic Member
                                </div>
                            </div>

                            <div className="mt-10 space-y-1">
                                <button
                                    onClick={() => setActiveTab("library")}
                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${activeTab === 'library' ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Bookmark className="h-4 w-4" /> My Library
                                    </div>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setActiveTab("projects")}
                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FolderKanban className="h-4 w-4" /> Research Projects
                                    </div>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setActiveTab("notes")}
                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${activeTab === 'notes' ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileEdit className="h-4 w-4" /> Lab Notes
                                    </div>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <button className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary">
                                    <div className="flex items-center gap-3">
                                        <Settings className="h-4 w-4" /> Settings
                                    </div>
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <LogOut className="h-4 w-4" /> Sign Out
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex items-end justify-between">
                                <div>
                                    <h1 className="font-display text-3xl font-bold text-foreground">Scholar Dashboard</h1>
                                    <p className="mt-1 text-muted-foreground">Manage your saved research and scholarly interests.</p>
                                </div>
                            </div>

                            {activeTab === 'library' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    {/* Stats Bar */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="rounded-2xl border border-border bg-card p-4 text-center">
                                            <Award className="h-5 w-5 mx-auto text-amber-500" />
                                            <p className="mt-2 text-xl font-bold font-display">{bookmarks.filter(b => b.itemType === 'laureate').length}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saved Laureates</p>
                                        </div>
                                        <div className="rounded-2xl border border-border bg-card p-4 text-center">
                                            <BookOpen className="h-5 w-5 mx-auto text-blue-500" />
                                            <p className="mt-2 text-xl font-bold font-display">{bookmarks.filter(b => b.itemType === 'paper').length}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Research Papers</p>
                                        </div>
                                        <div className="rounded-2xl border border-border bg-card p-4 text-center">
                                            <Video className="h-5 w-5 mx-auto text-rose-500" />
                                            <p className="mt-2 text-xl font-bold font-display">{bookmarks.filter(b => b.itemType === 'lecture').length}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Video Lectures</p>
                                        </div>
                                    </div>

                                    {/* Research Summary Feed */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-amber-500" /> Personalized Research Feed
                                            </h2>
                                            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold" onClick={() => toast.info("Refreshing your personalized feed...")}>Refresh Feed</Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                            <Sparkles className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-foreground">AI Insight: Breakthroughs in Quantum Computing</h4>
                                                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                                                Based on your interest in Physics ({bookmarks.filter(b => b.itemType === 'paper').length} saved items), we've summarized 3 recent papers on topological insulators.
                                                                The consensus highlights a major shift towards room-temperature superconductivity.
                                                            </p>
                                                            <div className="mt-3 flex gap-2">
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase" onClick={() => {
                                                                    addNoteHook({ title: "AI Insight Summary", content: "Superconductivity breakthroughs summary...", type: 'insight' });
                                                                    toast.success("Summary added to Lab Notes");
                                                                }}>Add to Notes</Button>
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase" onClick={() => toast.info("Full report generating...")}>Full Report</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Just Now</span>
                                                </div>
                                            </div>

                                            {/* Recent Bookmarks */}
                                            <div className="space-y-4 pt-4">
                                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    <Bookmark className="h-4 w-4 text-primary" /> Recent Bookmarks
                                                </h3>
                                                <div className="grid gap-3">
                                                    {bookmarks.slice(0, 5).map(b => (
                                                        <div key={b.id} className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                    {b.itemType === 'paper' ? <BookOpen className="h-4 w-4 text-primary" /> : b.itemType === 'lecture' ? <Video className="h-4 w-4 text-primary" /> : <Award className="h-4 w-4 text-primary" />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold">{b.title}</p>
                                                                    <p className="text-[9px] uppercase font-bold text-muted-foreground">{b.itemType} · {b.date}</p>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate(b.itemType === 'laureate' ? `/laureates/${b.itemId}` : b.itemType === 'paper' ? '/research' : '/lectures')}>
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {bookmarks.length === 0 && (
                                                        <p className="text-xs text-muted-foreground italic text-center py-4 bg-secondary/10 rounded-xl">No items bookmarked yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Explore Section */}
                                    <div className="mt-12 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent p-12 text-center border border-primary/10">
                                        <h3 className="text-xl font-bold text-foreground font-display">Expand Your Horizons</h3>
                                        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">Discover more groundbreaking achievements and add them to your personalized collection.</p>
                                        <Link to="/laureates">
                                            <Button className="mt-6 rounded-xl shadow-lg shadow-primary/20">Explore Discoveries</Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'notes' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <FileEdit className="h-5 w-5 text-primary" /> Research Lab Notes
                                        </h2>
                                        <div className="flex gap-2">
                                            <input
                                                className="h-9 rounded-xl bg-secondary/50 border border-border px-4 text-xs focus:ring-1 focus:ring-primary outline-none w-48 text-foreground"
                                                placeholder="Note title..."
                                                value={newNoteTitle}
                                                onChange={(e) => setNewNoteTitle(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                                            />
                                            <Button onClick={handleAddNote} size="sm" className="rounded-xl h-9">
                                                <Plus className="h-4 w-4 mr-1" /> New Note
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        {notes.length === 0 ? (
                                            <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border text-muted-foreground italic">
                                                No notes yet. Click the 'New Note' button to start documenting your research findings.
                                            </div>
                                        ) : (
                                            notes.map(note => (
                                                <div key={note.id} className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-2 w-2 rounded-full ${note.type === 'insight' ? 'bg-amber-500' : note.type === 'breakthrough' ? 'bg-primary' : 'bg-blue-500'}`} />
                                                            <h4 className="font-bold text-foreground">{note.title}</h4>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{note.date}</span>
                                                            <button onClick={() => { deleteNote(note.id); toast.error("Note deleted"); }} className="text-destructive hover:scale-110 transition-transform">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                                                        {note.content}
                                                    </p>
                                                    <div className="mt-4 flex gap-2">
                                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase text-primary">Edit Full Text</Button>
                                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase">Export to PDF</Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'projects' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <FolderKanban className="h-5 w-5 text-primary" /> Scientific Workspaces
                                        </h2>
                                        <Button size="sm" className="rounded-xl h-9" onClick={() => {
                                            navigate("/scientific-skills");
                                            toast.info("Opening Research Lab to start a new project environment.");
                                        }}>
                                            <Plus className="h-4 w-4 mr-1" /> New Workspace
                                        </Button>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        {projects.map(proj => (
                                            <div key={proj.id} className="group rounded-3xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h4 className="font-bold text-foreground text-lg">{proj.name}</h4>
                                                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-[8px] font-bold uppercase tracking-widest text-primary italic">
                                                            {proj.status}
                                                        </span>
                                                    </div>
                                                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                                        <FolderKanban className="h-5 w-5" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                                                        <span>Project Progress</span>
                                                        <span>{proj.progress}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-primary"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${proj.progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {proj.discovery && (
                                                    <p className="mt-4 text-[11px] text-muted-foreground italic line-clamp-2">
                                                        "{proj.discovery}"
                                                    </p>
                                                )}

                                                <div className="mt-6 flex gap-2">
                                                    <Button variant="default" className="flex-1 rounded-xl font-bold h-9 text-xs" onClick={() => toast.info(`Resuming ${proj.name}...`)}>Open Lab</Button>
                                                    <Button variant="outline" className="rounded-xl h-9 w-10 p-0 text-muted-foreground hover:text-primary">
                                                        <Share2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="rounded-3xl border-2 border-dashed border-border bg-secondary/5 flex flex-col items-center justify-center p-8 text-center transition-all hover:bg-secondary/10 cursor-pointer" onClick={() => navigate("/scientific-skills")}>
                                            <Plus className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                            <h4 className="text-sm font-bold text-muted-foreground">Start New Breakthrough</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Visit Lab Simulation</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Profile;
