import { useState, useRef } from "react";
import { X, Sparkles, UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: "ai" | "upload", data: string, assets?: string[]) => void;
}

const AddSceneModal = ({ isOpen, onClose, onAdd }: AddSceneModalProps) => {
  const [step, setStep] = useState<"select" | "ai-prompt" | "upload-file">("select");
  const [selectedMethod, setSelectedMethod] = useState<"ai" | "upload">("ai");
  const [prompt, setPrompt] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleContinue = async () => {
    if (step === "select") {
      setStep(selectedMethod === "ai" ? "ai-prompt" : "upload-file");
    } else if (step === "ai-prompt") {
      onAdd("ai", prompt);
      handleClose();
    } else if (step === "upload-file" && selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) throw new Error("Upload failed");
        
        const data = await res.json();
        // Construct full URL so Remotion backend can access it
        const fullUrl = window.location.origin + data.url;
        
        // Pass the URL to the agent as instructions
        onAdd("upload", `Use this uploaded asset in the scene: ${fullUrl} (${data.filename}). It is an uploaded file. If it's an image, use the <Img> component. If it's a video, use the <Video> component.`, [data.url]);
        handleClose();
      } catch (error) {
        console.error("Failed to upload file:", error);
        alert("Failed to upload file");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedMethod("ai");
    setPrompt("");
    setSelectedFile(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-[2px] p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-medium tracking-tight text-gray-900">
            {step === "select" ? "Add a new scene" : step === "ai-prompt" ? "Describe your scene" : "Upload material"}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Choices */}
        <div className="p-6 flex flex-col gap-4 bg-gray-50/30">
          
          {step === "select" && (
            <>
              <label 
                className={cn(
                  "group relative flex items-start gap-4 p-5 rounded-xl border bg-white cursor-pointer transition-all shadow-sm hover:shadow-md",
                  selectedMethod === "ai" 
                    ? "border-indigo-500 ring-1 ring-indigo-500" 
                    : "border-gray-200 hover:border-gray-400"
                )}
                onClick={() => setSelectedMethod("ai")}
              >
                <input 
                  type="radio" 
                  name="scene_creation_method" 
                  className="sr-only" 
                  checked={selectedMethod === "ai"}
                  onChange={() => setSelectedMethod("ai")}
                />
                
                <div className={cn(
                  "flex-shrink-0 p-3 rounded-lg transition-colors border",
                  selectedMethod === "ai"
                    ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                    : "bg-gray-50 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900 border-gray-100 group-hover:border-gray-200"
                )}>
                  <Sparkles className="w-6 h-6" />
                </div>
                
                <div className="flex flex-col pr-8">
                  <span className={cn(
                    "text-base font-medium mb-1 transition-colors",
                    selectedMethod === "ai" ? "text-indigo-900" : "text-gray-900"
                  )}>
                    Generate with AI
                  </span>
                  <span className="text-sm text-gray-500 leading-relaxed">
                    Describe what you want to see and let our AI imagine, script, and generate the scene for you.
                  </span>
                </div>

                {/* Custom Radio Indicator */}
                <div className={cn(
                  "absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                  selectedMethod === "ai" ? "border-indigo-500" : "border-gray-300 group-hover:border-gray-500"
                )}>
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full transition-opacity",
                    selectedMethod === "ai" ? "bg-indigo-600 opacity-100" : "bg-gray-900 opacity-0"
                  )}></div>
                </div>
              </label>

              <label 
                className={cn(
                  "group relative flex items-start gap-4 p-5 rounded-xl border bg-white cursor-pointer transition-all shadow-sm hover:shadow-md",
                  selectedMethod === "upload" 
                    ? "border-indigo-500 ring-1 ring-indigo-500" 
                    : "border-gray-200 hover:border-gray-400"
                )}
                onClick={() => setSelectedMethod("upload")}
              >
                <input 
                  type="radio" 
                  name="scene_creation_method" 
                  className="sr-only" 
                  checked={selectedMethod === "upload"}
                  onChange={() => setSelectedMethod("upload")}
                />
                
                <div className={cn(
                  "flex-shrink-0 p-3 rounded-lg transition-colors border",
                  selectedMethod === "upload"
                    ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                    : "bg-gray-50 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900 border-gray-100 group-hover:border-gray-200"
                )}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                
                <div className="flex flex-col pr-8">
                  <span className={cn(
                    "text-base font-medium mb-1 transition-colors",
                    selectedMethod === "upload" ? "text-indigo-900" : "text-gray-900"
                  )}>
                    Upload Material
                  </span>
                  <span className="text-sm text-gray-500 leading-relaxed">
                    Start with a blank canvas and import your own videos, images, or audio files manually.
                  </span>
                </div>

                {/* Custom Radio Indicator */}
                <div className={cn(
                  "absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                  selectedMethod === "upload" ? "border-indigo-500" : "border-gray-300 group-hover:border-gray-500"
                )}>
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full transition-opacity",
                    selectedMethod === "upload" ? "bg-indigo-600 opacity-100" : "bg-gray-900 opacity-0"
                  )}></div>
                </div>
              </label>
            </>
          )}

          {step === "ai-prompt" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A beautiful sunset over a futuristic city with glowing neon lights..."
                className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-gray-900"
                autoFocus
              />
            </div>
          )}

          {step === "upload-file" && (
            <div 
              className={cn(
                "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
                selectedFile 
                  ? "border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50" 
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="mb-1 text-sm font-semibold text-indigo-900 truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-indigo-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">MP4, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="video/mp4,image/png,image/jpeg,image/gif"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={step === "select" ? handleClose : () => setStep("select")}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {step === "select" ? "Cancel" : "Back"}
          </button>
          <button 
            onClick={handleContinue}
            disabled={(step === "ai-prompt" && !prompt.trim()) || (step === "upload-file" && !selectedFile) || isUploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {step === "select" ? "Continue" : "Add Scene"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddSceneModal;
