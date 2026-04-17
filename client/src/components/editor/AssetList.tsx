import { useEffect, useState, useRef } from "react";
import { Loader2, UploadCloud, File, Image as ImageIcon, Video, RefreshCw, Sparkles } from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { Button } from "@/components/ui/button";

interface Asset {
  name: string;
  url: string;
  mimeType: string;
  size?: number;
  createdAt: string;
  isGenerated?: boolean;
  prompt?: string;
}

interface AssetListProps {
  sceneAssets?: string[];
}

const AssetList = ({ sceneAssets = [] }: AssetListProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const [uploadsRes, generatedRes] = await Promise.all([
        fetch("/api/assets"),
        fetch("/api/agent/generated-assets")
      ]);

      let allAssets: Asset[] = [];

      if (uploadsRes.ok) {
        const data = await uploadsRes.json();
        allAssets = [...data];
      }

      if (generatedRes.ok) {
        const { assets: genAssets } = await generatedRes.json();
        const mappedGenAssets = genAssets.map((ga: any) => ({
          name: `Generated: ${ga.id.slice(0, 8)}`,
          url: ga.url,
          mimeType: 'image/png',
          createdAt: ga.createdAt,
          isGenerated: true,
          prompt: ga.prompt
        }));
        allAssets = [...allAssets, ...mappedGenAssets];
      }

      // Sort newest first
      let sortedAssets = allAssets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Merge sceneAssets
      if (sceneAssets.length > 0) {
        const existingUrls = new Set(sortedAssets.map(a => a.url));
        const additional = sceneAssets
          .filter(url => !existingUrls.has(url))
          .map(url => ({
            name: url.split('/').pop() || "External Asset",
            url,
            mimeType: url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ? "image/auto" : "application/octet-stream",
            createdAt: new Date().toISOString()
          }));
        sortedAssets = [...additional, ...sortedAssets];
      }

      setAssets(sortedAssets);
    } catch (err) {
      console.error("Failed to fetch assets", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [sceneAssets]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i]);
      }
      await fetchAssets();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Assets
        </p>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchAssets} disabled={isLoading}>
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="p-2 border-b border-border flex flex-col gap-1.5">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-secondary text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          Upload Asset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && assets.length === 0 ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No assets yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <div key={asset.url} className="group relative border rounded-md overflow-hidden bg-muted aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors" title={asset.prompt || asset.name}>
                {asset.mimeType.startsWith("image/") ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                ) : asset.mimeType.startsWith("video/") ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <Video className="w-6 h-6 text-white/50" />
                    <span className="absolute bottom-1 right-1 text-[8px] text-white bg-black/60 px-1 rounded">VIDEO</span>
                  </div>
                ) : (
                  <File className="w-8 h-8 text-muted-foreground mb-1" />
                )}
                
                {asset.isGenerated && (
                  <div className="absolute top-1 right-1 bg-black/50 p-0.5 rounded-sm">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  </div>
                )}

                {/* Overlay with filename */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                  <p className="text-[9px] text-white truncate w-full leading-tight">
                    {asset.name}
                  </p>
                  {asset.prompt && (
                    <p className="text-[8px] text-white/70 line-clamp-2 mt-0.5 leading-tight italic">
                      "{asset.prompt}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetList;
