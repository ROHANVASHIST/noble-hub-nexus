import { motion } from "framer-motion";
import { User, Bookmark, Heart, Clock, Settings, LogOut, ChevronRight, Award, BookOpen, Video } from "lucide-react";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
    const [session, setSession] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        toast.success("Signed out successfully");
        navigate("/auth");
    };

    if (!session) return null;

    const user = session.user;
    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0];

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
                                <button className="flex w-full items-center justify-between rounded-xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition-all">
                                    <div className="flex items-center gap-3">
                                        <Bookmark className="h-4 w-4" /> My Library
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

                            {/* Stats Bar */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                                    <Award className="h-5 w-5 mx-auto text-amber-500" />
                                    <p className="mt-2 text-xl font-bold font-display">12</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saved Laureates</p>
                                </div>
                                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                                    <BookOpen className="h-5 w-5 mx-auto text-blue-500" />
                                    <p className="mt-2 text-xl font-bold font-display">8</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Research Papers</p>
                                </div>
                                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                                    <Video className="h-5 w-5 mx-auto text-rose-500" />
                                    <p className="mt-2 text-xl font-bold font-display">5</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Video Lectures</p>
                                </div>
                            </div>

                            {/* Recent Activity / Bookmarks */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <Bookmark className="h-5 w-5 text-primary" /> Curated Library
                                    </h2>
                                    <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">Manage All</Button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Mock Bookmarked Items */}
                                    <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 cursor-pointer">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                                            <Award className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">Malala Yousafzai</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nobel Peace Prize · 2014</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                                    </div>

                                    <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 cursor-pointer">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                                            <BookOpen className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground line-clamp-1">Quantum Tunneling in Electrical Circuits</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Research Paper · 2025</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                                    </div>

                                    <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 cursor-pointer">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                                            <Video className="h-6 w-6 text-rose-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground line-clamp-1">Physics Nobel Lecture 2025</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Video Lecture · 2h 15m</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="mt-12 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent p-12 text-center border border-primary/10">
                                    <h3 className="text-xl font-bold text-foreground font-display">Expand Your Horizons</h3>
                                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">Discover more groundbreaking achievements and add them to your personalized collection.</p>
                                    <Link to="/laureates">
                                        <Button className="mt-6 rounded-xl shadow-lg shadow-primary/20">Explore Discoveries</Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Profile;
