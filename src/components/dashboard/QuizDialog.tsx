import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Loader2, Brain, Trophy, RotateCcw } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  explanation: string;
}

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicName: string;
  subjectName: string;
  passPercentage: number;
  onQuizComplete: (passed: boolean, score: number) => void;
}

const QuizDialog = ({ open, onOpenChange, topicName, subjectName, passPercentage, onQuizComplete }: QuizDialogProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const loadQuiz = async () => {
    setLoading(true);
    setError("");
    setQuestions([]);
    setCurrentQ(0);
    setAnswers({});
    setSelectedAnswer("");
    setShowResults(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-quiz", {
        body: { topicName, subjectName },
      });

      if (fnError) throw fnError;
      if (data?.quiz?.questions) {
        setQuestions(data.quiz.questions);
      } else {
        throw new Error("Invalid quiz data");
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  // Load quiz when dialog opens
  useEffect(() => {
    if (open && questions.length === 0 && !loading && !error) {
      loadQuiz();
    }
  }, [open]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuestions([]);
      setShowResults(false);
      setError("");
    }
    onOpenChange(isOpen);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    const newAnswers = { ...answers, [currentQ]: selectedAnswer };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer("");
    } else {
      setShowResults(true);
      const correct = questions.filter((q, i) => newAnswers[i] === q.correctAnswer).length;
      const score = Math.round((correct / questions.length) * 100);
      const passed = score >= passPercentage;
      onQuizComplete(passed, score);
    }
  };

  const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = score >= passPercentage;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Topic Quiz
          </DialogTitle>
          <DialogDescription>
            {topicName} — Need {passPercentage}% to pass
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Generating quiz questions...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="text-destructive text-sm">{error}</p>
            <Button onClick={loadQuiz} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </div>
        )}

        {!loading && !error && questions.length > 0 && !showResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                Question {currentQ + 1} of {questions.length}
              </Badge>
              <Progress value={((currentQ + 1) / questions.length) * 100} className="w-32 h-2" />
            </div>

            <Card className="bg-surface-2 border-border">
              <CardContent className="p-4">
                <p className="text-foreground font-medium mb-4">{questions[currentQ].question}</p>
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3">
                  {(["A", "B", "C", "D"] as const).map((key) => (
                    <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
                      <RadioGroupItem value={key} id={`option-${key}`} />
                      <Label htmlFor={`option-${key}`} className="text-foreground cursor-pointer flex-1 text-sm">
                        <span className="font-semibold mr-2">{key}.</span>
                        {questions[currentQ].options[key]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Button onClick={submitAnswer} disabled={!selectedAnswer} className="w-full">
              {currentQ < questions.length - 1 ? "Next Question" : "Submit Quiz"}
            </Button>
          </div>
        )}

        {showResults && (
          <div className="space-y-4">
            <div className="text-center py-4">
              {passed ? (
                <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
              ) : (
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
              )}
              <p className="text-2xl font-bold text-foreground">{score}%</p>
              <p className={`text-sm font-medium ${passed ? "text-green-400" : "text-destructive"}`}>
                {passed ? "Quiz Passed! 🎉" : `Need ${passPercentage}% to pass`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {correctCount}/{questions.length} correct
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {questions.map((q, i) => {
                const isCorrect = answers[i] === q.correctAnswer;
                return (
                  <Card key={i} className={`border ${isCorrect ? "border-green-500/30" : "border-destructive/30"}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        )}
                        <div className="text-xs">
                          <p className="text-foreground font-medium">{q.question}</p>
                          {!isCorrect && (
                            <p className="text-destructive mt-1">
                              Your answer: {answers[i]} — Correct: {q.correctAnswer}
                            </p>
                          )}
                          <p className="text-muted-foreground mt-1">{q.explanation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-2">
              {!passed && (
                <Button onClick={loadQuiz} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" /> Retry Quiz
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                {passed ? "Done" : "Close"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizDialog;
