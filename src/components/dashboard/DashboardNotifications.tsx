import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { supabase } from "@/integrations/supabase/client";
import { demoSubjects, demoTasks, demoProfile } from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, isBefore, startOfDay } from "date-fns";

const DashboardNotifications = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const { toast } = useToast();
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    hasShown.current = true;

    const show = async () => {
      let subjects: any[] = [];
      let tasks: any[] = [];
      let profile: any = null;

      if (isDemo) {
        subjects = demoSubjects;
        tasks = demoTasks;
        profile = demoProfile;
      } else if (user) {
        const [subRes, taskRes, profRes] = await Promise.all([
          supabase.from("subjects").select("*").eq("user_id", user.id),
          supabase.from("daily_tasks").select("*").eq("user_id", user.id),
          supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        ]);
        subjects = subRes.data || [];
        tasks = taskRes.data || [];
        profile = profRes.data;
      } else return;

      // Overdue tasks
      const overdue = tasks.filter(
        (t) => !t.is_completed && isBefore(new Date(t.scheduled_date), startOfDay(new Date()))
      );
      if (overdue.length > 0) {
        toast({
          title: `⚠️ ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`,
          description: "Head to the checklist to reschedule them.",
        });
      }

      // Upcoming exams within 3 days
      const urgent = subjects.filter((s) => {
        if (!s.exam_date) return false;
        const days = differenceInDays(new Date(s.exam_date), new Date());
        return days >= 0 && days <= 3;
      });
      if (urgent.length > 0) {
        setTimeout(() => {
          toast({
            title: `📚 Exam alert!`,
            description: `${urgent.map((s) => s.name).join(", ")} — exam in ≤3 days!`,
          });
        }, 1500);
      }

      // Streak milestone
      const streak = profile?.study_streak || 0;
      if (streak > 0 && streak % 7 === 0) {
        setTimeout(() => {
          toast({ title: `🔥 ${streak}-day study streak!`, description: "Keep up the great work!" });
        }, 3000);
      }
    };

    show();
  }, [user, isDemo, toast]);

  return null;
};

export default DashboardNotifications;
