import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { audioBufferToWav } from "@/lib/wavEncoder";
import dogLogo from "@/assets/dog-logo-pixel.png";

type ConversionStatus = "idle" | "loading" | "converting" | "success" | "error";

interface ConversionResult {
  title: string;
  wavBlob: Blob;
  duration?: string;
}

export const ConverterForm = () => {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Simulate progress animation during loading/converting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "loading" || status === "converting") {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          // Slow down as we approach 90%
          if (prev >= 90) return prev;
          const increment = status === "loading" ? 2 : 1;
          return Math.min(prev + increment, 90);
        });
      }, 200);
    } else if (status === "success") {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [status]);

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

  const convertMp3ToWav = async (mp3Url: string): Promise<Blob> => {
    const response = await fetch(mp3Url);
    if (!response.ok) {
      throw new Error('Failed to fetch audio file');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBlob = audioBufferToWav(audioBuffer);
    await audioContext.close();
    
    return wavBlob;
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

      setStatus("converting");
      toast({
        title: "Converting to WAV",
        description: "Processing audio, please wait...",
      });

      const wavBlob = await convertMp3ToWav(data.downloadUrl);

      setResult({
        title: data.title,
        wavBlob,
        duration: data.duration,
      });
      setStatus("success");
      
      toast({
        title: "Conversion Complete",
        description: "Your WAV file is ready for download",
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
    if (result?.wavBlob) {
      const url = URL.createObjectURL(result.wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.title.replace(/[^a-zA-Z0-9]/g, '_')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your WAV file is downloading",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && status !== "loading" && status !== "converting") {
      handleConvert();
    }
  };

  const isProcessing = status === "loading" || status === "converting";

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Paste YouTube URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-14 border-4 border-foreground bg-background px-4 font-pixel text-[10px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground rounded-none"
          disabled={isProcessing}
        />
        
        <Button
          onClick={handleConvert}
          disabled={!url.trim() || isProcessing}
          className="w-full h-14 border-4 border-foreground bg-foreground text-background font-pixel text-xs uppercase tracking-wider hover:bg-background hover:text-foreground transition-colors rounded-none shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          {isProcessing ? (
            status === "loading" ? "FETCHING..." : "CONVERTING..."
          ) : (
            "CONVERT TO WAV"
          )}
        </Button>

        <p className="text-center text-[8px] text-muted-foreground font-pixel">
          Supports: youtube.com or youtu.be
        </p>
      </div>

      {/* Loading Bar with Dog */}
      {isProcessing && (
        <div className="space-y-2 pt-4">
          <div className="relative h-8 border-4 border-foreground bg-background">
            {/* Progress fill */}
            <div 
              className="absolute inset-y-0 left-0 bg-foreground transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
            {/* Dog walking on the bar */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-200"
              style={{ left: `calc(${progress}% - 12px)` }}
            >
              <img 
                src={dogLogo} 
                alt="Loading dog" 
                className="h-6 w-6 grayscale contrast-200 animate-walk"
              />
            </div>
          </div>
          <p className="text-center font-pixel text-[8px] text-muted-foreground">
            {status === "loading" ? "Fetching audio..." : "Converting to WAV..."}
          </p>
        </div>
      )}

      {status === "success" && result && (
        <div className="border-4 border-foreground p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Music className="h-5 w-5" />
            <div className="flex-1 min-w-0">
              <p className="font-pixel text-[10px] truncate">{result.title}</p>
              <p className="text-[8px] text-muted-foreground font-pixel">
                WAV Audio {result.duration && `• ${result.duration}`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              className="flex-1 h-12 border-4 border-foreground bg-foreground text-background font-pixel text-[10px] uppercase tracking-wider hover:bg-background hover:text-foreground transition-colors rounded-none shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              <Download className="mr-2 h-4 w-4" />
              DOWNLOAD
            </Button>
            <Button
              onClick={() => {
                setUrl("");
                setResult(null);
                setStatus("idle");
                setProgress(0);
              }}
              variant="outline"
              className="h-12 border-4 border-foreground bg-background text-foreground font-pixel text-[10px] uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-none shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              NEXT
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
