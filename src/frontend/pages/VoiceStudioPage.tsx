import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/frontend/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLaureates, searchLaureates } from "@/backend/services/laureates";
import {
  Mic, MicOff, Volume2, Search, Play, Pause, Square,
  BookOpen, Headphones, StickyNote,
  Settings2, Clock, Trash2, Save
} from "lucide-react";
import { toast } from "sonner";

// ─── Web Speech API Helpers ─────────────────────────────────
const getSpeechRecognition = () => {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SR ? new SR() : null;
};

const getVoices = (): SpeechSynthesisVoice[] => window.speechSynthesis?.getVoices() || [];

// ─── Voice Note type ────────────────────────────────────────
interface VoiceNote {
  id: string;
  text: string;
  timestamp: string;
  duration: number;
}

const VoiceStudioPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  // ── TTS State ──
  const [ttsText, setTtsText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsPitch, setTtsPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsProgress, setTtsProgress] = useState(0);
  const ttsInterval = useRef<number | null>(null);

  // ── Voice Search State ──
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ── Voice Notes State ──
  const [isRecording, setIsRecording] = useState(false);
  const [noteTranscript, setNoteTranscript] = useState("");
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const noteRecognitionRef = useRef<any>(null);
  const recordingStart = useRef<number>(0);

  // ── Laureate Narration ──
  const [selectedLaureate, setSelectedLaureate] = useState<any>(null);

  const { data: laureates = [] } = useQuery({
    queryKey: ["voice-laureates"],
    queryFn: () => fetchLaureates(),
  });

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const v = getVoices();
      if (v.length > 0) {
        setVoices(v);
        const english = v.find(voice => voice.lang.startsWith("en"));
        if (english) setSelectedVoice(english.name);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // ─── TTS Functions ────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!text.trim() || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setTtsProgress(0);
      const totalLen = text.length;
      let charIndex = 0;
      ttsInterval.current = window.setInterval(() => {
        charIndex += utterance.rate * 15;
        setTtsProgress(Math.min(100, (charIndex / totalLen) * 100));
      }, 100);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setTtsProgress(100);
      if (ttsInterval.current) clearInterval(ttsInterval.current);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (ttsInterval.current) clearInterval(ttsInterval.current);
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, ttsRate, ttsPitch, voices]);

  const pauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setTtsProgress(0);
    if (ttsInterval.current) clearInterval(ttsInterval.current);
  };

  // ─── Voice Search Functions ───────────────────────────────
  const startListening = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) { toast.error("Speech recognition not supported in this browser"); return; }

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const result = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(result);
    };

    recognition.onend = async () => {
      setIsListening(false);
      const finalTranscript = transcript;
      if (finalTranscript.trim()) {
        setIsSearching(true);
        try {
          const results = await searchLaureates(finalTranscript.trim());
          setSearchResults(results.slice(0, 10));
        } catch {
          toast.error("Search failed");
        } finally {
          setIsSearching(false);
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Could not recognize speech. Try again.");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
    setSearchResults([]);
  }, [transcript]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ─── Voice Notes Functions ────────────────────────────────
  const startRecordingNote = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) { toast.error("Speech recognition not supported"); return; }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalText = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setNoteTranscript(finalText + interim);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => { setIsRecording(false); toast.error("Recording error"); };

    noteRecognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setNoteTranscript("");
    recordingStart.current = Date.now();
  }, []);

  const stopRecordingNote = () => {
    noteRecognitionRef.current?.stop();
    setIsRecording(false);
  };

  const saveVoiceNote = () => {
    if (!noteTranscript.trim()) return;
    const note: VoiceNote = {
      id: crypto.randomUUID(),
      text: noteTranscript.trim(),
      timestamp: new Date().toISOString(),
      duration: Math.round((Date.now() - recordingStart.current) / 1000),
    };
    setVoiceNotes(prev => [note, ...prev]);
    setNoteTranscript("");
    toast.success("Voice note saved!");
  };

  const saveNoteToScholar = useMutation({
    mutationFn: async (note: VoiceNote) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase as any).from("scholar_notes").insert({
        user_id: user.id,
        title: `Voice Note - ${new Date(note.timestamp).toLocaleDateString()}`,
        content: note.text,
        type: "note",
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved to Scholar Notes!"); qc.invalidateQueries({ queryKey: ["scholar-notes"] }); },
    onError: () => toast.error("Failed to save"),
  });

  // ─── Laureate narration ───────────────────────────────────
  const narrateLaureate = (l: any) => {
    setSelectedLaureate(l);
    const text = `${l.first_name} ${l.last_name}. Born in ${l.birth_year} in ${l.nationality}. ` +
      `Awarded the Nobel Prize in ${l.category} in ${l.year}. ` +
      `${l.motivation}. ` +
      (l.institution ? `Affiliated with ${l.institution}. ` : "") +
      (l.biography ? l.biography.slice(0, 500) : "");
    setTtsText(text);
    speak(text);
  };

  // Waveform animation dots
  const WaveformDots = ({ active }: { active: boolean }) => (
    <div className="flex items-center gap-0.5 h-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          animate={active ? {
            height: [4, 12 + Math.random() * 12, 4],
          } : { height: 4 }}
          transition={active ? {
            duration: 0.4 + Math.random() * 0.3,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.05,
          } : {}}
        />
      ))}
    </div>
  );

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Headphones className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Voice Studio</h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <p className="text-muted-foreground">Listen to laureate bios, search by voice, and dictate research notes hands-free.</p>
        </motion.div>

        <Tabs defaultValue="narrate" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="narrate" className="gap-2"><Volume2 className="h-4 w-4" /> Narrate</TabsTrigger>
            <TabsTrigger value="search" className="gap-2"><Search className="h-4 w-4" /> Voice Search</TabsTrigger>
            <TabsTrigger value="notes" className="gap-2"><Mic className="h-4 w-4" /> Voice Notes</TabsTrigger>
          </TabsList>

          {/* ─── NARRATE TAB ──────────────────────────────────── */}
          <TabsContent value="narrate" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
              {/* Main Player */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Text-to-Speech Reader</span>
                      <WaveformDots active={isSpeaking && !isPaused} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Enter text to read aloud, or select a laureate from the list..."
                      value={ttsText}
                      onChange={e => setTtsText(e.target.value)}
                      rows={6}
                      className="resize-none font-serif text-base leading-relaxed"
                    />

                    {isSpeaking && <Progress value={ttsProgress} className="h-1.5" />}

                    <div className="flex items-center gap-2">
                      {!isSpeaking ? (
                        <Button onClick={() => speak(ttsText)} disabled={!ttsText.trim()} className="gap-2">
                          <Play className="h-4 w-4" /> Play
                        </Button>
                      ) : (
                        <>
                          <Button onClick={pauseResume} variant="outline" className="gap-2">
                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                            {isPaused ? "Resume" : "Pause"}
                          </Button>
                          <Button onClick={stopSpeaking} variant="destructive" size="icon"><Square className="h-4 w-4" /></Button>
                        </>
                      )}
                      <div className="flex-1" />
                      <Badge variant="outline" className="text-xs">
                        {isSpeaking ? (isPaused ? "Paused" : "Speaking...") : "Ready"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Voice Settings */}
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Settings2 className="h-4 w-4" /> Voice Settings</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Voice</label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger><SelectValue placeholder="System default" /></SelectTrigger>
                        <SelectContent className="max-h-48">
                          {voices.map(v => (
                            <SelectItem key={v.name} value={v.name}>{v.name} ({v.lang})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block">Speed: {ttsRate.toFixed(1)}x</label>
                        <Slider value={[ttsRate]} onValueChange={v => setTtsRate(v[0])} min={0.5} max={2} step={0.1} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block">Pitch: {ttsPitch.toFixed(1)}</label>
                        <Slider value={[ttsPitch]} onValueChange={v => setTtsPitch(v[0])} min={0.5} max={2} step={0.1} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Laureate Selector */}
              <Card className="h-fit max-h-[60vh] flex flex-col">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Narrate</CardTitle></CardHeader>
                <CardContent className="overflow-y-auto flex-1 space-y-1.5 pr-2">
                  {laureates.slice(0, 30).map((l: any) => (
                    <button key={l.id} onClick={() => narrateLaureate(l)}
                      className={`w-full text-left p-2 rounded-lg border transition-colors hover:bg-muted/50 ${selectedLaureate?.id === l.id ? "border-primary bg-primary/5" : "border-transparent"}`}>
                      <div className="font-medium text-foreground text-sm">{l.first_name} {l.last_name}</div>
                      <div className="text-xs text-muted-foreground">{l.category} · {l.year}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── VOICE SEARCH TAB ─────────────────────────────── */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <motion.div
                    animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="mx-auto"
                  >
                    <Button
                      size="lg"
                      variant={isListening ? "destructive" : "default"}
                      onClick={isListening ? stopListening : startListening}
                      className="h-20 w-20 rounded-full"
                    >
                      {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </Button>
                  </motion.div>

                  <p className="text-muted-foreground text-sm">
                    {isListening ? "Listening... speak now" : "Tap to search by voice"}
                  </p>

                  {isListening && <WaveformDots active={true} />}

                  {transcript && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Badge variant="outline" className="text-base px-4 py-2">
                        "{transcript}"
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isSearching && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">{searchResults.length} results for "{transcript}"</h3>
                {searchResults.map((l: any, i) => (
                  <motion.div key={l.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="group cursor-pointer hover:border-primary/30 transition-colors" onClick={() => narrateLaureate(l)}>
                      <CardContent className="py-3 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {l.first_name?.[0]}{l.last_name?.[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{l.first_name} {l.last_name}</p>
                          <p className="text-xs text-muted-foreground">{l.category} · {l.year} · {l.nationality}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── VOICE NOTES TAB ──────────────────────────────── */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><StickyNote className="h-5 w-5" /> Voice Dictation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="min-h-[120px] p-4 rounded-lg border border-border bg-muted/20 font-serif text-base leading-relaxed">
                  {noteTranscript || <span className="text-muted-foreground italic">Start recording to dictate a note...</span>}
                </div>

                {isRecording && <WaveformDots active={true} />}

                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <Button onClick={startRecordingNote} className="gap-2">
                      <Mic className="h-4 w-4" /> Start Dictation
                    </Button>
                  ) : (
                    <Button onClick={stopRecordingNote} variant="destructive" className="gap-2">
                      <Square className="h-4 w-4" /> Stop
                    </Button>
                  )}

                  {noteTranscript && !isRecording && (
                    <>
                      <Button variant="outline" onClick={saveVoiceNote} className="gap-2">
                        <Save className="h-4 w-4" /> Save Locally
                      </Button>
                      <Button variant="secondary" onClick={() => {
                        if (noteTranscript.trim()) {
                          saveNoteToScholar.mutate({
                            id: crypto.randomUUID(),
                            text: noteTranscript.trim(),
                            timestamp: new Date().toISOString(),
                            duration: Math.round((Date.now() - recordingStart.current) / 1000),
                          });
                          setNoteTranscript("");
                        }
                      }} className="gap-2">
                        <BookOpen className="h-4 w-4" /> Save to Scholar Notes
                      </Button>
                    </>
                  )}

                  <div className="flex-1" />
                  {isRecording && (
                    <Badge variant="outline" className="animate-pulse text-red-500">
                      ● Recording
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Saved Voice Notes */}
            {voiceNotes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Session Notes ({voiceNotes.length})</h3>
                {voiceNotes.map((note, i) => (
                  <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="group">
                      <CardContent className="py-3 flex gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-foreground leading-relaxed">{note.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">
                              <Clock className="h-3 w-3 mr-1" /> {note.duration}s
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{new Date(note.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => speak(note.text)} title="Read aloud">
                            <Volume2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveNoteToScholar.mutate(note)} title="Save to Scholar Notes">
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setVoiceNotes(prev => prev.filter(n => n.id !== note.id))} title="Delete">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default VoiceStudioPage;
