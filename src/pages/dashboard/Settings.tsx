import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { demoProfile } from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Loader2, Camera, Save, Sun, Moon, Keyboard } from "lucide-react";
import { SHORTCUT_LIST } from "@/hooks/useKeyboardShortcuts";

const Settings = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [dailyHours, setDailyHours] = useState(4);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setDisplayName(demoProfile.display_name || "");
      setDailyHours(demoProfile.daily_study_hours || 4);
      setAvatarUrl(demoProfile.avatar_url);
      setLoading(false);
      return;
    }
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name || "");
        setDailyHours(data.daily_study_hours || 4);
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, isDemo]);

  const handleSave = async () => {
    if (isDemo) {
      toast({ title: "Settings saved! (Demo mode)" });
      return;
    }
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        daily_study_hours: dailyHours,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved successfully!" });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isDemo) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      toast({ title: "Avatar updated! (Demo mode)" });
      return;
    }
    if (!user) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = await supabase.storage
      .from("study-materials")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

    const publicUrl = urlData?.signedUrl || filePath;

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    setAvatarUrl(publicUrl);
    setUploading(false);
    toast({ title: "Avatar updated!" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Avatar */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Profile Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xl">{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                ) : (
                  <Camera className="h-5 w-5 text-foreground" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">Upload a photo</p>
              <p className="text-xs text-muted-foreground">Hover over the avatar and click to change</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-foreground">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Daily Study Hours</Label>
            <Input
              type="number"
              min={1}
              max={16}
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="bg-input border-border text-foreground w-32"
            />
            <p className="text-xs text-muted-foreground">Used by the AI planner to schedule your study blocks</p>
          </div>
          {!isDemo && user?.email && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <Input value={user.email} disabled className="bg-surface-2 border-border text-muted-foreground" />
            </div>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
          </Button>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              <div>
                <p className="text-sm font-medium text-foreground">{theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
                <p className="text-xs text-muted-foreground">Toggle between dark and light themes</p>
              </div>
            </div>
            <Switch checked={theme === "light"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Reference */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SHORTCUT_LIST.map((s) => (
              <div key={s.keys} className="flex justify-between items-center py-1">
                <span className="text-sm text-muted-foreground">{s.action}</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-2 border border-border text-xs font-mono text-foreground">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
