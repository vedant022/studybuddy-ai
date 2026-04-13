import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoSubjects, demoTopics, demoProfile } from "@/data/demoData";
import { Flame, Target, BookOpen, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const CHART_COLORS = ["hsl(258, 90%, 66%)", "hsl(0, 0%, 25%)"];

const ProgressPage = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (isDemo) {
      setSubjects(demoSubjects);
      setTopics(demoTopics);
      setProfile(demoProfile);
      return;
    }
    if (!user) return;
    const fetchData = async () => {
      const [subRes, topRes, profRes] = await Promise.all([
        supabase.from("subjects").select("*").eq("user_id", user.id),
        supabase.from("topics").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      ]);
      setSubjects(subRes.data || []);
      setTopics(topRes.data || []);
      setProfile(profRes.data);
    };
    fetchData();
  }, [user, isDemo]);

  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.is_completed).length;
  const remainingTopics = totalTopics - completedTopics;
  const overallPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const pieData = [
    { name: "Completed", value: completedTopics },
    { name: "Remaining", value: remainingTopics },
  ];

  const barData = subjects.map((s) => {
    const subTopics = topics.filter((t) => t.subject_id === s.id);
    const done = subTopics.filter((t) => t.is_completed).length;
    return { name: s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name, completed: done, remaining: subTopics.length - done };
  });

  const importanceBreakdown = {
    high: topics.filter((t) => t.importance === "high"),
    medium: topics.filter((t) => t.importance === "medium"),
    low: topics.filter((t) => t.importance === "low"),
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("StudyBuddy AI — Progress Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    let y = 42;
    doc.setFontSize(14);
    doc.text("Overall", 14, y); y += 8;
    doc.setFontSize(11);
    doc.text(`Topics completed: ${completedTopics} / ${totalTopics} (${overallPercent}%)`, 14, y); y += 6;
    doc.text(`Study streak: ${profile?.study_streak || 0} days`, 14, y); y += 12;

    doc.setFontSize(14);
    doc.text("By Subject", 14, y); y += 8;
    doc.setFontSize(11);
    subjects.forEach((s) => {
      const st = topics.filter((t) => t.subject_id === s.id);
      const done = st.filter((t) => t.is_completed).length;
      const pct = st.length > 0 ? Math.round((done / st.length) * 100) : 0;
      doc.text(`${s.name}: ${done}/${st.length} (${pct}%)`, 14, y); y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    y += 6;
    doc.setFontSize(14);
    doc.text("By Priority", 14, y); y += 8;
    doc.setFontSize(11);
    (["high", "medium", "low"] as const).forEach((level) => {
      const items = importanceBreakdown[level];
      const done = items.filter((t) => t.is_completed).length;
      doc.text(`${level.charAt(0).toUpperCase() + level.slice(1)}: ${done}/${items.length}`, 14, y); y += 6;
    });

    doc.save("studybuddy-progress.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-muted-foreground">Track your study progress across all subjects</p>
        </div>
        <Button variant="outline" onClick={exportPDF} className="gap-2">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{profile?.study_streak || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{overallPercent}%</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{completedTopics}</p>
            <p className="text-xs text-muted-foreground">Topics Done</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{remainingTopics}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Overall Completion</CardTitle>
          </CardHeader>
          <CardContent>
            {totalTopics > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">Completed ({completedTopics})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-surface-3" />
                    <span className="text-sm text-foreground">Remaining ({remainingTopics})</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">Add topics to see progress</p>
            )}
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Progress by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(0,0%,7%)", border: "1px solid hsl(258,20%,18%)", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(0,0%,95%)" }}
                    itemStyle={{ color: "hsl(0,0%,85%)" }}
                  />
                  <Bar dataKey="completed" stackId="a" fill="hsl(258, 90%, 66%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="remaining" stackId="a" fill="hsl(0, 0%, 18%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">Add subjects to see chart</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Importance breakdown */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Importance Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["high", "medium", "low"] as const).map((level) => {
            const items = importanceBreakdown[level];
            const done = items.filter((t) => t.is_completed).length;
            const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
            const labelColor = level === "high" ? "text-red-400" : level === "medium" ? "text-yellow-400" : "text-green-400";
            return (
              <div key={level} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={`font-medium capitalize ${labelColor}`}>{level} Priority</span>
                  <span className="text-muted-foreground">{done}/{items.length} ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-2 bg-surface-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Per-subject cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject) => {
          const subTopics = topics.filter((t) => t.subject_id === subject.id);
          const done = subTopics.filter((t) => t.is_completed).length;
          const pct = subTopics.length > 0 ? Math.round((done / subTopics.length) * 100) : 0;
          return (
            <Card key={subject.id} className="bg-card border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">{subject.name}</h3>
                  <span className="text-sm text-primary font-medium">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2 bg-surface-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{done} completed</span>
                  <span>{subTopics.length - done} remaining</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressPage;
