import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./frontend/pages/Index";
import LaureatesPage from "./frontend/pages/LaureatesPage";
import LecturesPage from "./frontend/pages/LecturesPage";
import ResearchPage from "./frontend/pages/ResearchPage";
import AnalyticsPage from "./frontend/pages/AnalyticsPage";
import SearchPage from "./frontend/pages/SearchPage";
import NotFound from "./frontend/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/laureates" element={<LaureatesPage />} />
          <Route path="/lectures" element={<LecturesPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
