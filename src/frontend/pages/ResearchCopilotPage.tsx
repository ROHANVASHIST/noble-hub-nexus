import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Bot, Send, Sparkles, BookOpen, FlaskConical, Lightbulb, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTION_CHIPS = [
  "What discoveries relate to my current research?",
  "Suggest papers based on my notes",
  "Find connections between my bookmarked laureates",
  "What Nobel trends match my interests?",
  "Recommend research directions from my projects",
];

const ResearchCopilotPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user context for the AI
  const { data: userContext } = useQuery({
    queryKey: ["copilot-context", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [notesRes, projectsRes, bookmarksRes] = await Promise.all([
        (supabase as any).from("scholar_notes").select("title, content, type").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        (supabase as any).from("research_projects").select("name, topic, status, progress").eq("user_id", user.id).limit(10),
        supabase.from("bookmarks").select("item_id, item_type").eq("user_id", user.id).limit(20),
      ]);
      return {
        notes: notesRes.data || [],
        projects: projectsRes.data || [],
        bookmarks: bookmarksRes.data || [],
      };
    },
    enabled: !!user,
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build context string
    const contextStr = userContext
      ? `User's research context:\n- Notes: ${userContext.notes.map((n: any) => `"${n.title}" (${n.type})`).join(", ") || "None"}\n- Projects: ${userContext.projects.map((p: any) => `"${p.name}" on ${p.topic} (${p.status}, ${p.progress}%)`).join(", ") || "None"}\n- Bookmarks: ${userContext.bookmarks.length} saved items`
      : "No user context available.";

    let assistantContent = "";
    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const allMessages = [...messages, userMsg];
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-copilot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          context: contextStr,
        }),
      });

      if (resp.status === 429) { toast.error("Rate limited. Please wait a moment."); setIsLoading(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Please top up."); setIsLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch { /* partial */ }
        }
      }
    } catch (err) {
      console.error("Copilot error:", err);
      upsertAssistant("I'm having trouble connecting right now. Please try again in a moment.");
    }

    setIsLoading(false);
  };

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Research Copilot</h1>
            <p className="text-xs text-muted-foreground">AI that understands your research context and suggests connections</p>
          </div>
          {userContext && (
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]"><BookOpen className="h-3 w-3 mr-1" />{userContext.notes.length} notes</Badge>
              <Badge variant="outline" className="text-[10px]"><FlaskConical className="h-3 w-3 mr-1" />{userContext.projects.length} projects</Badge>
            </div>
          )}
        </div>

        {/* Messages */}
        <Card className="flex-1 border-border/50 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <Sparkles className="h-10 w-10 text-primary/30 mb-3" />
                <h3 className="font-semibold text-sm">Your AI Research Companion</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  I analyze your notes, projects, and bookmarks to suggest related Nobel discoveries and research directions.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 max-w-lg justify-center">
                  {SUGGESTION_CHIPS.map(chip => (
                    <Button key={chip} variant="outline" size="sm" className="text-[11px] h-7" onClick={() => sendMessage(chip)}>
                      <Lightbulb className="h-3 w-3 mr-1" />{chip}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted border border-border/50"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border/50 rounded-xl px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
            <div ref={scrollRef} />
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border/50">
            <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your research, discover connections..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
};

export default ResearchCopilotPage;
