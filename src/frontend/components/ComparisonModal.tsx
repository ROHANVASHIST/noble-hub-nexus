
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Laureate } from "@/backend/data/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Globe, GraduationCap, Calendar, Zap } from "lucide-react";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    laureates: Laureate[];
}

const ComparisonModal = ({ isOpen, onClose, laureates }: ComparisonModalProps) => {
    if (laureates.length < 2) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-display font-bold text-gradient-gold flex items-center gap-3">
                        <Zap className="h-6 w-6 text-amber-500 fill-amber-500" /> Comparative Analytics
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-8 mt-8">
                    {laureates.map((l, idx) => (
                        <motion.div
                            key={l.id}
                            initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <div className="relative bg-card rounded-2xl p-6 border border-border shadow-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Award className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-foreground">{l.firstName} {l.lastName}</h3>
                                            <p className="text-sm text-primary font-bold uppercase tracking-widest">{l.category}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-xs font-bold uppercase">Year</span>
                                            </div>
                                            <span className="font-bold text-foreground">{l.year}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Globe className="h-4 w-4" />
                                                <span className="text-xs font-bold uppercase">Origin</span>
                                            </div>
                                            <span className="font-bold text-foreground">{l.nationality}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <GraduationCap className="h-4 w-4" />
                                                <span className="text-xs font-bold uppercase">Institution</span>
                                            </div>
                                            <span className="font-bold text-foreground text-right max-w-[150px] truncate">{l.institution}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                            <div className="h-1 w-8 bg-primary rounded-full" /> Motivation
                                        </h4>
                                        <p className="text-sm italic leading-relaxed text-foreground/80 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                            "{l.motivation}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
                    >
                        Close Comparison
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ComparisonModal;
