import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setSending(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-muted-foreground mb-8">
          Have questions, feedback, or need help? We'd love to hear from you.
        </p>

        <div className="flex gap-6 mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            support@studyplanai.com
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 text-primary" />
            Live chat available
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl bg-card border border-border">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
            <Input placeholder="Your name" required />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <Input type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
            <Textarea placeholder="How can we help?" rows={5} required />
          </div>
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default Contact;
