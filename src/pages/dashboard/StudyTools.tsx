import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoSubjects, demoTopics } from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, FlipHorizontal, HelpCircle, Loader2, ChevronLeft, ChevronRight, Eye, EyeOff, Star } from "lucide-react";

interface ImportantPoint {
  topic: string;
  importance: "critical" | "high" | "medium";
  points: string[];
}

interface Flashcard {
  front: string;
  back: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

interface PracticeQuestion {
  question: string;
  type: "mcq" | "short_answer";
  options?: string[];
  answer: string;
  explanation: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

const StudyTools = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  const [importantPoints, setImportantPoints] = useState<ImportantPoint[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);

  // Flashcard state
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Questions state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isDemo) {
      setSubjects(demoSubjects);
      setTopics(demoTopics);
      return;
    }
    if (!user) return;
    const fetch = async () => {
      const [subRes, topRes] = await Promise.all([
        supabase.from("subjects").select("*").eq("user_id", user.id),
        supabase.from("topics").select("*").eq("user_id", user.id),
      ]);
      setSubjects(subRes.data || []);
      setTopics(topRes.data || []);
    };
    fetch();
  }, [user, isDemo]);

  const subjectTopics = topics.filter((t) => t.subject_id === selectedSubject);
  const subjectName = subjects.find((s) => s.id === selectedSubject)?.name || "";

  const generate = async (type: "important_points" | "flashcards" | "questions") => {
    if (!selectedSubject || subjectTopics.length === 0) {
      toast({ title: "Select a subject with topics first", variant: "destructive" });
      return;
    }

    if (isDemo) {
      // Demo mock data
      if (type === "important_points") {
        setImportantPoints(subjectTopics.map((t) => ({
          topic: t.name,
          importance: t.importance === "high" ? "critical" : t.importance === "medium" ? "high" : "medium",
          points: [
            `Key definition of ${t.name} and its applications`,
            `Important formula/theorem related to ${t.name}`,
            `Common exam patterns for ${t.name}`,
          ],
        })));
      } else if (type === "flashcards") {
        setFlashcards(subjectTopics.flatMap((t) => [
          { front: `What is ${t.name}?`, back: `${t.name} is a key concept in ${subjectName} covering fundamental principles.`, topic: t.name, difficulty: "easy" },
          { front: `Explain the significance of ${t.name}`, back: `${t.name} is significant because it forms the foundation for advanced topics.`, topic: t.name, difficulty: "medium" },
        ]));
        setCurrentCard(0);
        setFlipped(false);
      } else {
        setQuestions(subjectTopics.slice(0, 3).flatMap((t) => [
          {
            question: `Which of the following best describes ${t.name}?`,
            type: "mcq" as const,
            options: [`Core concept in ${subjectName}`, "An unrelated topic", "A programming language", "None of the above"],
            answer: `Core concept in ${subjectName}`,
            explanation: `${t.name} is a fundamental concept studied under ${subjectName}.`,
            topic: t.name,
            difficulty: "easy" as const,
          },
          {
            question: `Briefly explain the key principles of ${t.name}.`,
            type: "short_answer" as const,
            answer: `${t.name} involves understanding core theories and their practical applications in ${subjectName}.`,
            explanation: `A good answer covers the definition, key properties, and real-world relevance.`,
            topic: t.name,
            difficulty: "medium" as const,
          },
        ]));
        setSelectedAnswers({});
        setShowAnswers({});
      }
      toast({ title: `Demo ${type.replace("_", " ")} generated!` });
      return;
    }

    setLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("generate-study-tools", {
        body: {
          subject: subjectName,
          topics: subjectTopics.map((t) => ({ name: t.name, importance: t.importance })),
          type,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = data.result;
      if (type === "important_points") setImportantPoints(result.points || []);
      else if (type === "flashcards") {
        setFlashcards(result.flashcards || []);
        setCurrentCard(0);
        setFlipped(false);
      } else {
        setQuestions(result.questions || []);
        setSelectedAnswers({});
        setShowAnswers({});
      }
      toast({ title: `${type.replace("_", " ")} generated successfully!` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const importanceStyle = (imp: string) => {
    if (imp === "critical") return "bg-destructive/20 text-destructive border-destructive/30";
    if (imp === "high") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-primary/20 text-primary border-primary/30";
  };

  const difficultyStyle = (d: string) => {
    if (d === "hard") return "bg-destructive/20 text-destructive border-destructive/30";
    if (d === "medium") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-green-500/20 text-green-400 border-green-500/30";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Study Tools</h1>
        <p className="text-muted-foreground">Generate important points, flashcards & practice questions</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm text-muted-foreground">Select Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSubject && (
              <p className="text-sm text-muted-foreground">{subjectTopics.length} topics available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedSubject && (
        <Tabs defaultValue="important_points" className="space-y-4">
          <TabsList className="bg-surface-2 border border-border">
            <TabsTrigger value="important_points" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="h-4 w-4 mr-1.5" />Important Points
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FlipHorizontal className="h-4 w-4 mr-1.5" />Flashcards
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <HelpCircle className="h-4 w-4 mr-1.5" />Practice Questions
            </TabsTrigger>
          </TabsList>

          {/* Important Points Tab */}
          <TabsContent value="important_points" className="space-y-4">
            <Button onClick={() => generate("important_points")} disabled={!!loading}>
              {loading === "important_points" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Lightbulb className="h-4 w-4 mr-2" />Generate Important Points</>}
            </Button>

            {importantPoints.length > 0 && (
              <div className="space-y-4">
                {importantPoints.map((section, i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground text-base">{section.topic}</CardTitle>
                        <Badge variant="outline" className={importanceStyle(section.importance)}>{section.importance}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.points.map((point, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="text-primary mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="space-y-4">
            <Button onClick={() => generate("flashcards")} disabled={!!loading}>
              {loading === "flashcards" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><FlipHorizontal className="h-4 w-4 mr-2" />Generate Flashcards</>}
            </Button>

            {flashcards.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Card {currentCard + 1} of {flashcards.length}</p>
                  <Badge variant="outline" className={difficultyStyle(flashcards[currentCard].difficulty)}>
                    {flashcards[currentCard].difficulty}
                  </Badge>
                </div>

                <Card
                  className="bg-card border-border cursor-pointer min-h-[200px] flex items-center justify-center transition-all hover:border-primary/50"
                  onClick={() => setFlipped(!flipped)}
                >
                  <CardContent className="p-8 text-center">
                    <p className="text-xs text-muted-foreground mb-3">{flipped ? "Answer" : "Question"} • {flashcards[currentCard].topic}</p>
                    <p className="text-lg text-foreground font-medium">
                      {flipped ? flashcards[currentCard].back : flashcards[currentCard].front}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">Click to flip</p>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" disabled={currentCard === 0} onClick={() => { setCurrentCard(currentCard - 1); setFlipped(false); }}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled={currentCard === flashcards.length - 1} onClick={() => { setCurrentCard(currentCard + 1); setFlipped(false); }}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Practice Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Button onClick={() => generate("questions")} disabled={!!loading}>
              {loading === "questions" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><HelpCircle className="h-4 w-4 mr-2" />Generate Practice Questions</>}
            </Button>

            {questions.length > 0 && (
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-foreground font-medium">Q{i + 1}. {q.question}</p>
                        <div className="flex gap-2 shrink-0">
                          <Badge variant="outline" className={difficultyStyle(q.difficulty)}>{q.difficulty}</Badge>
                          <Badge variant="outline" className="bg-surface-2 text-muted-foreground border-border">{q.type === "mcq" ? "MCQ" : "Short"}</Badge>
                        </div>
                      </div>

                      {q.type === "mcq" && q.options && (
                        <div className="space-y-2 pl-1">
                          {q.options.map((opt, j) => {
                            const isSelected = selectedAnswers[i] === opt;
                            const isCorrect = showAnswers[i] && opt === q.answer;
                            const isWrong = showAnswers[i] && isSelected && opt !== q.answer;
                            return (
                              <button
                                key={j}
                                onClick={() => !showAnswers[i] && setSelectedAnswers({ ...selectedAnswers, [i]: opt })}
                                className={`w-full text-left p-3 rounded-lg text-sm transition-colors border ${
                                  isCorrect ? "bg-green-500/20 border-green-500/40 text-green-400" :
                                  isWrong ? "bg-destructive/20 border-destructive/40 text-destructive" :
                                  isSelected ? "bg-primary/20 border-primary/40 text-primary" :
                                  "bg-surface-2 border-border text-foreground hover:border-primary/30"
                                }`}
                              >
                                {String.fromCharCode(65 + j)}. {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAnswers({ ...showAnswers, [i]: !showAnswers[i] })}
                          className="text-muted-foreground"
                        >
                          {showAnswers[i] ? <><EyeOff className="h-3.5 w-3.5 mr-1.5" />Hide Answer</> : <><Eye className="h-3.5 w-3.5 mr-1.5" />Show Answer</>}
                        </Button>
                      </div>

                      {showAnswers[i] && (
                        <div className="bg-surface-2 rounded-lg p-4 space-y-2 border border-border">
                          <p className="text-sm"><span className="text-primary font-medium">Answer:</span> <span className="text-foreground">{q.answer}</span></p>
                          <p className="text-sm text-muted-foreground">{q.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default StudyTools;
