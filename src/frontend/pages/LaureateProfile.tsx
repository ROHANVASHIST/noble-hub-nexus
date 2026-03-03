import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Globe, GraduationCap, Calendar, MapPin, Sparkles, Share2, Bookmark } from "lucide-react";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { fetchLaureateById } from "@/backend/services/laureates";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LaureateProfile = () => {
    const { id } = useParams<{ id: string }>();

    const { data: laureate, isLoading, error } = useQuery({
        queryKey: ["laureate", id],
        queryFn: () => fetchLaureateById(id!),
        enabled: !!id,
    });

    const handleBookmark = () => {
        toast.success("Added to your bookmarks!");
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground animate-pulse font-medium">Retrieving Laureate Records...</p>
                </div>
            </div>
        );
    }

    if (error || !laureate) {
        return (
            <PageLayout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-bold text-foreground">Laureate Not Found</h2>
                    <p className="mt-2 text-muted-foreground">The archival records for this ID could not be retrieved.</p>
                    <Link to="/laureates" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Back to Laureates
                    </Link>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <Link to="/laureates" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    <ArrowLeft className="h-4 w-4" /> Back to Directory
                </Link>

                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Sidebar - Profile Info */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-2xl"
                        >
                            <img
                                src={laureate.photo || `https://www.nobelprize.org/images/laureates/${laureate.id}-portrait-mini-2x.jpg`}
                                alt={`${laureate.first_name} ${laureate.last_name}`}
                                className="h-full w-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12">
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-500 backdrop-blur-md">
                                    <Award className="h-3 w-3" /> Nobel Laureate
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 space-y-4"
                        >
                            <div className="flex items-center gap-3 text-muted-foreground bg-card/50 p-3 rounded-xl border border-border/50">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Born: {laureate.birth_year} {laureate.death_year ? `· Died: ${laureate.death_year}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground bg-card/50 p-3 rounded-xl border border-border/50">
                                <Globe className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Nationality: {laureate.nationality}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground bg-card/50 p-3 rounded-xl border border-border/50">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium line-clamp-1">{laureate.institution}</span>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <Button className="flex-1 gap-2" variant="default" onClick={handleBookmark}>
                                    <Bookmark className="h-4 w-4" /> Save to Profile
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-xl" onClick={() => toast.success("Share link copied to clipboard!")}>
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                                {laureate.first_name} <span className="text-gradient-gold">{laureate.last_name}</span>
                            </h1>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                                    {laureate.category}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Class of {laureate.year}
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-8 relative"
                        >
                            <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary/50 to-transparent" />
                            <h2 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-500" /> Official Motivation
                            </h2>
                            <p className="mt-4 text-xl font-medium leading-relaxed italic text-foreground/80 pl-2">
                                "{laureate.motivation}"
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-12"
                        >
                            <h2 className="text-xl font-bold text-foreground font-display">Archival Biography</h2>
                            <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
                                {laureate.biography ? (
                                    <p>{laureate.biography}</p>
                                ) : (
                                    <p>Extended biography from the Nobel Foundation Archives is being processed. This laureate was awarded for their exceptional contributions to human knowledge and peace.</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-12 grid gap-6 sm:grid-cols-2"
                        >
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="font-bold text-foreground">Discoveries</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Detailed publications and datasets related to this laureate's work are available in the research section.</p>
                                <Link to="/research" className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary hover:underline">
                                    View Papers <ArrowLeft className="h-3 w-3 rotate-180" />
                                </Link>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="font-bold text-foreground">Lectures</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Watch original Nobel Prize lectures delivered by this laureate during their award ceremony.</p>
                                <Link to="/lectures" className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary hover:underline">
                                    Watch Lectures <ArrowLeft className="h-3 w-3 rotate-180" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default LaureateProfile;
