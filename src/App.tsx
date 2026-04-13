import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Overview from "./pages/dashboard/Overview";
import Subjects from "./pages/dashboard/Subjects";
import StudyPlan from "./pages/dashboard/StudyPlan";
import Uploads from "./pages/dashboard/Uploads";
import ProgressPage from "./pages/dashboard/ProgressPage";
import DailyChecklist from "./pages/dashboard/DailyChecklist";
import StudyTools from "./pages/dashboard/StudyTools";
import PomodoroTimer from "./pages/dashboard/PomodoroTimer";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DemoProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Overview />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="planner" element={<StudyPlan />} />
                <Route path="checklist" element={<DailyChecklist />} />
                <Route path="study-tools" element={<StudyTools />} />
                <Route path="uploads" element={<Uploads />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="timer" element={<PomodoroTimer />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DemoProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
