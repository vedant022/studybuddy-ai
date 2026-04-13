import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Coffee, Brain, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type TimerMode = "focus" | "short_break" | "long_break";

const PRESETS = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  short_break: "Short Break",
  long_break: "Long Break",
};

const PomodoroTimer = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(PRESETS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessions] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [focusDuration, setFocusDuration] = useState("25");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const customFocus = parseInt(focusDuration) * 60;

  const switchMode = useCallback(
    (next: TimerMode) => {
      setIsRunning(false);
      setMode(next);
      setTimeLeft(next === "focus" ? customFocus : PRESETS[next]);
    },
    [customFocus]
  );

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          if (mode === "focus") {
            const newSessions = sessionsCompleted + 1;
            setSessions(newSessions);
            setTotalFocusMinutes((m) => m + Math.round(customFocus / 60));
            toast({ title: "🎉 Focus session complete!", description: "Time for a break." });
            const nextMode = newSessions % 4 === 0 ? "long_break" : "short_break";
            setTimeout(() => switchMode(nextMode), 500);
          } else {
            toast({ title: "Break's over!", description: "Ready for another focus session?" });
            setTimeout(() => switchMode("focus"), 500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode, sessionsCompleted, customFocus, switchMode, toast]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const maxTime = mode === "focus" ? customFocus : PRESETS[mode];
  const progress = maxTime > 0 ? ((maxTime - timeLeft) / maxTime) * 100 : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDash = (progress / 100) * circumference;

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? customFocus : PRESETS[mode]);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pomodoro Timer</h1>
        <p className="text-muted-foreground">Stay focused with timed study sessions</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 justify-center">
        {(["focus", "short_break", "long_break"] as TimerMode[]).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode(m)}
            className="gap-2"
          >
            {m === "focus" ? <Brain className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
            {MODE_LABELS[m]}
          </Button>
        ))}
      </div>

      {/* Timer circle */}
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center py-10">
          <div className="relative w-52 h-52">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--surface-3))" strokeWidth="6" />
              <motion.circle
                cx="100" cy="100" r="90" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - strokeDash}
                initial={false}
                animate={{ strokeDashoffset: circumference - strokeDash }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-foreground tabular-nums">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span className="text-sm text-muted-foreground mt-1">{MODE_LABELS[mode]}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="gap-2 min-w-[120px]">
              {isRunning ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
            </Button>
            <Button size="lg" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => {
              const next = mode === "focus" ? "short_break" : "focus";
              switchMode(next);
            }}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="text-sm text-muted-foreground mb-2 block">Focus Duration</label>
            <Select value={focusDuration} onValueChange={(v) => {
              setFocusDuration(v);
              if (mode === "focus" && !isRunning) setTimeLeft(parseInt(v) * 60);
            }}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[15, 20, 25, 30, 45, 60].map((m) => (
                  <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Today's Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sessions</span>
              <Badge variant="outline" className="border-primary/40 text-primary">{sessionsCompleted}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Focus Time</span>
              <Badge variant="outline" className="border-primary/40 text-primary">{totalFocusMinutes} min</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Next Long Break</span>
              <Badge variant="outline" className="border-primary/40 text-primary">
                {4 - (sessionsCompleted % 4)} sessions
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PomodoroTimer;
