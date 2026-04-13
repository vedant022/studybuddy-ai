import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoTasks, demoSubjects, demoTopics } from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isToday, isBefore, startOfDay } from "date-fns";
import { CalendarCheck, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import QuizDialog from "@/components/dashboard/QuizDialog";

const DailyChecklist = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rescheduling, setRescheduling] = useState(false);
  const [hasAutoRescheduled, setHasAutoRescheduled] = useState(false);

  // Quiz state
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizTask, setQuizTask] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const fetchTasks = async () => {
    if (isDemo) {
      setAllTasks([...demoTasks]);
      setSubjects([...demoSubjects]);
      setTopics([...demoTopics]);
      return;
    }
    if (!user) return;
    const [taskRes, subRes, topRes] = await Promise.all([
      supabase.from("daily_tasks").select("*").eq("user_id", user.id).order("scheduled_date", { ascending: true }),
      supabase.from("subjects").select("*").eq("user_id", user.id),
      supabase.from("topics").select("*").eq("user_id", user.id),
    ]);
    setAllTasks(taskRes.data || []);
    setSubjects(subRes.data || []);
    setTopics(topRes.data || []);
  };

  const autoRescheduleOverdue = async (taskList: any[]) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const overdue = taskList.filter(
      (t) => !t.is_completed && isBefore(new Date(t.scheduled_date), startOfDay(new Date()))
    );
    if (overdue.length === 0) return;

    if (isDemo) {
      setAllTasks((prev) =>
        prev.map((t) =>
          !t.is_completed && isBefore(new Date(t.scheduled_date), startOfDay(new Date()))
            ? { ...t, scheduled_date: todayStr }
            : t
        )
      );
    } else {
      for (const task of overdue) {
        await supabase.from("daily_tasks").update({ scheduled_date: todayStr }).eq("id", task.id);
      }
      await fetchTasks();
    }

    toast({
      title: `${overdue.length} missed task${overdue.length > 1 ? "s" : ""} rescheduled to today`,
      description: "Incomplete tasks from past days have been moved automatically.",
    });
  };

  useEffect(() => {
    fetchTasks();
  }, [user, isDemo]);

  useEffect(() => {
    if (allTasks.length > 0 && !hasAutoRescheduled) {
      setHasAutoRescheduled(true);
      autoRescheduleOverdue(allTasks);
    }
  }, [allTasks, hasAutoRescheduled]);

  useEffect(() => {
    setTasks(allTasks.filter((t) => t.scheduled_date === dateStr));
  }, [allTasks, dateStr]);

  // Find topic info for a task
  const getTaskTopicInfo = (task: any) => {
    // Try to extract subject name from task title (format: "Subject: Topic (duration)")
    const titleMatch = task.title?.match(/^(.+?):\s*(.+?)(?:\s*\(\d+m\))?$/);
    if (titleMatch) {
      const subjectName = titleMatch[1].trim();
      const topicName = titleMatch[2].trim();
      const subject = subjects.find((s) => s.name === subjectName);
      return { topicName, subjectName, passPercentage: subject?.pass_percentage ?? 70 };
    }
    // Fall back to topic_id
    if (task.topic_id) {
      const topic = topics.find((t) => t.id === task.topic_id);
      if (topic) {
        const subject = subjects.find((s) => s.id === topic.subject_id);
        return { topicName: topic.name, subjectName: subject?.name || "General", passPercentage: subject?.pass_percentage ?? 70 };
      }
    }
    return { topicName: task.title, subjectName: "General", passPercentage: 70 };
  };

  const handleCheckboxClick = (task: any) => {
    if (task.is_completed) {
      // Uncheck directly — no quiz needed
      toggleTask(task.id, true);
      return;
    }
    // Show quiz before marking complete
    setQuizTask(task);
    setQuizOpen(true);
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed && quizTask) {
      toggleTask(quizTask.id, false);
      toast({ title: `Quiz passed with ${score}%! Task marked complete.` });
    } else {
      toast({
        title: `Quiz score: ${score}%`,
        description: `You need ${getTaskTopicInfo(quizTask).passPercentage}% to pass. Try again!`,
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const newCompleted = !completed;
    if (isDemo) {
      setAllTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
            : t
        )
      );
      return;
    }
    await supabase.from("daily_tasks").update({
      is_completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    }).eq("id", id);
    fetchTasks();
  };

  const rescheduleOverdue = async () => {
    setRescheduling(true);
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const overdue = allTasks.filter(
      (t) => !t.is_completed && isBefore(new Date(t.scheduled_date), startOfDay(new Date()))
    );

    if (overdue.length === 0) {
      toast({ title: "No overdue tasks to reschedule" });
      setRescheduling(false);
      return;
    }

    if (isDemo) {
      setAllTasks((prev) =>
        prev.map((t) => {
          if (!t.is_completed && isBefore(new Date(t.scheduled_date), startOfDay(new Date()))) {
            return { ...t, scheduled_date: todayStr };
          }
          return t;
        })
      );
      toast({ title: `Rescheduled ${overdue.length} overdue tasks to today` });
      setRescheduling(false);
      return;
    }

    for (const task of overdue) {
      await supabase.from("daily_tasks").update({ scheduled_date: todayStr }).eq("id", task.id);
    }
    await fetchTasks();
    toast({ title: `Rescheduled ${overdue.length} overdue tasks to today` });
    setRescheduling(false);
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const overdueCount = allTasks.filter(
    (t) => !t.is_completed && isBefore(new Date(t.scheduled_date), startOfDay(new Date()))
  ).length;

  const quizTopicInfo = quizTask ? getTaskTopicInfo(quizTask) : { topicName: "", subjectName: "", passPercentage: 70 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Checklist</h1>
          <p className="text-muted-foreground">Complete a quiz to check off each task</p>
        </div>
        {overdueCount > 0 && (
          <Button onClick={rescheduleOverdue} disabled={rescheduling} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
            <RefreshCw className={`h-4 w-4 mr-2 ${rescheduling ? "animate-spin" : ""}`} />
            Reschedule {overdueCount} Overdue
          </Button>
        )}
      </div>

      {/* Date navigator */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => addDays(d, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{format(selectedDate, "EEEE, MMMM d")}</p>
              <p className="text-xs text-muted-foreground">
                {isToday(selectedDate) ? "Today" : format(selectedDate, "yyyy")}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <CalendarCheck className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{overdueCount}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tasks scheduled for this day</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isOverdue = !task.is_completed && isBefore(new Date(task.scheduled_date), startOfDay(new Date()));
            return (
              <Card key={task.id} className={`bg-card border-border ${isOverdue ? "border-destructive/40" : ""}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Checkbox
                    checked={task.is_completed}
                    onCheckedChange={() => handleCheckboxClick(task)}
                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                  </div>
                  {isOverdue && (
                    <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
                      Overdue
                    </Badge>
                  )}
                  {task.is_completed && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Done
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quiz Dialog */}
      <QuizDialog
        open={quizOpen}
        onOpenChange={setQuizOpen}
        topicName={quizTopicInfo.topicName}
        subjectName={quizTopicInfo.subjectName}
        passPercentage={quizTopicInfo.passPercentage}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  );
};

export default DailyChecklist;
