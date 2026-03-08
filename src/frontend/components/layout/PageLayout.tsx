import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import AppSidebar from "./AppSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUp, Brain, Search, Command, Award } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/App";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationDropdown from "@/frontend/components/NotificationDropdown";

const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/laureates": "Library",
  "/discovery": "Discovery",
  "/connections": "Connections",
  "/search": "Search",
  "/research": "Research",
  "/lectures": "Lectures",
  "/mentorship": "Mentorship",
  "/scholar-dashboard": "Dashboard",
  "/scientific-skills": "Skills Lab",
  "/nobel-ai": "Nobel Oracle",
  "/analytics": "Analytics",
  "/quiz": "Quiz",
  "/predictions": "Predictions",
  "/notifications": "Notifications",
  "/tracker": "Tracker",
  "/world-map": "World Map",
  "/leaderboard": "Leaderboard",
  "/profile": "Profile",
  "/about": "About",
  "/privacy": "Privacy",
  "/terms": "Terms",
};

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const pageTitle = PAGE_TITLES[pathname] || (pathname.startsWith("/laureates/") ? "Laureate Profile" : "");

  const userInitials = session
    ? (session.user.user_metadata?.display_name || session.user.email || "U").slice(0, 2).toUpperCase()
    : "";

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <SidebarProvider>
      <div className="relative min-h-screen flex w-full bg-background text-foreground selection:bg-primary/30 selection:text-primary">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0], x: [0, -50, 0], y: [0, 100, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] -right-[10%] h-[60%] w-[60%] rounded-full bg-accent/5 blur-[150px]"
          />
        </div>

        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

            {/* Breadcrumb / Page Title */}
            <div className="flex items-center gap-2 min-w-0">
              <Award className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                {pageTitle}
              </span>
            </div>

            <div className="flex-1" />

            {/* Search shortcut */}
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
                document.dispatchEvent(event);
              }}
              className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <Search className="h-3 w-3" />
              <span>Search</span>
              <kbd className="ml-1 flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User avatar */}
            {session && (
              <button
                onClick={() => navigate("/profile")}
                className="shrink-0"
              >
                <Avatar className="h-8 w-8 rounded-lg border border-border hover:border-primary/30 transition-all">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            )}
          </header>

          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex-1 pb-20"
            >
              {children}
            </motion.main>
          </AnimatePresence>

          <Footer />
        </div>

        {/* Floating AI Scholar Assistant */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-24 right-8 z-[60] flex flex-col gap-3"
        >
          <button
            onClick={() => { window.location.href = '/scholar-os/scholar-ai'; }}
            className="h-14 w-14 rounded-2xl bg-background border border-border shadow-2xl flex items-center justify-center group relative hover:border-primary/50 transition-all hover:shadow-primary/20"
            title="Ask Scholar AI"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <Brain className="h-6 w-6 text-primary group-hover:scale-110 transition-transform relative z-10" />
            <div className="absolute right-full mr-4 bg-background border border-border px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
              Scholar AI OS
            </div>
          </button>
        </motion.div>

        {/* Scroll to Top */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-8 right-8 z-[60] flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 transition-transform hover:scale-110 active:scale-95"
            >
              <ArrowUp className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </SidebarProvider>
  );
};

export default PageLayout;
