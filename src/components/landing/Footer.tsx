import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold text-foreground text-lg">StudyPlan AI</span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
        </nav>

        <p className="text-sm text-muted-foreground">
          © 2026 StudyPlan AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
