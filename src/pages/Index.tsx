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
            alt="WavDog Logo" 
            className="h-10 w-10 grayscale contrast-200"
          />
          <h1 className="font-mono text-lg font-bold tracking-tight">
            WavDog
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl space-y-8 py-16">
          {/* Hero branding */}
          <div className="flex items-center gap-4">
            <img 
              src={dogLogo} 
              alt="WavDog Logo" 
              className="h-16 w-16 md:h-20 md:w-20 grayscale contrast-200"
            />
            <span className="font-mono text-5xl md:text-6xl font-bold tracking-tight">
              WavDog
            </span>
          </div>
          
          <div className="space-y-2">
            <h2 className="font-mono text-3xl md:text-4xl font-bold tracking-tight leading-tight">
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
