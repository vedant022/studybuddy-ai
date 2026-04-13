import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 17, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6">
          {[
            { title: "1. Information We Collect", content: "We collect information you provide directly, including your name, email address, and study-related data such as subjects, topics, exam dates, and uploaded study materials. We also collect usage data to improve our services." },
            { title: "2. How We Use Your Information", content: "Your information is used to provide personalized study plans, track your progress, generate AI-powered study tools, and improve the platform. We do not sell your personal data to third parties." },
            { title: "3. Data Storage & Security", content: "Your data is stored securely using industry-standard encryption. We use Supabase for database and authentication services, which provides enterprise-grade security including Row Level Security (RLS) policies." },
            { title: "4. AI Processing", content: "When you use AI features (study plan generation, topic extraction, flashcards), your study content is processed by AI models to generate personalized results. This data is not stored by the AI provider beyond the request lifecycle." },
            { title: "5. File Uploads", content: "Uploaded study materials (PDFs, PPTs) are stored securely in private storage buckets. Files are only accessible to the user who uploaded them and are used solely for topic extraction and study planning." },
            { title: "6. Cookies & Analytics", content: "We use essential cookies for authentication and session management. We may use analytics to understand usage patterns and improve our services." },
            { title: "7. Your Rights", content: "You can access, update, or delete your personal data at any time through your account settings. You may also request a complete data export or account deletion by contacting us." },
            { title: "8. Contact", content: "For privacy-related inquiries, contact us at privacy@studyplanai.com." },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-semibold text-foreground mb-2">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Privacy;
