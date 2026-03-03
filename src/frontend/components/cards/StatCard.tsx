import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { toast } from "sonner";

const StatCard = ({ icon: Icon, label, value, index = 0 }: { icon: LucideIcon; label: string; value: string | number; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
    onClick={() => toast.info(`${label}: ${value} recorded in the Nobel archives`)}
    className="rounded-xl border border-border/50 bg-card p-5 text-center transition-all hover:border-primary/40 hover:scale-105 cursor-pointer"
  >
    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <p className="font-display text-2xl font-bold text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
  </motion.div>
);

export default StatCard;
