import { motion } from "framer-motion";
import { Lecture } from "@/data/mock-data";
import { Play, Clock, Eye } from "lucide-react";

const LectureCard = ({ lecture, index = 0 }: { lecture: Lecture; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
    className="group overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
  >
    <div className="relative aspect-video bg-secondary flex items-center justify-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm transition-transform group-hover:scale-110">
        <Play className="h-6 w-6 text-primary ml-0.5" />
      </div>
      <span className="absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-0.5 text-xs text-foreground backdrop-blur-sm">
        {lecture.duration}
      </span>
    </div>
    <div className="p-4">
      <h3 className="font-display text-sm font-semibold text-foreground line-clamp-2">{lecture.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{lecture.speakerName}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(lecture.views / 1000).toFixed(0)}K</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lecture.year}</span>
      </div>
    </div>
  </motion.div>
);

export default LectureCard;
