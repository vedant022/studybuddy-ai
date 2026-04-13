import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 17, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6">
          {[
            { title: "1. Acceptance of Terms", content: "By accessing or using StudyPlan AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform." },
            { title: "2. Description of Service", content: "StudyPlan AI is an AI-powered study planning platform that provides personalized study schedules, progress tracking, flashcard generation, practice questions, and other study tools to help students prepare for exams." },
            { title: "3. User Accounts", content: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating an account and keep it up to date. You are responsible for all activities under your account." },
            { title: "4. Acceptable Use", content: "You agree to use the platform only for lawful educational purposes. You may not upload harmful, offensive, or copyrighted content without authorization. You may not attempt to reverse-engineer, hack, or disrupt the service." },
            { title: "5. AI-Generated Content", content: "Study plans, flashcards, questions, and other AI-generated content are provided as study aids and should not be considered as guaranteed exam content. We do not guarantee the accuracy or completeness of AI-generated material." },
            { title: "6. Intellectual Property", content: "The platform, its design, code, and features are the intellectual property of StudyPlan AI. Content you upload remains your property. By uploading content, you grant us a limited license to process it for providing our services." },
            { title: "7. Limitation of Liability", content: "StudyPlan AI is provided 'as is' without warranties of any kind. We are not liable for any academic outcomes, data loss, or damages arising from use of the platform." },
            { title: "8. Termination", content: "We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through your account settings." },
            { title: "9. Changes to Terms", content: "We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms." },
            { title: "10. Contact", content: "For questions about these terms, contact us at legal@studyplanai.com." },
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

export default Terms;
