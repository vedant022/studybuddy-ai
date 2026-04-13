import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { enterDemo } = useDemo();

  const handleTryDemo = () => {
    enterDemo();
    navigate("/dashboard");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">StudyBuddy AI</span>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleTryDemo} className="text-muted-foreground hover:text-foreground">
              Try Demo
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
