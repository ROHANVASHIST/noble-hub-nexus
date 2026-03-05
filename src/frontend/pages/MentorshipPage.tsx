import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    Users,
    MessageSquare,
    FileBox,
    Bot,
    Send,
    UserCircle,
    Shapes,
    Download,
    Share2,
    Sparkles,
    Loader2,
    KeyRound
} from "lucide-react";
import { toast } from "sonner";

const MentorshipPage = () => {
    const mentors = [
        { name: "Albert Einstein", field: "Physics", description: "Expert in relativity and quantum theory.", welcome: "Welcome, young scholar. How can I help you understand the nature of space and time today?" },
        { name: "Marie Curie", field: "Chemistry", description: "Specialist in radioactivity and atomic physics.", welcome: "Greetings. Are you ready to explore the mysteries of the atomic world and radioactive elements?" },
        { name: "Geoffrey Hinton", field: "AI", description: "Pioneer in neural networks and machine learning.", welcome: "Hello. Let's discuss how neural networks can learn to represent the world." },
        { name: "Richard Feynman", field: "Physics", description: "Known for QED and engaging teaching styles.", welcome: "Hey! Let's dive into some quantum electrodynamics. No boring stuff allowed!" },
        { name: "Francis Crick", field: "Medicine", description: "Specialist in DNA and molecular biology.", welcome: "Hello. Ready to decode the secret of life found within our DNA?" },
        { name: "Daniel Kahneman", field: "Economics", description: "Expert in human judgment and decision-making.", welcome: "Greetings. Shall we analyze the biases that cloud human judgment?" },
        { name: "Gabriel García Márquez", field: "Literature", description: "Master of magical realism and narrative.", welcome: "Welcome to a world where reality and fantasy coexist. What story shall we tell?" },
        { name: "Malala Yousafzai", field: "Peace", description: "Activist for female education.", welcome: "Hello. How can we work together to ensure every child has the right to an education?" },
    ];

    const [selectedMentor, setSelectedMentor] = useState(mentors[0]);
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: "mentor", text: mentors[0].welcome },
    ]);

    const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || "");
    const [keyInput, setKeyInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isTyping]);

    const handleMentorSelect = (mentor: typeof mentors[0]) => {
        setSelectedMentor(mentor);
        setChatHistory([{ role: "mentor", text: mentor.welcome }]);
        toast.info(`Now speaking with ${mentor.name}`);
    };

    const handleSaveKey = () => {
        if (keyInput.trim()) {
            localStorage.setItem('gemini_api_key', keyInput.trim());
            setGeminiKey(keyInput.trim());
            toast.success("API Key saved securely to your browser.");
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        if (!geminiKey) {
            toast.error("Please provide a Gemini API Key to use the mentor AI.");
            return;
        }

        const userMsg = { role: "user", text: chatInput };
        setChatHistory(prev => [...prev, userMsg]);
        const currentInput = chatInput;
        setChatInput("");
        setIsTyping(true);

        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const chatContext = chatHistory.map(msg => `${msg.role === 'user' ? 'Student' : selectedMentor.name}: ${msg.text}`).join('\n');
            const fullPrompt = `You are ${selectedMentor.name}, a Nobel Laureate and expert in ${selectedMentor.field}. ${selectedMentor.description}. 
Respond to the user as this persona, offering mentorship, advice, and scientific insight. Be engaging and directly answer their prompts. Use markdown for structure if helpful.

Previous conversation history:
${chatContext}

Student: ${currentInput}
${selectedMentor.name}:`;

            const result = await model.generateContent(fullPrompt);
            const response = result.response.text();

            setChatHistory(prev => [...prev, {
                role: "mentor",
                text: response
            }]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            let errorMessage = "I'm having trouble connecting to my thought matrix right now.";
            if (error instanceof Error && error.message.includes("API key not valid")) {
                errorMessage = "Your API key appears to be invalid. Please check your settings.";
                setGeminiKey("");
                localStorage.removeItem('gemini_api_key');
            }
            toast.error("Failed to connect to AI Mentor.");
            setChatHistory(prev => [...prev, {
                role: "mentor",
                text: errorMessage
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <PageLayout>
            <div className="container mx-auto px-4 py-12">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                        <div>
                            <h1 className="font-display text-4xl font-bold text-foreground italic flex items-center gap-3">
                                <Users className="h-10 w-10 text-primary" /> Mentorship & Collaboration
                            </h1>
                            <p className="mt-2 text-muted-foreground max-w-xl">
                                Engage with AI-driven laureate personas and collaborate with peers using Nobel-standard research tools.
                            </p>
                        </div>
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-lg">
                                    <UserCircle className="h-full w-full text-muted-foreground" />
                                </div>
                            ))}
                            <div className="h-10 w-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-lg">
                                +42
                            </div>
                        </div>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: AI Mentors Selection (3/12) */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Bot className="h-4 w-4 text-primary" /> Select Mentor
                            </h2>
                            <div className="space-y-2">
                                {mentors.map(m => (
                                    <button
                                        key={m.name}
                                        onClick={() => handleMentorSelect(m)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedMentor.name === m.name ? "bg-primary/5 border-primary text-primary shadow-sm" : "border-transparent text-muted-foreground hover:bg-secondary/50"}`}
                                    >
                                        <div className="text-sm font-bold">{m.name}</div>
                                        <div className="text-[10px] uppercase font-bold tracking-tight opacity-70">{m.field}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-emerald-600 flex items-center gap-2">
                                <Shapes className="h-4 w-4" /> Poster Hub
                            </h2>
                            <p className="text-xs text-muted-foreground mb-4">Export research posters using standard Nobel formats.</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
                                    <Download className="h-3 w-3 mr-1" /> A0 PDF
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
                                    <Download className="h-3 w-3 mr-1" /> PPTX
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Chat Experience (6/12) */}
                    <div className="lg:col-span-6">
                        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-sm relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                            {!geminiKey && (
                                <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border-b border-border/50 rounded-3xl">
                                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                        <Bot className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-display font-bold mb-3">Unlock AI Mentorship</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">Enter your Google Gemini API key to establish a neural link and chat with authentic Nobel Laureate personas.</p>

                                    <div className="flex w-full max-w-sm gap-3">
                                        <div className="relative flex-1">
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                placeholder="AIzaSy..."
                                                className="pl-10 h-12 rounded-xl bg-secondary/50 border-white/5 focus:border-primary/30"
                                                value={keyInput}
                                                onChange={e => setKeyInput(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && handleSaveKey()}
                                            />
                                        </div>
                                        <Button className="h-12 px-6 rounded-xl font-bold" onClick={handleSaveKey}>
                                            Connect <Sparkles className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-8 uppercase tracking-widest font-bold">
                                        Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">Google AI Studio</a>
                                    </p>
                                </div>
                            )}

                            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background/50 backdrop-blur-md relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Bot className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{selectedMentor.name}</div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Thought Matrix Active</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6 relative z-10">
                                {chatHistory.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: msg.role === "mentor" ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex ${msg.role === "mentor" ? "justify-start" : "justify-end"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed prose prose-invert overflow-hidden ${msg.role === "mentor"
                                                ? "bg-primary/10 text-foreground rounded-tl-none border border-primary/20 shadow-inner"
                                                : "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20"
                                                }`}
                                        >
                                            {msg.role === "mentor" ? (
                                                <div className="whitespace-pre-wrap">
                                                    {msg.text.split('\n').map((line, idx) => {
                                                        if (line.startsWith('###')) {
                                                            return <h3 key={idx} className="text-lg font-bold text-primary mt-4 mb-2">{line.replace('###', '')}</h3>;
                                                        }
                                                        if (line.startsWith('**')) {
                                                            return <p key={idx} className="font-bold text-foreground mt-2">{line.replace(/\*\*/g, '')}</p>;
                                                        }
                                                        if (line.startsWith('>')) {
                                                            return <blockquote key={idx} className="border-l-4 border-primary/30 pl-4 py-1 my-4 italic text-muted-foreground bg-secondary/20 rounded-r-lg">{line.replace('>', '')}</blockquote>;
                                                        }
                                                        if (line.startsWith('-')) {
                                                            return <li key={idx} className="ml-4 list-disc text-muted-foreground">{line.replace('-', '').trim()}</li>;
                                                        }
                                                        return <p key={idx} className="mb-2">{line}</p>;
                                                    })}
                                                </div>
                                            ) : (
                                                msg.text
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                            <span className="text-xs font-bold text-muted-foreground uppercase">{selectedMentor.name.split(" ").pop()} is thinking...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="p-4 bg-background/50 border-t border-border/50 flex items-center gap-3 relative z-10">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                    placeholder={`Ask ${selectedMentor.name.split(" ").pop()} a question...`}
                                    className="flex-1 bg-secondary/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    className="rounded-2xl h-10 w-10 p-0 flex items-center justify-center shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Collaboration & Feeds (3/12) */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-violet-500/5 border border-violet-500/20 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-violet-600 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> Study Rooms
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { name: "Quantum Net", base: 24 },
                                    { name: "Bio Ethics", base: 12 },
                                    { name: "Macro Lab", base: 8 },
                                ].map(room => {
                                    const [members, setMembers] = useState(room.base);
                                    useEffect(() => {
                                        const interval = setInterval(() => {
                                            const change = Math.floor(Math.random() * 3) - 1;
                                            setMembers(prev => Math.max(1, prev + change));
                                        }, 3000 + Math.random() * 2000);
                                        return () => clearInterval(interval);
                                    }, []);
                                    return (
                                        <div key={room.name} className="flex items-center justify-between p-3 bg-background rounded-2xl border border-border/50 hover:border-violet-300 transition-all cursor-pointer">
                                            <span className="text-xs font-bold">{room.name}</span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> {members} online
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <Button variant="ghost" className="w-full mt-4 text-[10px] uppercase font-bold tracking-widest text-violet-600 hover:bg-violet-500/10">
                                Join General Room
                            </Button>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                            <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-amber-500 opacity-5 -rotate-12" />
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-amber-600 flex items-center gap-2">
                                <FileBox className="h-4 w-4" /> Conference Prep
                            </h2>
                            <div className="space-y-4 relative z-10">
                                <div className="p-3 bg-secondary/30 rounded-2xl border border-border/50">
                                    <div className="text-[10px] font-bold text-amber-600 uppercase mb-1 italic line-clamp-1">Nobel Prize Physiology 2026 Submission</div>
                                    <div className="text-xs font-bold">Drafting Abstract v4 (Shared)</div>
                                </div>
                                <Button size="sm" variant="outline" className="w-full rounded-xl border-amber-500/20 text-amber-600 hover:bg-amber-500/10 h-8">
                                    Open Shared Editor
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default MentorshipPage;
