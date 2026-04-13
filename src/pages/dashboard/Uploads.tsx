import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoFiles, demoSubjects } from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Uploads = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [extractedTopics, setExtractedTopics] = useState<Record<string, any[]>>({});

  const fetchData = async () => {
    if (isDemo) {
      setFiles(prev => prev.length ? prev : [...demoFiles]);
      setSubjects(prev => prev.length ? prev : [...demoSubjects]);
      return;
    }
    if (!user) return;
    const [fileRes, subRes] = await Promise.all([
      supabase.from("uploaded_files").select("*, subjects(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("subjects").select("*").eq("user_id", user.id),
    ]);
    setFiles(fileRes.data || []);
    setSubjects(subRes.data || []);
  };

  useEffect(() => {
    if (isDemo) {
      setFiles([...demoFiles]);
      setSubjects([...demoSubjects]);
    } else {
      fetchData();
    }
  }, [user, isDemo]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSubject) {
      toast({ title: "Select a subject first", variant: "destructive" });
      return;
    }

    if (isDemo) {
      const subjectName = subjects.find(s => s.id === selectedSubject)?.name || "Unknown";
      const newFile = {
        id: `file-${Date.now()}`,
        user_id: "demo-user",
        file_name: file.name,
        file_url: "#",
        file_type: file.type,
        file_size: file.size,
        subject_id: selectedSubject,
        subjects: { name: subjectName },
        created_at: new Date().toISOString(),
      };
      setFiles(prev => [newFile, ...prev]);
      toast({ title: "File uploaded!" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!user) return;
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = await supabase.storage.from("study-materials").createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

    await supabase.from("uploaded_files").insert({
      user_id: user.id,
      subject_id: selectedSubject,
      file_name: file.name,
      file_url: urlData?.signedUrl || filePath,
      file_type: file.type,
      file_size: file.size,
    });

    setUploading(false);
    fetchData();
    toast({ title: "File uploaded!" });
  };

  const deleteFile = async (id: string) => {
    if (isDemo) {
      setFiles(prev => prev.filter(f => f.id !== id));
      toast({ title: "File deleted" });
      return;
    }
    await supabase.from("uploaded_files").delete().eq("id", id);
    fetchData();
    toast({ title: "File deleted" });
  };

  const extractTopics = async (file: any) => {
    setExtractingId(file.id);
    try {
      const subjectName = (file.subjects as any)?.name || "General";

      if (isDemo) {
        // Simulate AI extraction in demo mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        const demoTopics = [
          { name: "Core Concepts & Fundamentals", importance: "high" },
          { name: "Key Theorems & Proofs", importance: "high" },
          { name: "Problem Solving Techniques", importance: "medium" },
          { name: "Real-world Applications", importance: "medium" },
          { name: "Historical Context & Background", importance: "low" },
        ];
        setExtractedTopics(prev => ({ ...prev, [file.id]: demoTopics }));
        toast({ title: "Topics extracted!", description: `Found ${demoTopics.length} topics from ${file.file_name}` });
        setExtractingId(null);
        return;
      }

      if (!user) return;

      const { data, error } = await supabase.functions.invoke("extract-topics", {
        body: {
          fileName: file.file_name,
          fileContent: null, // For now we pass the file name; full text extraction can be added later
          subjectName,
        },
      });

      if (error) throw error;

      const topics = data?.topics || [];
      setExtractedTopics(prev => ({ ...prev, [file.id]: topics }));

      // Save extracted topics to the database
      if (topics.length > 0 && file.subject_id) {
        const topicInserts = topics.map((t: any) => ({
          user_id: user.id,
          subject_id: file.subject_id,
          name: t.name,
          importance: t.importance,
        }));
        await supabase.from("topics").insert(topicInserts);
        toast({ title: "Topics extracted & saved!", description: `Added ${topics.length} topics to ${subjectName}` });
      } else {
        toast({ title: "Topics extracted!", description: `Found ${topics.length} topics` });
      }
    } catch (err: any) {
      console.error("Extract topics error:", err);
      toast({ title: "Extraction failed", description: err.message || "Unknown error", variant: "destructive" });
    } finally {
      setExtractingId(null);
    }
  };

  const importanceColor = (imp: string) => {
    switch (imp) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Study Materials</h1>
        <p className="text-muted-foreground">Upload PDFs, notes, and study files — then extract topics with AI</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48 bg-input border-border text-foreground">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.ppt,.pptx,.doc,.docx,.txt" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading || !selectedSubject}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {files.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No files uploaded yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <Card key={file.id} className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">{(file.subjects as any)?.name} • {(file.file_size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => extractTopics(file)}
                      disabled={extractingId === file.id}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      {extractingId === file.id ? (
                        <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Extracting...</>
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Extract Topics</>
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteFile(file.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {extractedTopics[file.id] && (
                  <div className="pl-8 flex flex-wrap gap-2">
                    {extractedTopics[file.id].map((topic, i) => (
                      <Badge key={i} variant="outline" className={importanceColor(topic.importance)}>
                        {topic.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Uploads;
