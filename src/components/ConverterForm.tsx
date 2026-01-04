import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ConversionStatus = "idle" | "loading" | "success" | "error";

interface ConversionResult {
  title: string;
  downloadUrl: string;
  duration?: string;
  filesize?: string;
}

export const ConverterForm = () => {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [result, setResult] = useState<ConversionResult | null>(null);
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
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('youtube-to-wav', {
        body: { videoId },
      });

      if (error) {
        throw new Error(error.message || 'Conversion failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        title: data.title,
        downloadUrl: data.downloadUrl,
        duration: data.duration,
        filesize: data.filesize,
      });
      setStatus("success");
      
      toast({
        title: "Conversion Complete",
        description: "Your audio file is ready for download",
      });
    } catch (error) {
      console.error('Conversion error:', error);
      setStatus("error");
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Unable to convert video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
      toast({
        title: "Download Started",
        description: "Your file will download shortly",
      });
    }
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

      {status === "success" && result && (
        <div className="animate-slide-up border-2 border-foreground p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Music className="h-5 w-5" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm truncate">{result.title}</p>
              <p className="text-xs text-muted-foreground font-mono">
                MP3 Audio {result.duration && `• ${result.duration}`}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleDownload}
            className="w-full h-12 border-2 border-foreground bg-foreground text-background font-mono text-sm uppercase tracking-wider hover:bg-background hover:text-foreground transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Audio
          </Button>
        </div>
      )}
    </div>
  );
};
