import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/App";
import { useScholarData } from "@/frontend/hooks/useScholarData";
import { Kanban, Plus, GripVertical, Trash2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const COLUMNS = [
  { id: "idea", label: "💡 Ideas", color: "border-blue-500/30 bg-blue-500/5" },
  { id: "Active Research", label: "🔬 In Progress", color: "border-primary/30 bg-primary/5" },
  { id: "review", label: "📝 Review", color: "border-amber-500/30 bg-amber-500/5" },
  { id: "Completed", label: "✅ Done", color: "border-emerald-500/30 bg-emerald-500/5" },
];

const ResearchPlannerPage = () => {
  const { user } = useAuth();
  const { projects, addProject, updateProjectProgress, deleteProject } = useScholarData();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [addToColumn, setAddToColumn] = useState("idea");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addProject({ name: newName, topic: newTopic || "General" });
    // Update status to match column
    setNewName("");
    setNewTopic("");
    setShowAdd(false);
    toast.success("Project added!");
  };

  const moveProject = async (id: string, newStatus: string) => {
    const progressMap: Record<string, number> = {
      idea: 0,
      "Active Research": 50,
      review: 75,
      Completed: 100,
    };
    await updateProjectProgress(id, progressMap[newStatus] || 0, newStatus);
    toast.success("Project moved!");
  };

  const getProjectsByStatus = (status: string) => {
    if (status === "idea") return projects.filter(p => p.status === "idea" || (!["Active Research", "review", "Completed"].includes(p.status) && p.progress === 0));
    if (status === "Active Research") return projects.filter(p => p.status === "Active Research" || (p.progress > 0 && p.progress < 75 && p.status !== "idea" && p.status !== "Completed"));
    if (status === "review") return projects.filter(p => p.status === "review" || (p.progress >= 75 && p.progress < 100));
    if (status === "Completed") return projects.filter(p => p.status === "Completed" || p.progress === 100);
    return [];
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Kanban className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Research Planner</h1>
                <p className="text-sm text-muted-foreground">Organize your research projects in a kanban board.</p>
              </div>
            </div>
            <Button onClick={() => setShowAdd(!showAdd)} className="rounded-xl gap-2">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </div>

          {/* Add Form */}
          <AnimatePresence>
            {showAdd && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Add Research Project</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Project name..."
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="rounded-xl"
                    />
                    <Input
                      placeholder="Topic / field..."
                      value={newTopic}
                      onChange={e => setNewTopic(e.target.value)}
                      className="rounded-xl w-48"
                    />
                    <Button onClick={handleAdd} disabled={!newName.trim()} className="rounded-xl">
                      Add
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map(col => {
              const colProjects = getProjectsByStatus(col.id);
              return (
                <div key={col.id} className={`rounded-2xl border p-4 min-h-[300px] ${col.color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground">{col.label}</h3>
                    <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{colProjects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colProjects.map(p => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl border border-border bg-background/80 group"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.topic}</p>
                            <Progress value={p.progress} className="h-1 mt-2" />
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {col.id !== "Completed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const nextCol = COLUMNS[COLUMNS.findIndex(c => c.id === col.id) + 1];
                                  if (nextCol) moveProject(p.id, nextCol.id);
                                }}
                              >
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => { deleteProject(p.id); toast.success("Deleted"); }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {colProjects.length === 0 && (
                      <p className="text-xs text-muted-foreground/50 text-center py-8">No projects</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ResearchPlannerPage;
