import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoSubjects, demoTopics } from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Sparkles, Clock, BookOpen, Loader2, Trash2, Download, ListChecks } from "lucide-react";

interface StudyBlock {
  subject: string;
  topic: string;
  duration: number;
  notes?: string;
}

interface PlanDay {
  date: string;
  dayLabel: string;
  blocks: StudyBlock[];
}

interface StudyPlanData {
  title: string;
  days: PlanDay[];
}

interface TopicInput {
  name: string;
  subject: string;
  importance: string;
}

interface ExamDateInput {
  subject: string;
  examDate: string;
}

const StudyPlan = () => {
  const { user } = useAuth();
  const { isDemo, demoPlan, setDemoPlan, demoSavedPlans, setDemoSavedPlans } = useDemo();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [addingToChecklist, setAddingToChecklist] = useState(false);

  // Sync demo plan from context on mount
  useEffect(() => {
    if (isDemo && demoPlan) {
      setPlan(demoPlan.plan_data as unknown as StudyPlanData);
      setSelectedPlanId(demoPlan.id);
      setSavedPlans(demoSavedPlans);
    }
  }, []);

  useEffect(() => {
    if (isDemo) {
      setSubjects([...demoSubjects]);
      setTopics([...demoTopics]);
      return;
    }
    if (!user) return;
    const fetchData = async () => {
      const [subRes, topRes, planRes] = await Promise.all([
        supabase.from("subjects").select("*").eq("user_id", user.id),
        supabase.from("topics").select("*").eq("user_id", user.id),
        supabase.from("study_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setSubjects(subRes.data || []);
      setTopics(topRes.data || []);
      setSavedPlans(planRes.data || []);
      if (planRes.data && planRes.data.length > 0) {
        const active = planRes.data.find((p: any) => p.is_active) || planRes.data[0];
        setPlan(active.plan_data as unknown as StudyPlanData);
        setSelectedPlanId(active.id);
      }
    };
    fetchData();
  }, [user, isDemo]);

  const generatePlan = async () => {
    if (!isDemo && !user) {
      toast({ title: "Not signed in", description: "Please sign in first to generate a study plan", variant: "destructive" });
      return;
    }

    const incompleteTopics = topics.filter(t => !t.is_completed);
    if (incompleteTopics.length === 0) {
      toast({ title: "No topics to study", description: "Add incomplete topics first!", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const examDates: ExamDateInput[] = subjects
        .filter(s => s.exam_date)
        .map(s => ({ subject: String(s.name), examDate: String(s.exam_date) }));

      const topicData: TopicInput[] = incompleteTopics.map(t => ({
        name: String(t.name),
        subject: String(subjects.find(s => s.id === t.subject_id)?.name || "Unknown"),
        importance: String(t.importance || "medium"),
      }));

      const { data, error } = await supabase.functions.invoke("generate-study-plan", {
        body: {
          subjects: subjects.map(s => s.name),
          topics: topicData,
          dailyHours: 4,
          examDates,
          demo: isDemo,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const generatedPlan = data.plan as StudyPlanData;
      setPlan(generatedPlan);

      if (isDemo) {
        const demoPlanObj = {
          id: "demo-plan",
          title: generatedPlan.title,
          plan_data: generatedPlan,
          is_active: true,
        };
        setSelectedPlanId(demoPlanObj.id);
        setSavedPlans([demoPlanObj]);
        // Persist in context
        setDemoPlan(demoPlanObj);
        setDemoSavedPlans([demoPlanObj]);
      } else if (user) {
        await supabase.from("study_plans").update({ is_active: false }).eq("user_id", user.id);
        const { data: saved } = await supabase.from("study_plans").insert({
          user_id: user.id,
          title: generatedPlan.title,
          plan_data: generatedPlan as any,
          is_active: true,
        }).select().single();

        if (saved) {
          setSelectedPlanId(saved.id);
          setSavedPlans(prev => [saved, ...prev.map(p => ({ ...p, is_active: false }))]);
        }
      }

      toast({ title: "Study plan generated!" });
    } catch (e: any) {
      console.error("Plan generation error:", e);
      toast({ title: "Generation failed", description: e.message || "Please try again", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (isDemo) {
      if (selectedPlanId === id) {
        setPlan(null);
        setSelectedPlanId(null);
        setDemoPlan(null);
        setDemoSavedPlans([]);
      }
      return;
    }
    await supabase.from("study_plans").delete().eq("id", id);
    setSavedPlans(prev => prev.filter(p => p.id !== id));
    if (selectedPlanId === id) { setPlan(null); setSelectedPlanId(null); }
    toast({ title: "Plan deleted" });
  };

  const loadPlan = (p: any) => {
    setPlan(p.plan_data as unknown as StudyPlanData);
    setSelectedPlanId(p.id);
  };

  const addToChecklist = async () => {
    if (!plan) return;
    setAddingToChecklist(true);

    try {
      const tasks = plan.days.flatMap((day) =>
        day.blocks.map((block) => ({
          title: `${block.subject}: ${block.topic} (${block.duration}m)`,
          scheduled_date: day.date,
          study_plan_id: isDemo ? null : selectedPlanId,
        }))
      );

      if (isDemo) {
        // For demo, we just show a toast since demo tasks are static
        toast({
          title: `${tasks.length} tasks added to checklist!`,
          description: "Navigate to Daily Checklist to see them.",
        });
      } else if (user) {
        // Remove existing tasks from this plan to avoid duplicates
        if (selectedPlanId) {
          await supabase.from("daily_tasks").delete().eq("study_plan_id", selectedPlanId).eq("user_id", user.id);
        }

        const inserts = tasks.map((t) => ({
          user_id: user.id,
          title: t.title,
          scheduled_date: t.scheduled_date,
          study_plan_id: t.study_plan_id,
          is_completed: false,
        }));

        const { error } = await supabase.from("daily_tasks").insert(inserts);
        if (error) throw error;

        toast({
          title: `${tasks.length} tasks added to checklist!`,
          description: "Navigate to Daily Checklist to view and track them.",
        });
      }
    } catch (e: any) {
      toast({ title: "Failed to add tasks", description: e.message, variant: "destructive" });
    } finally {
      setAddingToChecklist(false);
    }
  };

  const incompleteCount = topics.filter(t => !t.is_completed).length;

  const exportCalendar = () => {
    if (!plan) return;
    let ical = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//StudyBuddy AI//EN\r\nCALSCALE:GREGORIAN\r\n";
    plan.days.forEach((day) => {
      let startMinutes = 9 * 60;
      day.blocks.forEach((block) => {
        const startH = Math.floor(startMinutes / 60).toString().padStart(2, "0");
        const startM = (startMinutes % 60).toString().padStart(2, "0");
        const endMinutes = startMinutes + block.duration;
        const endH = Math.floor(endMinutes / 60).toString().padStart(2, "0");
        const endM = (endMinutes % 60).toString().padStart(2, "0");
        const dateClean = day.date.replace(/-/g, "");
        ical += `BEGIN:VEVENT\r\nDTSTART:${dateClean}T${startH}${startM}00\r\nDTEND:${dateClean}T${endH}${endM}00\r\nSUMMARY:${block.subject}: ${block.topic}\r\nDESCRIPTION:${block.notes || `Study ${block.topic} for ${block.duration} minutes`}\r\nEND:VEVENT\r\n`;
        startMinutes = endMinutes + 10;
      });
    });
    ical += "END:VCALENDAR\r\n";
    const blob = new Blob([ical], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-plan.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Calendar exported!", description: "Import the .ics file into Google Calendar or Apple Calendar" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Plan</h1>
          <p className="text-muted-foreground">AI-generated daily study schedule</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {plan && (
            <>
              <Button variant="outline" onClick={addToChecklist} disabled={addingToChecklist} className="border-border">
                <ListChecks className="h-4 w-4 mr-2" />
                {addingToChecklist ? "Adding..." : "Add to Checklist"}
              </Button>
              <Button variant="outline" onClick={exportCalendar} className="border-border">
                <Download className="h-4 w-4 mr-2" />
                Export Calendar
              </Button>
            </>
          )}
          <Button onClick={generatePlan} disabled={generating || incompleteCount === 0}>
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />{plan ? "Regenerate Plan" : "Generate Plan"}</>
            )}
          </Button>
        </div>
      </div>

      {incompleteCount === 0 && !plan && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Topics to Plan</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Add subjects and incomplete topics first, then generate your personalized study plan.
            </p>
          </CardContent>
        </Card>
      )}

      {!plan && incompleteCount > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Generate Your Study Plan</h3>
            <p className="text-muted-foreground text-center max-w-md mb-2">
              You have <span className="text-primary font-semibold">{incompleteCount} topics</span> across{" "}
              <span className="text-primary font-semibold">{subjects.length} subjects</span> ready to plan.
            </p>
            <p className="text-muted-foreground text-sm text-center max-w-md">
              Click "Generate Plan" to create a personalized day-by-day schedule with AI.
            </p>
          </CardContent>
        </Card>
      )}

      {savedPlans.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {savedPlans.map((p) => (
            <Button
              key={p.id}
              variant={selectedPlanId === p.id ? "default" : "outline"}
              size="sm"
              onClick={() => loadPlan(p)}
              className="text-xs"
            >
              {p.title?.slice(0, 30) || "Study Plan"}
            </Button>
          ))}
        </div>
      )}

      {plan && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{plan.title}</h2>
            {selectedPlanId && (
              <Button variant="ghost" size="icon" onClick={() => deletePlan(selectedPlanId)}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>

          {plan.days.map((day, i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {day.dayLabel}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                    {day.date}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {day.blocks.map((block, j) => (
                  <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-surface-2">
                    <div className="p-1.5 rounded bg-primary/10 mt-0.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{block.topic}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock className="h-3 w-3" />
                          {block.duration}m
                        </div>
                      </div>
                      <p className="text-xs text-primary">{block.subject}</p>
                      {block.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{block.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyPlan;
