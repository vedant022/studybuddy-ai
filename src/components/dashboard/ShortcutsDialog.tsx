import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SHORTCUT_LIST } from "@/hooks/useKeyboardShortcuts";
import { Keyboard } from "lucide-react";

const ShortcutsDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener("show-shortcuts-help", handler);
    return () => document.removeEventListener("show-shortcuts-help", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {SHORTCUT_LIST.map((s) => (
            <div key={s.keys} className="flex justify-between items-center py-1.5">
              <span className="text-sm text-muted-foreground">{s.action}</span>
              <kbd className="px-2 py-1 rounded bg-surface-2 border border-border text-xs font-mono text-foreground">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutsDialog;
