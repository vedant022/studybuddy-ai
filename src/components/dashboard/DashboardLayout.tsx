import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNotifications from "./DashboardNotifications";
import ShortcutsDialog from "./ShortcutsDialog";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" as const } },
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full w-64">
            <DashboardSidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 text-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold text-foreground">StudyBuddy AI</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <DashboardNotifications />
      <ShortcutsDialog />
    </div>
  );
};

export default DashboardLayout;
