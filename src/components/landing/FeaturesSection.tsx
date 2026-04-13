import { motion } from "framer-motion";
import {
  Brain,
  Upload,
  Target,
  CheckSquare,
  BarChart3,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Plan Generation",
    description: "Get a personalized study schedule powered by AI based on your syllabus and exam dates.",
  },
  {
    icon: Upload,
    title: "Upload PDFs & PPTs",
    description: "Upload your study materials and let AI extract key topics automatically.",
  },
  {
    icon: Target,
    title: "Smart Topic Prioritization",
    description: "AI ranks topics by importance so you focus on what matters most.",
  },
  {
    icon: CheckSquare,
    title: "Day-wise Checklist",
    description: "Interactive daily checklists keep you on track with clear, actionable tasks.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visualize your progress with charts showing completion rates and study streaks.",
  },
  {
    icon: RefreshCw,
    title: "Adaptive Rescheduling",
    description: "Missed a day? AI automatically reschedules pending topics into your plan.",
  },
  {
    icon: CalendarDays,
    title: "Calendar Export",
    description: "Export your study plan to Google Calendar or any iCal-compatible app.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to <span className="text-primary">Ace Your Exams</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete suite of tools designed to make exam preparation efficient, organized, and stress-free.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-surface-1 border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.2)]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
