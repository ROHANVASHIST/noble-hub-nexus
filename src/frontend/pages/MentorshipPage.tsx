import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import {
    Users, MessageSquare, FileBox, Bot, Send, Sparkles, Loader2, ArrowLeft, Hash, Save, History, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type ChatMsg = { role: "user" | "assistant"; content: string };

const MENTORS = [
    { name: "Albert Einstein", field: "Physics", description: "Expert in relativity and quantum theory.", welcome: "Welcome, young scholar. How can I help you understand the nature of space and time today?" },
    { name: "Marie Curie", field: "Chemistry", description: "Specialist in radioactivity and atomic physics.", welcome: "Greetings. Are you ready to explore the mysteries of the atomic world and radioactive elements?" },
    { name: "Geoffrey Hinton", field: "AI", description: "Pioneer in neural networks and machine learning.", welcome: "Hello. Let's discuss how neural networks can learn to represent the world." },
    { name: "Richard Feynman", field: "Physics", description: "Known for QED and engaging teaching styles.", welcome: "Hey! Let's dive into some quantum electrodynamics. No boring stuff allowed!" },
    { name: "Francis Crick", field: "Medicine", description: "Specialist in DNA and molecular biology.", welcome: "Hello. Ready to decode the secret of life found within our DNA?" },
    { name: "Daniel Kahneman", field: "Economics", description: "Expert in human judgment and decision-making.", welcome: "Greetings. Shall we analyze the biases that cloud human judgment?" },
    { name: "Gabriel García Márquez", field: "Literature", description: "Master of magical realism and narrative.", welcome: "Welcome to a world where reality and fantasy coexist. What story shall we tell?" },
    { name: "Malala Yousafzai", field: "Peace", description: "Activist for female education.", welcome: "Hello. How can we work together to ensure every child has the right to an education?" },
];

const STUDY_ROOMS = [
    { name: "Quantum Net", slug: "quantum-net" },
    { name: "Bio Ethics", slug: "bio-ethics" },
    { name: "Macro Lab", slug: "macro-lab" },
    { name: "General", slug: "general" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`;

const MentorshipPage = () => {
    const { user } = useAuth();
    const [selectedMentor, setSelectedMentor] = useState(MENTORS[0]);
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [chatHistoryList, setChatHistoryList] = useState<any[]>([]);
    const [displayName, setDisplayName] = useState("You");

    // Study room state
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [roomMessages, setRoomMessages] = useState<any[]>([]);
    const [roomInput, setRoomInput] = useState("");
    const [roomMemberCounts, setRoomMemberCounts] = useState<Record<string, number>>({});

    // Fetch profile display name
    useEffect(() => {
        if (!user) return;
        (supabase as any).from("profiles").select("display_name").eq("user_id", user.id).single()
            .then(({ data }: any) => {
                if (data?.display_name) setDisplayName(data.display_name);
            });
    }, [user]);

    // Load chat history list for selected mentor
    useEffect(() => {
        if (!user) return;
        (supabase as any).from("mentor_chat_history")
            .select("id, mentor_name, created_at, updated_at")
            .eq("user_id", user.id)
            .eq("mentor_name", selectedMentor.name)
            .order("updated_at", { ascending: false })
            .limit(20)
            .then(({ data }: any) => { if (data) setChatHistoryList(data); });
    }, [user, selectedMentor.name, activeChatId]);

    useEffect(() => {
        if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }, [messages, isTyping]);

    const handleMentorSelect = (mentor: typeof MENTORS[0]) => {
        setSelectedMentor(mentor);
        setMessages([]);
        setActiveChatId(null);
        toast.info(`Now speaking with ${mentor.name}`);
    };

    const saveChatToDb = async (allMessages: ChatMsg[]) => {
        if (!user || allMessages.length === 0) return;
        try {
            if (activeChatId) {
                await (supabase as any).from("mentor_chat_history").update({ messages: allMessages, updated_at: new Date().toISOString() }).eq("id", activeChatId);
            } else {
                const { data } = await (supabase as any).from("mentor_chat_history").insert({
                    user_id: user.id,
                    mentor_name: selectedMentor.name,
                    messages: allMessages,
                }).select("id").single();
                if (data) setActiveChatId(data.id);
            }
        } catch (e) { console.error("Failed to save chat:", e); }
    };

    const loadChat = async (chatId: string) => {
        const { data } = await (supabase as any).from("mentor_chat_history").select("messages, mentor_name").eq("id", chatId).single();
        if (data) {
            setMessages(data.messages || []);
            setActiveChatId(chatId);
        }
    };

    const deleteChat = async (chatId: string) => {
        await (supabase as any).from("mentor_chat_history").delete().eq("id", chatId);
        if (activeChatId === chatId) { setMessages([]); setActiveChatId(null); }
        setChatHistoryList(prev => prev.filter((c: any) => c.id !== chatId));
        toast.success("Chat deleted");
    };

    const startNewChat = () => { setMessages([]); setActiveChatId(null); };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isTyping) return;

        const userMsg: ChatMsg = { role: "user", content: chatInput };
        const allMessages = [...messages, userMsg];
        setMessages(allMessages);
        setChatInput("");
        setIsTyping(true);

        let assistantSoFar = "";
        try {
            const resp = await fetch(CHAT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
                body: JSON.stringify({
                    messages: allMessages,
                    mentorName: selectedMentor.name,
                    mentorField: selectedMentor.field,
                    mentorDescription: selectedMentor.description,
                    userName: displayName,
                }),
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                throw new Error(errData.error || `Error ${resp.status}`);
            }
            if (!resp.body) throw new Error("No response body");

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let textBuffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                textBuffer += decoder.decode(value, { stream: true });

                let newlineIndex: number;
                while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
                    let line = textBuffer.slice(0, newlineIndex);
                    textBuffer = textBuffer.slice(newlineIndex + 1);
                    if (line.endsWith("\r")) line = line.slice(0, -1);
                    if (line.startsWith(":") || line.trim() === "") continue;
                    if (!line.startsWith("data: ")) continue;
                    const jsonStr = line.slice(6).trim();
                    if (jsonStr === "[DONE]") break;
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            assistantSoFar += content;
                            setMessages(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                                return [...prev, { role: "assistant", content: assistantSoFar }];
                            });
                        }
                    } catch { textBuffer = line + "\n" + textBuffer; break; }
                }
            }

            // Save to DB after response complete
            const finalMessages = [...allMessages, { role: "assistant" as const, content: assistantSoFar }];
            setMessages(finalMessages);
            await saveChatToDb(finalMessages);
        } catch (error: any) {
            console.error("Mentor chat error:", error);
            toast.error(error.message || "Failed to connect to AI Mentor.");
            setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Study Room Logic
    useEffect(() => {
        if (!activeRoom) return;
        const fetchMessages = async () => {
            const { data } = await (supabase as any).from('study_room_messages').select('*').eq('room_name', activeRoom).order('created_at', { ascending: true }).limit(100);
            if (data) setRoomMessages(data);
        };
        fetchMessages();

        const channel = supabase.channel(`room-${activeRoom}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'study_room_messages', filter: `room_name=eq.${activeRoom}` }, (payload) => {
                setRoomMessages(prev => [...prev, payload.new]);
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeRoom]);

    // Track online users with presence
    useEffect(() => {
        if (!user) return;
        const channels = STUDY_ROOMS.map(room => {
            const ch = supabase.channel(`presence-${room.slug}`, { config: { presence: { key: user.id } } });
            ch.on('presence', { event: 'sync' }, () => {
                const state = ch.presenceState();
                setRoomMemberCounts(prev => ({ ...prev, [room.slug]: Object.keys(state).length }));
            }).subscribe(async (status) => {
                if (status === 'SUBSCRIBED' && activeRoom === room.slug) {
                    await ch.track({ user_id: user.id, online_at: new Date().toISOString() });
                }
            });
            return ch;
        });
        return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
    }, [user, activeRoom]);

    const handleSendRoomMessage = async () => {
        if (!roomInput.trim() || !activeRoom || !user) return;
        await (supabase as any).from('study_room_messages').insert({
            room_name: activeRoom,
            user_id: user.id,
            display_name: displayName,
            message: roomInput.trim(),
        });
        setRoomInput("");
    };

    const roomContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (roomContainerRef.current) roomContainerRef.current.scrollTop = roomContainerRef.current.scrollHeight;
    }, [roomMessages]);

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <header className="mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="font-display text-4xl font-bold text-foreground italic flex items-center gap-3">
                                <Users className="h-10 w-10 text-primary" /> Mentorship & Collaboration
                            </h1>
                            <p className="mt-2 text-muted-foreground max-w-xl">
                                Chat with AI-powered Nobel laureate mentors and collaborate in real-time study rooms. Your chats are saved automatically.
                            </p>
                        </div>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Mentor Selection + Chat History */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Bot className="h-4 w-4 text-primary" /> Select Mentor
                            </h2>
                            <div className="space-y-2">
                                {MENTORS.map(m => (
                                    <button key={m.name} onClick={() => handleMentorSelect(m)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedMentor.name === m.name ? "bg-primary/5 border-primary text-primary shadow-sm" : "border-transparent text-muted-foreground hover:bg-secondary/50"}`}>
                                        <div className="text-sm font-bold">{m.name}</div>
                                        <div className="text-[10px] uppercase font-bold tracking-tight opacity-70">{m.field}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <History className="h-4 w-4 text-primary" /> Saved Chats
                                </h2>
                                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold" onClick={startNewChat}>New Chat</Button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {chatHistoryList.map((chat: any) => (
                                    <div key={chat.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${activeChatId === chat.id ? "bg-primary/5 border-primary" : "border-border/30 hover:bg-secondary/50"}`}>
                                        <button className="flex-1 text-left" onClick={() => loadChat(chat.id)}>
                                            <div className="text-[10px] text-muted-foreground">{new Date(chat.updated_at).toLocaleDateString()}</div>
                                        </button>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                {chatHistoryList.length === 0 && <p className="text-[10px] text-muted-foreground italic text-center py-2">No saved chats yet</p>}
                            </div>
                        </div>
                    </div>

                    {/* Middle: AI Chat */}
                    <div className="lg:col-span-6">
                        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-sm relative">
                            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background/50 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Bot className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{selectedMentor.name}</div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AI Mentor Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-start">
                                    <div className="max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed bg-primary/10 text-foreground rounded-tl-none border border-primary/20 shadow-inner">
                                        {selectedMentor.welcome}
                                    </div>
                                </motion.div>

                                {messages.map((msg, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: msg.role === "assistant" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
                                        <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed ${msg.role === "assistant"
                                            ? "bg-primary/10 text-foreground rounded-tl-none border border-primary/20 shadow-inner prose prose-sm max-w-none"
                                            : "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20"}`}>
                                            {msg.role === "assistant" ? <ReactMarkdown>{msg.content}</ReactMarkdown> : (
                                                <div><div className="text-[10px] font-bold opacity-70 mb-1">{displayName}</div>{msg.content}</div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {isTyping && messages[messages.length - 1]?.role !== "assistant" && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                            <span className="text-xs font-bold text-muted-foreground uppercase">{selectedMentor.name.split(" ").pop()} is thinking...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="p-4 bg-background/50 border-t border-border/50 flex items-center gap-3">
                                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                                    placeholder={`Ask ${selectedMentor.name.split(" ").pop()} anything...`}
                                    className="flex-1 bg-secondary/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" disabled={isTyping} />
                                <Button onClick={handleSendMessage} disabled={isTyping} className="rounded-2xl h-10 w-10 p-0 flex items-center justify-center shrink-0">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Study Rooms */}
                    <div className="lg:col-span-3 space-y-4">
                        {!activeRoom ? (
                            <>
                                <div className="bg-violet-500/5 border border-violet-500/20 rounded-3xl p-6 shadow-sm">
                                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-violet-600 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" /> Live Study Rooms
                                    </h2>
                                    <div className="space-y-3">
                                        {STUDY_ROOMS.map(room => (
                                            <button key={room.slug} onClick={() => setActiveRoom(room.slug)}
                                                className="w-full flex items-center justify-between p-3 bg-background rounded-2xl border border-border/50 hover:border-violet-300 transition-all cursor-pointer">
                                                <span className="text-xs font-bold flex items-center gap-2"><Hash className="h-3 w-3 text-violet-500" /> {room.name}</span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />{roomMemberCounts[room.slug] || 0} online
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                                    <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-amber-500 opacity-5 -rotate-12" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-amber-600 flex items-center gap-2">
                                        <FileBox className="h-4 w-4" /> Quick Tips
                                    </h2>
                                    <div className="space-y-3 relative z-10 text-xs text-muted-foreground">
                                        <p>💡 Ask mentors about <strong>any</strong> topic — they stay in character!</p>
                                        <p>💬 Join study rooms to collaborate with peers in real-time.</p>
                                        <p>📝 Chats are saved automatically. Use "Saved Chats" to resume.</p>
                                        <p>👤 Your name from your profile is shown in chats.</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-sm">
                                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setActiveRoom(null); setRoomMessages([]); }}>
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                        <Hash className="h-4 w-4 text-violet-500" />
                                        <span className="text-sm font-bold">{STUDY_ROOMS.find(r => r.slug === activeRoom)?.name}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />{roomMemberCounts[activeRoom] || 0} online
                                    </span>
                                </div>

                                <div ref={roomContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                                    {roomMessages.length === 0 && <div className="text-center py-12 text-muted-foreground text-xs italic">No messages yet. Be the first to share an idea! 🚀</div>}
                                    {roomMessages.map((msg, i) => {
                                        const isOwn = msg.user_id === user?.id;
                                        return (
                                            <motion.div key={msg.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] ${isOwn ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-secondary/50 text-foreground rounded-tl-none border border-border/50'} p-3 rounded-2xl`}>
                                                    {!isOwn && <div className="text-[10px] font-bold text-primary mb-1">{msg.display_name}</div>}
                                                    <p className="text-sm">{msg.message}</p>
                                                    <div className="text-[9px] opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="p-3 border-t border-border/50 flex gap-2">
                                    <input type="text" value={roomInput} onChange={(e) => setRoomInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendRoomMessage()}
                                        placeholder="Share an idea..." className="flex-1 bg-secondary/50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500/20 outline-none" />
                                    <Button onClick={handleSendRoomMessage} size="sm" className="rounded-xl h-9 w-9 p-0 bg-violet-600 hover:bg-violet-700">
                                        <Send className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default MentorshipPage;
