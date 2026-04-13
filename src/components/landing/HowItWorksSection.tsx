import { motion } from "framer-motion";

const steps = [
  { number: 1, title: "Create Account", description: "Sign up in seconds with email or Google." },
  { number: 2, title: "Add Subjects & Exams", description: "Enter your subjects, topics, and exam dates." },
  { number: 3, title: "Upload Materials", description: "Upload PDFs or PPTs — AI extracts topics for you." },
  { number: 4, title: "Generate AI Plan", description: "One click and AI creates your personalized study schedule." },
  { number: 5, title: "Study & Track", description: "Follow your daily checklist and watch your progress grow." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">Five simple steps to exam success.</p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-start gap-6 md:gap-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Number circle */}
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-[0_0_20px_-3px_hsl(var(--primary)/0.5)] md:absolute md:left-1/2 md:-translate-x-1/2">
                  {step.number}
                </div>

                {/* Content */}
                <div className={`flex-1 md:w-[calc(50%-3rem)] ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
