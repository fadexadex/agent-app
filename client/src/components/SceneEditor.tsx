import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RichScene, backgroundToGradient, categoryOptions } from "@/lib/mockData";
import { Save, Wand2 } from "lucide-react";

interface SceneEditorProps {
  scene: RichScene | null;
  open: boolean;
  onClose: () => void;
  onSave: (scene: RichScene) => void;
}

const SceneEditor = ({ scene, open, onClose, onSave }: SceneEditorProps) => {
  const [edited, setEdited] = useState<RichScene | null>(scene);

  // Sync when scene changes
  if (scene && edited?.id !== scene.id) {
    setEdited(scene);
  }

  if (!edited) return null;

  const gradient = edited.gradient || backgroundToGradient(edited.background);
  const durationSeconds = Math.round(edited.duration / 30);

  const handleSave = () => {
    onSave(edited);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Edit Scene: {edited.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Visual preview */}
          <div
            className={`rounded-xl bg-gradient-to-br ${gradient} border flex items-center justify-center aspect-video relative overflow-hidden`}
          >
            <div className="text-center p-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {edited.category}
              </p>
              <h3
                className="text-xl font-bold text-foreground mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {edited.name}
              </h3>
              {edited.notes && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {edited.notes}
                </p>
              )}
            </div>
          </div>

          {/* Edit fields */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Scene Name
              </Label>
              <Input
                value={edited.name}
                onChange={(e) => setEdited({ ...edited, name: e.target.value })}
                placeholder="e.g. The Hook"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes / Guidance
              </Label>
              <Textarea
                value={edited.notes ?? ""}
                onChange={(e) => setEdited({ ...edited, notes: e.target.value })}
                className="min-h-[80px] resize-none"
                placeholder="Describe what this scene should convey, exit order, stagger timing..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration ({durationSeconds}s)
                </Label>
                <Slider
                  value={[edited.duration]}
                  onValueChange={([v]) => setEdited({ ...edited, duration: v })}
                  min={60}
                  max={210}
                  step={30}
                />
                <p className="text-[10px] text-muted-foreground">
                  {edited.duration} frames at 30fps
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={edited.category}
                  onValueChange={(v) =>
                    setEdited({
                      ...edited,
                      category: v as RichScene["category"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Element summary (read-only) */}
            {edited.elements.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Elements ({edited.elements.length})
                </Label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {edited.elements.map((el) => (
                    <div
                      key={el.id}
                      className="flex items-start gap-2 text-xs bg-muted/50 rounded-lg px-2.5 py-1.5"
                    >
                      <span className="font-medium text-primary shrink-0">
                        {el.component || el.type}
                      </span>
                      <span className="text-muted-foreground line-clamp-1">
                        {el.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="gap-2 flex-1">
                <Wand2 className="h-4 w-4" /> Regenerate with AI
              </Button>
              <Button onClick={handleSave} className="gap-2 flex-1">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SceneEditor;
