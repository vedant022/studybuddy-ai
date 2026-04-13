import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoProfile, demoSubjects, demoTopics, demoTasks } from "@/data/demoData";
import { BookOpen, CheckCircle2, Clock, Flame } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const Overview = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (isDemo) {
      setSubjects(demoSubjects);
      setTopics(demoTopics);
      setTasks(demoTasks);
      setProfile(demoProfile);
      return;
    }
    if (!user) return;
    const fetchData = async () => {
      const [subRes, topRes, taskRes, profRes] = await Promise.all([
        supabase.from("subjects").select("*").eq("user_id", user.id),
        supabase.from("topics").select("*").eq("user_id", user.id),
        supabase.from("daily_tasks").select("*").eq("user_id", user.id).eq("scheduled_date", format(new Date(), "yyyy-MM-dd")),
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      ]);
      setSubjects(subRes.data || []);
      setTopics(topRes.data || []);
      setTasks(taskRes.data || []);
      setProfile(profRes.data);
    };
    fetchData();
  }, [user, isDemo]);

  const completedTopics = topics.filter((t) => t.is_completed).length;
  const totalTopics = topics.length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const todayCompleted = tasks.filter((t) => t.is_completed).length;

  const upcomingExams = subjects
    .filter((s) => s.exam_date && new Date(s.exam_date) >= new Date())
    .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.display_name || "Student"} 👋
        </h1>
        <p className="text-muted-foreground">Here's your study overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subjects</p>
                <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Tasks</p>
                <p className="text-2xl font-bold text-foreground">{todayCompleted}/{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold text-foreground">{profile?.study_streak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Hours</p>
                <p className="text-2xl font-bold text-foreground">{profile?.daily_study_hours || 4}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{completedTopics} of {totalTopics} topics completed</span>
              <span className="text-primary font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-surface-2" />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingExams.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming exams. Add subjects with exam dates!</p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="flex justify-between items-center p-3 rounded-lg bg-surface-2">
                    <span className="text-foreground font-medium">{exam.name}</span>
                    <span className="text-sm text-primary font-medium">
                      {differenceInDays(new Date(exam.exam_date), new Date())} days left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
