import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Music } from "lucide-react";

type ConversionStatus = "idle" | "loading" | "success" | "error";

export const ConverterForm = () => {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [videoTitle, setVideoTitle] = useState("");
  const { toast } = useToast();

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleConvert = async () => {
    const videoId = extractVideoId(url.trim());

    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setStatus("loading");
    setVideoTitle("");

    // Simulating conversion process for demo
    // In production, this would call an edge function
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setVideoTitle("Sample Video Title");
      setStatus("success");
      
      toast({
        title: "Conversion Complete",
        description: "Your WAV file is ready for download",
      });
    } catch (error) {
      setStatus("error");
      toast({
        title: "Conversion Failed",
        description: "Unable to convert video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your WAV file will download shortly",
    });
    // In production, this would trigger actual file download
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && status !== "loading") {
      handleConvert();
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-14 border-2 border-foreground bg-background px-4 font-mono text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground"
            disabled={status === "loading"}
          />
          <Button
            onClick={handleConvert}
            disabled={!url.trim() || status === "loading"}
            className="h-14 min-w-[140px] border-2 border-foreground bg-foreground text-background font-mono text-sm uppercase tracking-wider hover:bg-background hover:text-foreground transition-colors"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting
              </>
            ) : (
              "Convert"
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          Supports: youtube.com/watch?v=... or youtu.be/...
        </p>
      </div>

      {status === "success" && (
        <div className="animate-slide-up border-2 border-foreground p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Music className="h-5 w-5" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm truncate">{videoTitle}</p>
              <p className="text-xs text-muted-foreground font-mono">WAV • Lossless Audio</p>
            </div>
          </div>
          
          <Button
            onClick={handleDownload}
            className="w-full h-12 border-2 border-foreground bg-foreground text-background font-mono text-sm uppercase tracking-wider hover:bg-background hover:text-foreground transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Download WAV
          </Button>
        </div>
      )}
    </div>
  );
};
