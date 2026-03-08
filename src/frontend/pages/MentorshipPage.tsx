import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import {
    Users, MessageSquare, FileBox, Bot, Send, Sparkles, Loader2, ArrowLeft, Hash, Save, History, Trash2, Copy, Download, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type ChatMsg = { role: "user" | "assistant"; content: string };

const MENTORS = [
    { name: "Albert Einstein", field: "Theoretical Physics", description: "Expert in special/general relativity, quantum mechanics, and the photoelectric effect. Known for vivid thought experiments and deep philosophical thinking about the nature of reality.", welcome: "Ah, welcome! You know, the important thing is not to stop questioning. Curiosity has its own reason for existence. Tell me — what mystery of the universe keeps you awake at night?" },
    { name: "Marie Curie", field: "Radiochemistry & Physics", description: "Pioneer of radioactivity research, first woman to win a Nobel Prize, and the only person to win Nobel Prizes in two different sciences. Known for extraordinary perseverance and methodological rigor.", welcome: "Welcome to my laboratory, dear student. In science, we must be interested in things, not in persons. What research question burns in your mind today?" },
    { name: "Richard Feynman", field: "Quantum Electrodynamics", description: "Pioneer in QED, path integrals, and nanotechnology. Known for his playful curiosity, bongo drums, safe-cracking, and extraordinary ability to explain complex concepts simply.", welcome: "Hey! You know, nobody understands quantum mechanics — and that's totally fine! The fun is in figuring it out. So what are we figuring out today?" },
    { name: "Geoffrey Hinton", field: "Deep Learning & AI", description: "Godfather of deep learning, pioneer of backpropagation, Boltzmann machines, and capsule networks. Recently focused on AI safety and the risks of superintelligence.", welcome: "Hello there. Neural networks are fascinating because they learn representations we didn't explicitly program. What aspect of machine learning are you exploring?" },
    { name: "Francis Crick", field: "Molecular Biology", description: "Co-discoverer of the double helix structure of DNA with Watson. Later pioneered consciousness research. Known for bold hypotheses and interdisciplinary thinking.", welcome: "Hello. The secret of life is written in a four-letter alphabet — A, T, G, C. But understanding it requires thinking across biology, physics, and chemistry. What shall we decode together?" },
    { name: "Daniel Kahneman", field: "Behavioral Economics", description: "Pioneer of prospect theory and behavioral economics. Expert in cognitive biases, heuristics, and the psychology of judgment and decision-making under uncertainty.", welcome: "Greetings. Our minds are remarkable but deeply flawed instruments. System 1 thinks fast, System 2 thinks slow — and most researchers don't know which one is driving their decisions. Shall we examine yours?" },
    { name: "Gabriel García Márquez", field: "Literature & Narrative", description: "Master of magical realism. Nobel Prize in Literature for his novels including 'One Hundred Years of Solitude'. Expert in narrative structure, storytelling, and the intersection of fiction and reality.", welcome: "Welcome to a world where reality is stranger than fiction, and fiction reveals truths that reality conceals. What story are you trying to tell through your research?" },
    { name: "Malala Yousafzai", field: "Education & Peace", description: "Youngest Nobel Peace Prize laureate. Activist for female education and human rights. Expert in education policy, advocacy, and social change.", welcome: "Hello, friend. One child, one teacher, one book, one pen can change the world. How are you using your education to make a difference?" },
    { name: "Tu Youyou", field: "Pharmaceutical Chemistry", description: "Discoverer of artemisinin for malaria treatment by studying traditional Chinese medicine. Nobel Prize in Medicine 2015. Pioneer of integrating traditional knowledge with modern science.", welcome: "Welcome. My discovery came from reading 2,000-year-old texts with modern eyes. Sometimes the answers to our biggest challenges are hidden in unexpected places. What are you searching for?" },
    { name: "Niels Bohr", field: "Atomic Physics", description: "Pioneer of atomic structure and quantum theory. Founded the Copenhagen interpretation. Known for deep debates with Einstein and complementarity principle.", welcome: "Welcome, young physicist. Remember — if quantum mechanics hasn't profoundly shocked you, you haven't understood it yet. What aspect of the quantum world puzzles you?" },
    { name: "Rosalind Franklin", field: "X-ray Crystallography", description: "Expert in X-ray diffraction whose Photo 51 was crucial to understanding DNA structure. Pioneer of structural biology and virology.", welcome: "Good day. Science and everyday life cannot and should not be separated. Let's look at the evidence together — what structures are you trying to reveal?" },
    { name: "John Nash", field: "Game Theory & Mathematics", description: "Pioneer of game theory, Nash equilibrium, and differential geometry. Nobel Prize in Economics 1994. Expert in strategic decision-making and mathematical modeling.", welcome: "Hello. In game theory, the best outcome depends not just on your strategy, but on everyone else's. What strategic problem are you trying to solve?" },
];

const STUDY_ROOMS = [
    { name: "Quantum Net", slug: "quantum-net", description: "Physics & quantum computing" },
    { name: "Bio Ethics", slug: "bio-ethics", description: "Bioethics & medical research" },
    { name: "Macro Lab", slug: "macro-lab", description: "Economics & social science" },
    { name: "AI Safety", slug: "ai-safety", description: "AI alignment & ML research" },
    { name: "General", slug: "general", description: "Open discussion" },
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
    const [mentorSearch, setMentorSearch] = useState("");

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
            .select("id, mentor_name, created_at, updated_at, messages")
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

    const exportChat = () => {
        if (messages.length === 0) { toast.error("No messages to export"); return; }
        const content = messages.map(m => `**${m.role === 'user' ? displayName : selectedMentor.name}:**\n${m.content}`).join('\n\n---\n\n');
        const blob = new Blob([`# Conversation with ${selectedMentor.name}\n\n${content}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${selectedMentor.name.replace(/\s/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Chat exported as Markdown");
    };

    const copyLastResponse = () => {
        const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
        if (lastAssistant) {
            navigator.clipboard.writeText(lastAssistant.content);
            toast.success("Response copied to clipboard");
        }
    };

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

    const filteredMentors = MENTORS.filter(m =>
        m.name.toLowerCase().includes(mentorSearch.toLowerCase()) ||
        m.field.toLowerCase().includes(mentorSearch.toLowerCase())
    );

    const getChatPreview = (chat: any) => {
        const msgs = chat.messages;
        if (!msgs || !Array.isArray(msgs) || msgs.length === 0) return "Empty chat";
        const firstUser = msgs.find((m: any) => m.role === 'user');
        return firstUser ? firstUser.content.slice(0, 50) + (firstUser.content.length > 50 ? '...' : '') : "Chat";
    };

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
                                Chat with AI-powered Nobel laureate mentors who respond in-character with deeply detailed, research-grade guidance. Your chats are saved automatically.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold uppercase tracking-widest" onClick={exportChat}>
                                <Download className="h-3 w-3 mr-1" /> Export Chat
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold uppercase tracking-widest" onClick={copyLastResponse}>
                                <Copy className="h-3 w-3 mr-1" /> Copy Last
                            </Button>
                        </div>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Mentor Selection + Chat History */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Bot className="h-4 w-4 text-primary" /> Select Mentor ({MENTORS.length})
                            </h2>
                            <input
                                type="text"
                                value={mentorSearch}
                                onChange={(e) => setMentorSearch(e.target.value)}
                                placeholder="Search mentors..."
                                className="w-full mb-3 px-3 py-2 text-xs rounded-xl border border-border/50 bg-secondary/30 focus:outline-none focus:ring-1 focus:ring-primary/30"
                            />
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                {filteredMentors.map(m => (
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
                                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold" onClick={startNewChat}>
                                    <RefreshCw className="h-3 w-3 mr-1" /> New
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {chatHistoryList.map((chat: any) => (
                                    <div key={chat.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${activeChatId === chat.id ? "bg-primary/5 border-primary" : "border-border/30 hover:bg-secondary/50"}`}>
                                        <button className="flex-1 text-left" onClick={() => loadChat(chat.id)}>
                                            <div className="text-xs font-medium line-clamp-1">{getChatPreview(chat)}</div>
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
                        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden flex flex-col h-[650px] shadow-sm relative">
                            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background/50 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Bot className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{selectedMentor.name}</div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{selectedMentor.field}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {messages.length > 0 && `${messages.length} messages`}
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
                                        <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed group relative ${msg.role === "assistant"
                                            ? "bg-primary/10 text-foreground rounded-tl-none border border-primary/20 shadow-inner prose prose-sm max-w-none"
                                            : "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20"}`}>
                                            {msg.role === "assistant" ? (
                                                <>
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("Copied!"); }}
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-background/50 hover:bg-background"
                                                    >
                                                        <Copy className="h-3 w-3 text-muted-foreground" />
                                                    </button>
                                                </>
                                            ) : (
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
                                                <div className="text-left">
                                                    <span className="text-xs font-bold flex items-center gap-2"><Hash className="h-3 w-3 text-violet-500" /> {room.name}</span>
                                                    <div className="text-[9px] text-muted-foreground mt-0.5">{room.description}</div>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />{roomMemberCounts[room.slug] || 0}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                                    <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-amber-500 opacity-5 -rotate-12" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-amber-600 flex items-center gap-2">
                                        <FileBox className="h-4 w-4" /> Mentor Tips
                                    </h2>
                                    <div className="space-y-3 relative z-10 text-xs text-muted-foreground">
                                        <p>🎭 Each mentor has a <strong>unique personality</strong> — try asking the same question to different mentors!</p>
                                        <p>📚 Ask about <strong>their real discoveries</strong> — "Tell me about your work on relativity"</p>
                                        <p>🔬 Request <strong>research methodology advice</strong> specific to your field</p>
                                        <p>💬 Conversations are <strong>auto-saved</strong> and you can export them as Markdown</p>
                                        <p>👤 Your profile name ({displayName}) appears in chats</p>
                                    </div>
                                </div>

                                {/* Conversation Starters */}
                                <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-primary">
                                        <Sparkles className="h-4 w-4" /> Try Asking
                                    </h2>
                                    <div className="space-y-2">
                                        {[
                                            "What was your biggest research failure?",
                                            "How should I structure my dissertation?",
                                            "What advice would you give your younger self?",
                                            "Explain your most important discovery simply",
                                        ].map((q, i) => (
                                            <button key={i} onClick={() => setChatInput(q)}
                                                className="w-full text-left p-3 text-xs bg-secondary/30 rounded-xl hover:bg-secondary transition-colors border border-border/30 italic text-muted-foreground hover:text-foreground line-clamp-1">
                                                "{q}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden flex flex-col h-[650px] shadow-sm">
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
