import { ConverterForm } from "@/components/ConverterForm";
import dogLogo from "@/assets/dog-logo-pixel.png";

const Index = () => {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground">
        <div className="container py-4 flex items-center gap-3">
          <img 
            src={dogLogo} 
            alt="Logo" 
            className="h-8 w-8 grayscale contrast-200"
          />
          <h1 className="font-mono text-lg font-bold tracking-tight">
            YT→WAV
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl space-y-8 py-16">
          <div className="space-y-2">
            <h2 className="font-mono text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              YouTube to WAV
            </h2>
            <p className="text-muted-foreground font-mono text-sm">
              Convert any YouTube video to lossless WAV audio
            </p>
          </div>

          <ConverterForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground">
        <div className="container py-4">
          <p className="font-mono text-xs text-muted-foreground">
            For personal use only. Respect copyright.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
