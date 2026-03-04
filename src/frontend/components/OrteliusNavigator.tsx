import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Award, ChevronRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
    Physics: 'bg-blue-500/10 text-blue-400',
    Chemistry: 'bg-emerald-500/10 text-emerald-400',
    Medicine: 'bg-rose-500/10 text-rose-400',
    Literature: 'bg-amber-500/10 text-amber-400',
    Peace: 'bg-sky-500/10 text-sky-400',
    Economics: 'bg-violet-500/10 text-violet-400',
};

const OrteliusNavigator = ({ laureates }: { laureates: any[] }) => {
    // Group by decade
    const grouped = laureates.reduce((acc, laureate) => {
        if (!laureate.year) return acc;
        const decade = Math.floor(laureate.year / 10) * 10;
        if (!acc[decade]) acc[decade] = [];
        acc[decade].push(laureate);
        return acc;
    }, {} as Record<number, any[]>);

    const decades = Object.keys(grouped).map(Number).sort((a, b) => b - a);

    return (
        <div className="space-y-12">
            {decades.map((decade, i) => (
                <motion.div
                    key={decade}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="relative pl-8 md:pl-0"
                >
                    {/* Timeline separator */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-[-3rem] w-px bg-border/50 -translate-x-1/2" />

                    <div className="sticky top-20 z-10 md:static bg-background/80 md:bg-transparent backdrop-blur-sm py-2 px-0 md:py-0 mb-6 md:mb-8 flex md:justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-6 py-2 shadow-lg shadow-primary/5">
                            <span className="font-display text-xl font-bold text-primary">{decade}s</span>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {grouped[decade]
                            .sort((a, b) => b.year - a.year)
                            .map((laureate) => (
                                <Link
                                    to={`/laureates/${laureate.id || laureate.id}`}
                                    key={laureate.id}
                                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/20 transition-colors">
                                        <img src={laureate.photo || `https://ui-avatars.com/api/?name=${laureate.first_name}+${laureate.last_name}&background=random`} alt="" className="h-full w-full rounded-full object-cover opacity-80" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${laureate.first_name}+${laureate.last_name}&background=random`; }} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-display text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                {laureate.first_name} {laureate.last_name}
                                            </h3>
                                            <span className={`inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tighter ${CATEGORY_COLORS[laureate.category] || CATEGORY_COLORS['Physics']}`}>
                                                {laureate.category}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                            {laureate.year} · {laureate.nationality}
                                        </p>
                                        <p className="mt-2 text-sm text-foreground/80 line-clamp-1 italic text-muted-foreground mr-2">
                                            "{laureate.motivation}"
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                                </Link>
                            ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default OrteliusNavigator;
