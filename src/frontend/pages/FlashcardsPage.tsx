import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchLaureates } from "@/backend/services/laureates";
import { Layers, RotateCcw, ChevronLeft, ChevronRight, Check, X, Trophy, Loader2, Shuffle } from "lucide-react";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

const FlashcardsPage = () => {
  const { data: laureates = [], isLoading } = useQuery({
    queryKey: ["flashcards-laureates"],
    queryFn: () => fetchLaureates(),
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());

  const cards: Flashcard[] = useMemo(() => {
    if (!laureates.length) return [];
    const shuffled = [...laureates].sort(() => Math.random() - 0.5).slice(0, 50);
    return shuffled.map((l, i) => ({
      id: i,
      front: `Who won the Nobel Prize in ${l.category} in ${l.year}?`,
      back: `${l.first_name} ${l.last_name}\n\n${l.institution}\n${l.nationality}\n\n"${l.motivation}"`,
      category: l.category,
    }));
  }, [laureates]);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const progress = totalCards > 0 ? ((known.size + unknown.size) / totalCards) * 100 : 0;

  const markKnown = () => {
    setKnown(s => new Set(s).add(currentIndex));
    unknown.delete(currentIndex);
    next();
  };

  const markUnknown = () => {
    setUnknown(s => new Set(s).add(currentIndex));
    known.delete(currentIndex);
    next();
  };

  const next = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex(i => (i + 1) % totalCards), 150);
  };

  const prev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex(i => (i - 1 + totalCards) % totalCards), 150);
  };

  const reshuffle = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Flashcards</h1>
                <p className="text-sm text-muted-foreground">Learn Nobel Prize facts with spaced repetition.</p>
              </div>
            </div>
            <Button onClick={reshuffle} variant="outline" className="rounded-xl gap-2 text-xs">
              <Shuffle className="h-3 w-3" /> Reshuffle
            </Button>
          </div>

          {isLoading || !currentCard ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-bold">
                  {currentIndex + 1}/{totalCards}
                </span>
              </div>

              {/* Card */}
              <div
                onClick={() => setFlipped(!flipped)}
                className="cursor-pointer perspective-1000 mb-6"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentIndex}-${flipped}`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`min-h-[280px] rounded-3xl border p-8 flex flex-col items-center justify-center text-center ${
                      flipped
                        ? "border-primary/20 bg-primary/5"
                        : "border-border bg-card/50"
                    }`}
                  >
                    {!flipped ? (
                      <>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary mb-4">{currentCard.category}</span>
                        <p className="text-xl font-bold text-foreground leading-relaxed">{currentCard.front}</p>
                        <p className="text-xs text-muted-foreground mt-4">Tap to reveal</p>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary mb-4">Answer</span>
                        <p className="text-lg text-foreground whitespace-pre-line leading-relaxed">{currentCard.back}</p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button onClick={prev} variant="outline" size="icon" className="rounded-xl h-12 w-12">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={markUnknown}
                  variant="outline"
                  className="rounded-xl h-12 px-6 gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                >
                  <X className="h-4 w-4" /> Don't Know
                </Button>
                <Button
                  onClick={markKnown}
                  className="rounded-xl h-12 px-6 gap-2"
                >
                  <Check className="h-4 w-4" /> Got It
                </Button>
                <Button onClick={next} variant="outline" size="icon" className="rounded-xl h-12 w-12">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Score */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-4 rounded-2xl border border-border bg-card/50 text-center">
                  <Check className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{known.size}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Known</p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-card/50 text-center">
                  <X className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{unknown.size}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Review</p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-card/50 text-center">
                  <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">
                    {known.size + unknown.size > 0 ? Math.round((known.size / (known.size + unknown.size)) * 100) : 0}%
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default FlashcardsPage;
