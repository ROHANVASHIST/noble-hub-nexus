import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, Users, Hash, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ROOMS = [
  { name: "general", label: "General", desc: "Open discussion" },
  { name: "physics", label: "Physics", desc: "Quantum, relativity, particles" },
  { name: "chemistry", label: "Chemistry", desc: "Molecular, organic, materials" },
  { name: "medicine", label: "Medicine", desc: "Biology, health, genetics" },
  { name: "literature", label: "Literature", desc: "Writing, culture, arts" },
  { name: "peace", label: "Peace", desc: "Diplomacy, activism, rights" },
  { name: "economics", label: "Economics", desc: "Markets, policy, finance" },
];

type Message = {
  id: string;
  user_id: string;
  display_name: string;
  message: string;
  created_at: string;
};

const StudyRoomsPage = () => {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const [room, setRoom] = useState("general");
  const [msg, setMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayName = session?.user.user_metadata?.display_name || session?.user.email?.split("@")[0] || "Scholar";

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["room-messages", room],
    queryFn: async () => {
      const { data } = await supabase
        .from("study_room_messages")
        .select("*")
        .eq("room_name", room)
        .order("created_at", { ascending: true })
        .limit(100);
      return (data || []) as Message[];
    },
    refetchInterval: 3000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`room-${room}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "study_room_messages", filter: `room_name=eq.${room}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["room-messages", room] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room, queryClient]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!user || !msg.trim()) return;
      const { error } = await supabase.from("study_room_messages").insert({
        user_id: user.id,
        room_name: room,
        display_name: displayName,
        message: msg.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMsg("");
      queryClient.invalidateQueries({ queryKey: ["room-messages", room] });
    },
  });

  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Study Rooms</h1>
              <p className="text-sm text-muted-foreground">Collaborate with fellow scholars in real-time.</p>
            </div>
          </div>

          <div className="flex gap-4 h-[calc(100vh-280px)]">
            {/* Room List */}
            <div className="w-56 shrink-0 rounded-2xl border border-border bg-card/50 p-3 space-y-1 overflow-y-auto">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">Channels</p>
              {ROOMS.map(r => (
                <button
                  key={r.name}
                  onClick={() => setRoom(r.name)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-sm ${
                    room === r.name
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{r.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 pl-5 truncate">{r.desc}</p>
                </button>
              ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col rounded-2xl border border-border bg-card/50 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground">{ROOMS.find(r => r.name === room)?.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{messages.length} messages</span>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map(m => {
                      const isMe = m.user_id === user?.id;
                      return (
                        <div key={m.id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                          <Avatar className="h-7 w-7 rounded-lg shrink-0">
                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                              {m.display_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[70%] ${isMe ? "text-right" : ""}`}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-bold text-foreground">{m.display_name}</span>
                              <span className="text-[9px] text-muted-foreground/50">{formatTime(m.created_at)}</span>
                            </div>
                            <p className={`text-sm px-3 py-2 rounded-xl inline-block ${
                              isMe ? "bg-primary/10 text-foreground" : "bg-muted/30 text-foreground"
                            }`}>
                              {m.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-border">
                <form
                  onSubmit={e => { e.preventDefault(); sendMessage.mutate(); }}
                  className="flex gap-2"
                >
                  <Input
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    placeholder={`Message #${room}...`}
                    className="rounded-xl"
                  />
                  <Button type="submit" disabled={!msg.trim()} className="rounded-xl px-4">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default StudyRoomsPage;
