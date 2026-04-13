import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";

const HeroSection = () => {
  const navigate = useNavigate();
  const { enterDemo } = useDemo();

  const handleTryDemo = () => {
    enterDemo();
    navigate("/dashboard");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-16">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface-1 text-sm text-muted-foreground mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Study Planning
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Study Smarter,
            <br />
            <span className="text-primary">Not Harder</span> with AI
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your syllabus, set your exam dates, and let AI create a personalized day-by-day study plan. Track progress, reschedule intelligently, and ace your exams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)]" onClick={() => navigate("/auth")}>
              Get Started
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 rounded-xl border-border hover:bg-surface-2"
              onClick={handleTryDemo}
            >
              Try Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
