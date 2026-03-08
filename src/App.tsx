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
import QuizPage from "./frontend/pages/QuizPage";
import DiscoveryPage from "./frontend/pages/DiscoveryPage";
import ConnectionsPage from "./frontend/pages/ConnectionsPage";
import PredictionsPage from "./frontend/pages/PredictionsPage";
import NotFound from "./frontend/pages/NotFound";
import { useAuthReady } from "@/frontend/hooks/useAuthReady";
import React, { createContext, useContext } from "react";
import type { User, Session } from "@supabase/supabase-js";

// Auth context so child pages never need their own auth checks
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isReady: boolean;
}
const AuthContext = createContext<AuthContextType>({ user: null, session: null, isReady: false });
export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children, session, isReady }: { children: React.ReactNode; session: Session | null; isReady: boolean }) => {
  if (!isReady) return <div className="flex h-screen w-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  const { user, session, isReady } = useAuthReady();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, session, isReady }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={isReady && session ? <Navigate to="/" replace /> : <Auth />} />
              <Route path="/" element={<ProtectedRoute session={session} isReady={isReady}><Index /></ProtectedRoute>} />
              <Route path="/laureates" element={<ProtectedRoute session={session} isReady={isReady}><LaureatesPage /></ProtectedRoute>} />
              <Route path="/laureates/:id" element={<ProtectedRoute session={session} isReady={isReady}><LaureateProfile /></ProtectedRoute>} />
              <Route path="/lectures" element={<ProtectedRoute session={session} isReady={isReady}><LecturesPage /></ProtectedRoute>} />
              <Route path="/research" element={<ProtectedRoute session={session} isReady={isReady}><ResearchPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute session={session} isReady={isReady}><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute session={session} isReady={isReady}><SearchPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute session={session} isReady={isReady}><Profile /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute session={session} isReady={isReady}><AboutPage /></ProtectedRoute>} />
              <Route path="/privacy" element={<ProtectedRoute session={session} isReady={isReady}><PrivacyPage /></ProtectedRoute>} />
              <Route path="/terms" element={<ProtectedRoute session={session} isReady={isReady}><TermsPage /></ProtectedRoute>} />
              <Route path="/scholar-dashboard" element={<ProtectedRoute session={session} isReady={isReady}><ScholarDashboard /></ProtectedRoute>} />
              <Route path="/scientific-skills" element={<ProtectedRoute session={session} isReady={isReady}><ScientificSkills /></ProtectedRoute>} />
              <Route path="/mentorship" element={<ProtectedRoute session={session} isReady={isReady}><MentorshipPage /></ProtectedRoute>} />
              <Route path="/scholar-os/:toolId" element={<ProtectedRoute session={session} isReady={isReady}><ScholarToolPage /></ProtectedRoute>} />
              <Route path="/quiz" element={<ProtectedRoute session={session} isReady={isReady}><QuizPage /></ProtectedRoute>} />
              <Route path="/discovery" element={<ProtectedRoute session={session} isReady={isReady}><DiscoveryPage /></ProtectedRoute>} />
              <Route path="/connections" element={<ProtectedRoute session={session} isReady={isReady}><ConnectionsPage /></ProtectedRoute>} />
              <Route path="/predictions" element={<ProtectedRoute session={session} isReady={isReady}><PredictionsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
