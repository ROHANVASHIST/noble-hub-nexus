import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchLaureates } from "@/backend/services/laureates";
import { NobelCategory } from "@/backend/data/mock-data";
import { Brain, Trophy, Zap, RotateCcw, CheckCircle2, XCircle, Star, Flame, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  funFact: string;
}

const DIFFICULTY_COLORS = {
  easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hard: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const BADGES = [
  { threshold: 3, label: "Curious Mind", icon: "🧠" },
  { threshold: 5, label: "Knowledge Seeker", icon: "📚" },
  { threshold: 8, label: "Nobel Scholar", icon: "🎓" },
  { threshold: 10, label: "Genius Level", icon: "⚡" },
];

const QuizPage = () => {
  const { data: laureates } = useQuery({
    queryKey: ["quiz-laureates"],
    queryFn: () => fetchLaureates(),
  });

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NobelCategory | "All">("All");
  const [quizStarted, setQuizStarted] = useState(false);

  const questions: Question[] = useMemo(() => {
    if (!laureates || laureates.length < 4) return [];

    const pool = selectedCategory === "All" ? laureates : laureates.filter(l => l.category === selectedCategory);
    if (pool.length < 4) return [];

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const qs: Question[] = [];

    // Question type 1: Who won the Nobel Prize in [category] in [year]?
    for (let i = 0; i < Math.min(4, shuffled.length); i++) {
      const correct = shuffled[i];
      const others = pool.filter(l => l.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, 3);
      if (others.length < 3) continue;
      const options = [...others.map(o => `${o.first_name} ${o.last_name}`), `${correct.first_name} ${correct.last_name}`].sort(() => Math.random() - 0.5);
      qs.push({
        id: qs.length,
        question: `Who won the Nobel Prize in ${correct.category} in ${correct.year}?`,
        options,
        correctAnswer: `${correct.first_name} ${correct.last_name}`,
        category: correct.category,
        difficulty: "easy",
        funFact: correct.motivation,
      });
    }

    // Question type 2: What category did [name] win?
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      const correct = shuffled[i];
      const cats: NobelCategory[] = ["Physics", "Chemistry", "Medicine", "Literature", "Peace", "Economics"];
      const wrongCats = cats.filter(c => c !== correct.category).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...wrongCats, correct.category].sort(() => Math.random() - 0.5);
      qs.push({
        id: qs.length,
        question: `In which category did ${correct.first_name} ${correct.last_name} win the Nobel Prize?`,
        options,
        correctAnswer: correct.category,
        category: correct.category,
        difficulty: "easy",
        funFact: `They won in ${correct.year} for: "${correct.motivation}"`,
      });
    }

    // Question type 3: What year did [name] win?
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      const correct = shuffled[i];
      const yearOptions = new Set<string>();
      yearOptions.add(correct.year.toString());
      while (yearOptions.size < 4) {
        yearOptions.add((correct.year + Math.floor(Math.random() * 20) - 10).toString());
      }
      qs.push({
        id: qs.length,
        question: `In what year did ${correct.first_name} ${correct.last_name} receive the Nobel Prize?`,
        options: [...yearOptions].sort(() => Math.random() - 0.5),
        correctAnswer: correct.year.toString(),
        category: correct.category,
        difficulty: "medium",
        funFact: `${correct.first_name} was from ${correct.nationality} and worked at ${correct.institution}.`,
      });
    }

    // Question type 4: Match motivation
    for (let i = 0; i < Math.min(2, shuffled.length); i++) {
      const correct = shuffled[i];
      const others = pool.filter(l => l.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, 3);
      if (others.length < 3) continue;
      const options = [...others.map(o => `${o.first_name} ${o.last_name}`), `${correct.first_name} ${correct.last_name}`].sort(() => Math.random() - 0.5);
      const shortMotivation = correct.motivation.length > 100 ? correct.motivation.slice(0, 100) + "..." : correct.motivation;
      qs.push({
        id: qs.length,
        question: `Which laureate received the prize "${shortMotivation}"?`,
        options,
        correctAnswer: `${correct.first_name} ${correct.last_name}`,
        category: correct.category,
        difficulty: "hard",
        funFact: `This was the ${correct.year} Nobel Prize in ${correct.category}.`,
      });
    }

    return qs.sort(() => Math.random() - 0.5).slice(0, 10);
  }, [laureates, selectedCategory, quizStarted]);

  const handleAnswer = (answer: string) => {
    if (isRevealed) return;
    setSelectedAnswer(answer);
    setIsRevealed(true);
    const correct = answer === questions[currentQ].correctAnswer;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      toast.success(streak >= 2 ? `🔥 ${streak + 1} streak! Correct!` : "Correct!");
    } else {
      setStreak(0);
      toast.error("Not quite right");
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setQuizComplete(true);
    } else {
      setCurrentQ(q => q + 1);
      setSelectedAnswer(null);
      setIsRevealed(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsRevealed(false);
    setQuizComplete(false);
    setQuizStarted(false);
  };

  const startQuiz = () => setQuizStarted(true);

  const earnedBadge = BADGES.filter(b => score >= b.threshold).pop();

  if (!quizStarted) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Knowledge Challenge</span>
            </div>
            <h1 className="font-display text-5xl font-bold text-foreground md:text-7xl">Nobel <span className="text-gradient-gold">Quiz</span></h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md mx-auto">Test your knowledge of Nobel Prize history across all categories. 10 questions, multiple difficulty levels.</p>

            <div className="mt-10 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all border ${selectedCategory === "All" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}
              >
                All Categories
              </button>
              {(["Physics", "Chemistry", "Medicine", "Literature", "Peace", "Economics"] as NobelCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all border ${selectedCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Button onClick={startQuiz} className="mt-10 h-14 px-12 rounded-2xl text-sm font-black uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20">
              <Zap className="h-5 w-5" /> Start Quiz
            </Button>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {BADGES.map(b => (
                <div key={b.label} className="rounded-2xl border border-border bg-card/50 p-4 text-center">
                  <div className="text-3xl mb-2">{b.icon}</div>
                  <div className="text-xs font-bold text-foreground">{b.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{b.threshold}+ correct</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (quizComplete) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-lg text-center">
            <div className="mb-8">
              {pct >= 80 ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: "spring" }}>
                  <Trophy className="h-24 w-24 text-primary mx-auto" />
                </motion.div>
              ) : pct >= 50 ? (
                <Star className="h-24 w-24 text-amber-500 mx-auto" />
              ) : (
                <Brain className="h-24 w-24 text-muted-foreground mx-auto" />
              )}
            </div>

            <h1 className="font-display text-4xl font-bold text-foreground">
              {pct >= 80 ? "Outstanding!" : pct >= 50 ? "Well Done!" : "Keep Learning!"}
            </h1>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-3xl font-display font-bold text-primary">{score}/{questions.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Correct</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-3xl font-display font-bold text-amber-500">{pct}%</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Accuracy</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-3xl font-display font-bold text-rose-500 flex items-center justify-center gap-1"><Flame className="h-6 w-6" />{bestStreak}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Best Streak</div>
              </div>
            </div>

            {earnedBadge && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6">
                <div className="text-4xl mb-2">{earnedBadge.icon}</div>
                <div className="text-sm font-bold text-primary">Badge Earned: {earnedBadge.label}</div>
              </motion.div>
            )}

            <div className="mt-8 flex gap-4 justify-center">
              <Button onClick={resetQuiz} className="rounded-2xl gap-2 px-8">
                <RotateCcw className="h-4 w-4" /> Play Again
              </Button>
            </div>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  const q = questions[currentQ];
  if (!q) return <PageLayout><div className="container mx-auto px-4 py-24 text-center text-muted-foreground">Not enough data for quiz. Try "All Categories".</div></PageLayout>;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Question {currentQ + 1} of {questions.length}</span>
            <div className="flex items-center gap-4">
              {streak >= 2 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-xs font-bold text-rose-400">
                  <Flame className="h-4 w-4" /> {streak} streak
                </motion.div>
              )}
              <span className="text-xs font-bold text-primary">Score: {score}</span>
            </div>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-8">
            <motion.div className="h-full bg-primary" animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${DIFFICULTY_COLORS[q.difficulty]}`}>
                  {q.difficulty}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{q.category}</span>
              </div>

              <h2 className="font-display text-2xl font-bold text-foreground leading-snug">{q.question}</h2>

              <div className="mt-8 space-y-3">
                {q.options.map((option, i) => {
                  const isCorrect = option === q.correctAnswer;
                  const isSelected = option === selectedAnswer;
                  let classes = "w-full text-left p-5 rounded-2xl border transition-all text-sm font-medium ";
                  if (isRevealed) {
                    if (isCorrect) classes += "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                    else if (isSelected) classes += "border-rose-500 bg-rose-500/10 text-rose-400";
                    else classes += "border-border bg-card/30 text-muted-foreground opacity-50";
                  } else {
                    classes += "border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-foreground cursor-pointer";
                  }

                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleAnswer(option)}
                      disabled={isRevealed}
                      className={classes}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{option}</span>
                        {isRevealed && isCorrect && <CheckCircle2 className="h-5 w-5 ml-auto text-emerald-400" />}
                        {isRevealed && isSelected && !isCorrect && <XCircle className="h-5 w-5 ml-auto text-rose-400" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {isRevealed && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">Fun Fact</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{q.funFact}</p>
                  </div>
                  <Button onClick={handleNext} className="mt-4 w-full rounded-2xl gap-2 h-12">
                    {currentQ + 1 >= questions.length ? "See Results" : "Next Question"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
};

export default QuizPage;
