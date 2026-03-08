import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Loader2, Bot, User, Trash2, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nobel-ai`;

const SUGGESTED_QUESTIONS = [
  "Who are the youngest Nobel Prize winners in history?",
  "Explain the discovery behind CRISPR and its Nobel Prize",
  "Compare Marie Curie and Lise Meitner's contributions to physics",
  "What countries have won the most Nobel Prizes and why?",
  "Tell me about the most controversial Nobel Prize decisions",
  "How has the Nobel Peace Prize evolved over the decades?",
  "What is the connection between Einstein and the photoelectric effect?",
  "Which Nobel laureates were teacher-student pairs?",
];

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

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
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

const NobelAIPage = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isStreaming) return;
    setInput("");

    const userMsg: Msg = { role: "user", content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);

    let assistantContent = "";

    const upsert = (chunk: string) => {
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
      await streamChat({
        messages: updatedMessages,
        onDelta: upsert,
        onDone: () => setIsStreaming(false),
        onError: (err) => {
          toast.error(err);
          setIsStreaming(false);
        },
      });
    } catch {
      toast.error("Failed to connect to AI.");
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4 shrink-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Nobel Oracle AI</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Ask anything about Nobel Prizes</h1>
          <p className="text-sm text-muted-foreground mt-1">125 years of laureates, discoveries, lectures, and history — all at your fingertips.</p>
        </motion.div>

        {/* Chat Area */}
        <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 px-2 pb-4 min-h-0">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center justify-center h-full">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center mb-6 border border-primary/10">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">What would you like to know?</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-md text-center">
                I can answer questions about any Nobel laureate, prize, discovery, or historical event from 1901 to today.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 max-w-2xl w-full">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-xl border border-border bg-card/50 text-sm text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`relative group max-w-[80%] ${msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3"
                  : "bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3"}`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  {msg.role === "assistant" && msg.content && (
                    <button
                      onClick={() => copyMessage(msg.content)}
                      className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-muted hover:bg-muted/80 transition-all"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 pt-2 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            {messages.length > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={clearChat} className="text-[10px] uppercase tracking-widest gap-1 text-muted-foreground">
                  <Trash2 className="h-3 w-3" /> Clear
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { const last = messages.filter(m => m.role === "user").pop(); if (last) sendMessage(last.content); }} className="text-[10px] uppercase tracking-widest gap-1 text-muted-foreground">
                  <RotateCcw className="h-3 w-3" /> Retry
                </Button>
              </>
            )}
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-amber-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-40 transition duration-500" />
            <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any Nobel Prize, laureate, or discovery..."
                rows={1}
                className="flex-1 bg-transparent border-0 resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[40px] max-h-[120px] px-2 py-2"
                style={{ height: "auto", overflow: "hidden" }}
                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                size="icon"
                className="rounded-xl h-10 w-10 shrink-0"
              >
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Nobel Oracle uses AI to answer questions. Responses may occasionally contain inaccuracies.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default NobelAIPage;
