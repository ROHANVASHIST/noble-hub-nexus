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
import NobelAIPage from "./frontend/pages/NobelAIPage";
import NotificationsPage from "./frontend/pages/NotificationsPage";
import TrackerPage from "./frontend/pages/TrackerPage";
import WorldMapPage from "./frontend/pages/WorldMapPage";
import LeaderboardPage from "./frontend/pages/LeaderboardPage";
import CommandPalette from "./frontend/components/CommandPalette";
import PassportPage from "./frontend/pages/PassportPage";
import FocusTimerPage from "./frontend/pages/FocusTimerPage";
import FlashcardsPage from "./frontend/pages/FlashcardsPage";
import BookmarksPage from "./frontend/pages/BookmarksPage";
import ReadingListPage from "./frontend/pages/ReadingListPage";
import StudyRoomsPage from "./frontend/pages/StudyRoomsPage";
import ProgressReportsPage from "./frontend/pages/ProgressReportsPage";
import CitationGeneratorPage from "./frontend/pages/CitationGeneratorPage";
import ResearchPlannerPage from "./frontend/pages/ResearchPlannerPage";
import StudyPlanPage from "./frontend/pages/StudyPlanPage";
import PomodoroStatsPage from "./frontend/pages/PomodoroStatsPage";
import AnnotationsPage from "./frontend/pages/AnnotationsPage";
import WeeklyDigestPage from "./frontend/pages/WeeklyDigestPage";
import RemindersPage from "./frontend/pages/RemindersPage";
import ComparePage from "./frontend/pages/ComparePage";
import AchievementsPage from "./frontend/pages/AchievementsPage";
import QuickCapture from "./frontend/components/QuickCapture";
import VoiceStudioPage from "./frontend/pages/VoiceStudioPage";
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
            <CommandPalette />
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
              <Route path="/nobel-ai" element={<ProtectedRoute session={session} isReady={isReady}><NobelAIPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute session={session} isReady={isReady}><NotificationsPage /></ProtectedRoute>} />
              <Route path="/tracker" element={<ProtectedRoute session={session} isReady={isReady}><TrackerPage /></ProtectedRoute>} />
              <Route path="/world-map" element={<ProtectedRoute session={session} isReady={isReady}><WorldMapPage /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute session={session} isReady={isReady}><LeaderboardPage /></ProtectedRoute>} />
              <Route path="/passport" element={<ProtectedRoute session={session} isReady={isReady}><PassportPage /></ProtectedRoute>} />
              <Route path="/focus" element={<ProtectedRoute session={session} isReady={isReady}><FocusTimerPage /></ProtectedRoute>} />
              <Route path="/flashcards" element={<ProtectedRoute session={session} isReady={isReady}><FlashcardsPage /></ProtectedRoute>} />
              <Route path="/bookmarks" element={<ProtectedRoute session={session} isReady={isReady}><BookmarksPage /></ProtectedRoute>} />
              <Route path="/daily-goals" element={<ProtectedRoute session={session} isReady={isReady}><ReadingListPage /></ProtectedRoute>} />
              <Route path="/study-rooms" element={<ProtectedRoute session={session} isReady={isReady}><StudyRoomsPage /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute session={session} isReady={isReady}><ProgressReportsPage /></ProtectedRoute>} />
              <Route path="/citations" element={<ProtectedRoute session={session} isReady={isReady}><CitationGeneratorPage /></ProtectedRoute>} />
              <Route path="/planner" element={<ProtectedRoute session={session} isReady={isReady}><ResearchPlannerPage /></ProtectedRoute>} />
              <Route path="/study-plan" element={<ProtectedRoute session={session} isReady={isReady}><StudyPlanPage /></ProtectedRoute>} />
              <Route path="/focus-stats" element={<ProtectedRoute session={session} isReady={isReady}><PomodoroStatsPage /></ProtectedRoute>} />
              <Route path="/annotations" element={<ProtectedRoute session={session} isReady={isReady}><AnnotationsPage /></ProtectedRoute>} />
              <Route path="/weekly-digest" element={<ProtectedRoute session={session} isReady={isReady}><WeeklyDigestPage /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute session={session} isReady={isReady}><RemindersPage /></ProtectedRoute>} />
              <Route path="/compare" element={<ProtectedRoute session={session} isReady={isReady}><ComparePage /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute session={session} isReady={isReady}><AchievementsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {session && <QuickCapture />}
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
