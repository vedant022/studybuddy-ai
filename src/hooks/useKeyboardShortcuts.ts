import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SHORTCUTS: Record<string, string> = {
  "1": "/dashboard",
  "2": "/dashboard/subjects",
  "3": "/dashboard/planner",
  "4": "/dashboard/checklist",
  "5": "/dashboard/study-tools",
  "6": "/dashboard/uploads",
  "7": "/dashboard/progress",
  "8": "/dashboard/timer",
  "9": "/dashboard/settings",
};

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/dashboard")) return;

    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.altKey && SHORTCUTS[e.key]) {
        e.preventDefault();
        navigate(SHORTCUTS[e.key]);
      }

      // Alt+? to show help
      if (e.altKey && e.key === "/") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("show-shortcuts-help"));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, location.pathname]);
};

export const SHORTCUT_LIST = [
  { keys: "Alt + 1", action: "Overview" },
  { keys: "Alt + 2", action: "Subjects" },
  { keys: "Alt + 3", action: "Study Plan" },
  { keys: "Alt + 4", action: "Checklist" },
  { keys: "Alt + 5", action: "AI Study Tools" },
  { keys: "Alt + 6", action: "Uploads" },
  { keys: "Alt + 7", action: "Progress" },
  { keys: "Alt + 8", action: "Timer" },
  { keys: "Alt + 9", action: "Settings" },
  { keys: "Alt + /", action: "Show shortcuts" },
];
