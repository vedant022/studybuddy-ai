import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Target, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-6">About StudyPlan AI</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          StudyPlan AI is an intelligent exam preparation platform that helps students create
          personalized study schedules, track their progress, and achieve academic success through
          AI-powered planning and adaptive learning tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Brain, title: "AI-Powered", desc: "Leveraging advanced AI to generate personalized study plans tailored to each student's needs." },
            { icon: Target, title: "Goal-Oriented", desc: "Designed to help students focus on what matters most — acing their exams with confidence." },
            { icon: Users, title: "Student-First", desc: "Built by students, for students. Every feature is designed around real study workflows." },
            { icon: Zap, title: "Adaptive", desc: "Smart rescheduling ensures no topic is left behind, even when life gets in the way." },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-card border border-border">
              <item.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe every student deserves access to smart study tools. Our mission is to reduce
            exam stress and improve academic outcomes by combining artificial intelligence with proven
            study techniques like spaced repetition, active recall, and structured planning.
          </p>
        </div>
      </div>
    </main>
  );
};

export default About;
