import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./frontend/pages/Index";
import LaureatesPage from "./frontend/pages/LaureatesPage";
import LecturesPage from "./frontend/pages/LecturesPage";
import ResearchPage from "./frontend/pages/ResearchPage";
import AnalyticsPage from "./frontend/pages/AnalyticsPage";
import SearchPage from "./frontend/pages/SearchPage";
import Auth from "./frontend/pages/Auth";
import Profile from "./frontend/pages/Profile";
import LaureateProfile from "./frontend/pages/LaureateProfile";
import AboutPage from "./frontend/pages/AboutPage";
import PrivacyPage from "./frontend/pages/PrivacyPage";
import TermsPage from "./frontend/pages/TermsPage";
import ScholarDashboard from "./frontend/pages/ScholarDashboard";
import ScientificSkills from "./frontend/pages/ScientificSkills";
import MentorshipPage from "./frontend/pages/MentorshipPage";
import ScholarToolPage from "./frontend/pages/ScholarToolPage";
import NotFound from "./frontend/pages/NotFound";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = ({ children, session }: { children: React.ReactNode, session: any }) => {
  if (session === undefined) return <div className="flex h-screen w-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!session) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute session={session}><Index /></ProtectedRoute>} />
            <Route path="/laureates" element={<ProtectedRoute session={session}><LaureatesPage /></ProtectedRoute>} />
            <Route path="/laureates/:id" element={<ProtectedRoute session={session}><LaureateProfile /></ProtectedRoute>} />
            <Route path="/lectures" element={<ProtectedRoute session={session}><LecturesPage /></ProtectedRoute>} />
            <Route path="/research" element={<ProtectedRoute session={session}><ResearchPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute session={session}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute session={session}><SearchPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute session={session}><Profile /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute session={session}><AboutPage /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute session={session}><PrivacyPage /></ProtectedRoute>} />
            <Route path="/terms" element={<ProtectedRoute session={session}><TermsPage /></ProtectedRoute>} />
            <Route path="/scholar-dashboard" element={<ProtectedRoute session={session}><ScholarDashboard /></ProtectedRoute>} />
            <Route path="/scientific-skills" element={<ProtectedRoute session={session}><ScientificSkills /></ProtectedRoute>} />
            <Route path="/mentorship" element={<ProtectedRoute session={session}><MentorshipPage /></ProtectedRoute>} />
            <Route path="/scholar-os/:toolId" element={<ProtectedRoute session={session}><ScholarToolPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
