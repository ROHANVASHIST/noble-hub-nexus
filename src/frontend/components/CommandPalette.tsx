import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home, BookOpen, Compass, Network, FlaskConical, GraduationCap,
  BarChart3, HelpCircle, TrendingUp, Search, User, Award,
  Brain, Trophy, Video, Bot, Target, Bell, Globe, Info,
  Timer, Layers, Bookmark, ListChecks, MessageSquare, FileText, Kanban,
  Highlighter, PieChart, Mail, CalendarCheck,
  AlarmClock, GitCompareArrows, Medal, Headphones, Zap, Clock, Cpu,
} from "lucide-react";

const PAGES = [
  { label: "Home", path: "/", icon: Home, group: "Navigate" },
  { label: "Library", path: "/laureates", icon: BookOpen, group: "Navigate" },
  { label: "Discovery", path: "/discovery", icon: Compass, group: "Navigate" },
  { label: "Connections", path: "/connections", icon: Network, group: "Navigate" },
  { label: "Search", path: "/search", icon: Search, group: "Navigate" },
  { label: "Research", path: "/research", icon: FlaskConical, group: "Research" },
  { label: "Lectures", path: "/lectures", icon: Video, group: "Research" },
  { label: "Mentorship", path: "/mentorship", icon: GraduationCap, group: "Research" },
  { label: "Scholar Dashboard", path: "/scholar-dashboard", icon: Brain, group: "Research" },
  { label: "Scientific Skills", path: "/scientific-skills", icon: Trophy, group: "Research" },
  { label: "Nobel Oracle AI", path: "/nobel-ai", icon: Bot, group: "Engage" },
  { label: "Analytics", path: "/analytics", icon: BarChart3, group: "Engage" },
  { label: "Quiz", path: "/quiz", icon: HelpCircle, group: "Engage" },
  { label: "Predictions", path: "/predictions", icon: TrendingUp, group: "Engage" },
  { label: "Notifications", path: "/notifications", icon: Bell, group: "Engage" },
  { label: "Tracker", path: "/tracker", icon: Target, group: "Engage" },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy, group: "Engage" },
  { label: "World Map", path: "/world-map", icon: Globe, group: "Engage" },
  { label: "Focus Timer", path: "/focus", icon: Timer, group: "Research" },
  { label: "Flashcards", path: "/flashcards", icon: Layers, group: "Research" },
  { label: "Bookmarks", path: "/bookmarks", icon: Bookmark, group: "Research" },
  { label: "Daily Goals", path: "/daily-goals", icon: ListChecks, group: "Research" },
  { label: "Study Rooms", path: "/study-rooms", icon: MessageSquare, group: "Research" },
  { label: "Research Planner", path: "/planner", icon: Kanban, group: "Research" },
  { label: "Citation Generator", path: "/citations", icon: FileText, group: "Research" },
  { label: "Progress Reports", path: "/progress", icon: BarChart3, group: "Research" },
  { label: "AI Study Plan", path: "/study-plan", icon: CalendarCheck, group: "Research" },
  { label: "Focus Statistics", path: "/focus-stats", icon: PieChart, group: "Research" },
  { label: "Annotations", path: "/annotations", icon: Highlighter, group: "Research" },
  { label: "Weekly Digest", path: "/weekly-digest", icon: Mail, group: "Research" },
  { label: "Reminders", path: "/reminders", icon: AlarmClock, group: "Research" },
  { label: "Compare Laureates", path: "/compare", icon: GitCompareArrows, group: "Research" },
  { label: "Voice Studio", path: "/voice-studio", icon: Headphones, group: "Research" },
  { label: "Deep Focus", path: "/deep-focus", icon: Zap, group: "Research" },
  { label: "Personal Insights", path: "/personal-insights", icon: TrendingUp, group: "Engage" },
  { label: "Achievements", path: "/achievements", icon: Medal, group: "Engage" },
  { label: "Impact Simulator", path: "/impact-simulator", icon: Zap, group: "Engage" },
  { label: "Knowledge Graph", path: "/knowledge-graph", icon: Network, group: "Navigate" },
  { label: "Time Machine", path: "/time-machine", icon: Clock, group: "Navigate" },
  { label: "Research Copilot", path: "/research-copilot", icon: Cpu, group: "Research" },
  { label: "Passport", path: "/passport", icon: Award, group: "Engage" },
  { label: "Profile", path: "/profile", icon: User, group: "Account" },
  { label: "About", path: "/about", icon: Info, group: "Info" },
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const groups = [...new Set(PAGES.map(p => p.group))];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, features..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group, gi) => (
          <div key={group}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {PAGES.filter(p => p.group === group).map(page => (
                <CommandItem
                  key={page.path}
                  onSelect={() => handleSelect(page.path)}
                  className="gap-3 cursor-pointer"
                >
                  <page.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{page.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
