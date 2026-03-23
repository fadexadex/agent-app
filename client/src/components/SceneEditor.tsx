import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Scene, animationOptions } from "@/lib/mockData";
import { Save, Image, Wand2 } from "lucide-react";

interface SceneEditorProps {
  scene: Scene | null;
  open: boolean;
  onClose: () => void;
  onSave: (scene: Scene) => void;
}

const SceneEditor = ({ scene, open, onClose, onSave }: SceneEditorProps) => {
  const [edited, setEdited] = useState<Scene | null>(scene);

  // Sync when scene changes
  if (scene && edited?.id !== scene.id) {
    setEdited(scene);
  }

  if (!edited) return null;

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
            Edit Scene {edited.id}: {edited.type}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Visual preview */}
          <div
            className={`rounded-xl bg-gradient-to-br ${edited.gradient} border flex items-center justify-center aspect-video relative overflow-hidden`}
          >
            <div className="text-center p-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {edited.type}
              </p>
              <h3
                className="text-xl font-bold text-foreground mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {edited.headline}
              </h3>
              <p className="text-sm text-muted-foreground">{edited.script}</p>
            </div>
            <button className="absolute bottom-3 right-3 p-2 rounded-lg bg-card/80 backdrop-blur border text-muted-foreground hover:text-foreground transition-colors">
              <Image className="h-4 w-4" />
            </button>
          </div>

          {/* Edit fields */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Headline
              </Label>
              <Input
                value={edited.headline}
                onChange={(e) => setEdited({ ...edited, headline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Script / Narration
              </Label>
              <Textarea
                value={edited.script}
                onChange={(e) => setEdited({ ...edited, script: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration ({edited.duration}s)
                </Label>
                <Slider
                  value={[edited.duration]}
                  onValueChange={([v]) => setEdited({ ...edited, duration: v })}
                  min={2}
                  max={15}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Animation
                </Label>
                <Select
                  value={edited.animation}
                  onValueChange={(v) => setEdited({ ...edited, animation: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {animationOptions.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
