import { BookOpen, LayoutDashboard, GraduationCap, Calendar, Upload, BarChart3, LogOut, ListChecks, Sparkles, Settings, Timer } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/subjects", icon: GraduationCap, label: "Subjects" },
  { to: "/dashboard/planner", icon: Calendar, label: "Study Plan" },
  { to: "/dashboard/checklist", icon: ListChecks, label: "Checklist" },
  { to: "/dashboard/study-tools", icon: Sparkles, label: "AI Study Tools" },
  { to: "/dashboard/uploads", icon: Upload, label: "Uploads" },
  { to: "/dashboard/progress", icon: BarChart3, label: "Progress" },
  { to: "/dashboard/timer", icon: Timer, label: "Pomodoro" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

interface DashboardSidebarProps {
  onClose?: () => void;
}

const DashboardSidebar = ({ onClose }: DashboardSidebarProps) => {
  const { signOut } = useAuth();
  const { isDemo, exitDemo } = useDemo();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (isDemo) {
      exitDemo();
      navigate("/");
    } else {
      await signOut();
      navigate("/");
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-foreground">StudyBuddy AI</span>
        {isDemo && (
          <Badge variant="outline" className="ml-auto text-xs border-primary/40 text-primary">
            Demo
          </Badge>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {isDemo ? "Exit Demo" : "Sign Out"}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
