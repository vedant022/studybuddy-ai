import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoSubjects, demoTopics } from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, GraduationCap } from "lucide-react";

const Subjects = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState({ name: "", exam_date: "" });
  const [newTopic, setNewTopic] = useState({ name: "", importance: "medium", subject_id: "" });
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);

  const fetchData = async () => {
    if (isDemo) {
      setSubjects(prev => prev.length ? prev : [...demoSubjects]);
      setTopics(prev => prev.length ? prev : [...demoTopics]);
      return;
    }
    if (!user) return;
    const [subRes, topRes] = await Promise.all([
      supabase.from("subjects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("topics").select("*").eq("user_id", user.id),
    ]);
    setSubjects(subRes.data || []);
    setTopics(topRes.data || []);
  };

  useEffect(() => {
    if (isDemo) {
      setSubjects([...demoSubjects]);
      setTopics([...demoTopics]);
    } else {
      fetchData();
    }
  }, [user, isDemo]);

  const addSubject = async () => {
    if (!newSubject.name) return;
    if (isDemo) {
      const newSub = {
        id: `sub-${Date.now()}`,
        user_id: "demo-user",
        name: newSubject.name,
        exam_date: newSubject.exam_date || null,
        color: "#8B5CF6",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSubjects(prev => [newSub, ...prev]);
      setNewSubject({ name: "", exam_date: "" });
      setSubjectDialogOpen(false);
      toast({ title: "Subject added!" });
      return;
    }
    if (!user) return;
    const { error } = await supabase.from("subjects").insert({
      user_id: user.id,
      name: newSubject.name,
      exam_date: newSubject.exam_date || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewSubject({ name: "", exam_date: "" });
    setSubjectDialogOpen(false);
    fetchData();
    toast({ title: "Subject added!" });
  };

  const addTopic = async () => {
    if (!newTopic.name || !newTopic.subject_id) return;
    if (isDemo) {
      const newTop = {
        id: `top-${Date.now()}`,
        user_id: "demo-user",
        subject_id: newTopic.subject_id,
        name: newTopic.name,
        importance: newTopic.importance,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
      setTopics(prev => [...prev, newTop]);
      setNewTopic({ name: "", importance: "medium", subject_id: "" });
      setTopicDialogOpen(false);
      toast({ title: "Topic added!" });
      return;
    }
    if (!user) return;
    const { error } = await supabase.from("topics").insert({
      user_id: user.id,
      subject_id: newTopic.subject_id,
      name: newTopic.name,
      importance: newTopic.importance,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewTopic({ name: "", importance: "medium", subject_id: "" });
    setTopicDialogOpen(false);
    fetchData();
    toast({ title: "Topic added!" });
  };

  const deleteSubject = async (id: string) => {
    if (isDemo) {
      setSubjects(prev => prev.filter(s => s.id !== id));
      setTopics(prev => prev.filter(t => t.subject_id !== id));
      toast({ title: "Subject deleted" });
      return;
    }
    await supabase.from("subjects").delete().eq("id", id);
    fetchData();
  };

  const toggleTopic = async (id: string, completed: boolean) => {
    if (isDemo) {
      setTopics(prev => prev.map(t => t.id === id ? { ...t, is_completed: !completed } : t));
      return;
    }
    await supabase.from("topics").update({ is_completed: !completed }).eq("id", id);
    fetchData();
  };

  const deleteTopic = async (id: string) => {
    if (isDemo) {
      setTopics(prev => prev.filter(t => t.id !== id));
      toast({ title: "Topic deleted" });
      return;
    }
    await supabase.from("topics").delete().eq("id", id);
    fetchData();
  };

  const importanceColor = (imp: string) => {
    if (imp === "high") return "bg-destructive/20 text-destructive border-destructive/30";
    if (imp === "low") return "bg-green-500/20 text-green-400 border-green-500/30";
    return "bg-primary/20 text-primary border-primary/30";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subjects & Topics</h1>
          <p className="text-muted-foreground">Manage your subjects and study topics</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Subject</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="text-foreground">Add Subject</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Subject Name</Label>
                  <Input value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} placeholder="e.g. Mathematics" className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Exam Date (optional)</Label>
                  <Input type="date" value={newSubject.exam_date} onChange={(e) => setNewSubject({ ...newSubject, exam_date: e.target.value })} className="bg-input border-border text-foreground" />
                </div>
                <Button onClick={addSubject} className="w-full">Add Subject</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-border"><Plus className="h-4 w-4 mr-2" />Add Topic</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="text-foreground">Add Topic</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Subject</Label>
                  <Select value={newTopic.subject_id} onValueChange={(v) => setNewTopic({ ...newTopic, subject_id: v })}>
                    <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Topic Name</Label>
                  <Input value={newTopic.name} onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })} placeholder="e.g. Integration" className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Importance</Label>
                  <Select value={newTopic.importance} onValueChange={(v) => setNewTopic({ ...newTopic, importance: v })}>
                    <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addTopic} className="w-full">Add Topic</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {subjects.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No subjects yet. Add your first subject to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const subTopics = topics.filter((t) => t.subject_id === subject.id);
            const completed = subTopics.filter((t) => t.is_completed).length;
            return (
              <Card key={subject.id} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-foreground text-lg">{subject.name}</CardTitle>
                    {subject.exam_date && (
                      <p className="text-sm text-muted-foreground mt-1">Exam: {subject.exam_date}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{completed}/{subTopics.length} done</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteSubject(subject.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 rounded-lg bg-surface-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Quiz Pass %</span>
                      <Badge variant="outline" className="text-xs">{subject.pass_percentage ?? 70}%</Badge>
                    </div>
                    <Slider
                      value={[subject.pass_percentage ?? 70]}
                      min={30}
                      max={100}
                      step={5}
                      onValueCommit={async (val) => {
                        if (isDemo) {
                          setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, pass_percentage: val[0] } : s));
                        } else {
                          await supabase.from("subjects").update({ pass_percentage: val[0] } as any).eq("id", subject.id);
                          fetchData();
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  {subTopics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No topics yet</p>
                  ) : (
                    <div className="space-y-2">
                      {subTopics.map((topic) => (
                        <div key={topic.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-2 group">
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleTopic(topic.id, topic.is_completed)} className={`h-4 w-4 rounded border ${topic.is_completed ? "bg-primary border-primary" : "border-muted-foreground"} flex items-center justify-center`}>
                              {topic.is_completed && <span className="text-xs text-primary-foreground">✓</span>}
                            </button>
                            <span className={`text-sm ${topic.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{topic.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={importanceColor(topic.importance)}>{topic.importance}</Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteTopic(topic.id)}>
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Subjects;
