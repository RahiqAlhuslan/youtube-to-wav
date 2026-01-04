import { ConverterForm } from "@/components/ConverterForm";
import dogLogo from "@/assets/dog-logo-pixel.png";

const Index = () => {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b-4 border-foreground">
        <div className="container py-4 flex items-center gap-3">
          <img 
            src={dogLogo} 
            alt="WavDog Logo" 
            className="h-10 w-10 grayscale contrast-200"
          />
          <h1 className="font-pixel text-sm tracking-tight">
            WavDog
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl space-y-8 py-16">
          {/* Hero branding */}
          <div className="flex items-center justify-center gap-4">
            <span className="font-pixel text-4xl md:text-5xl tracking-tight">
              WavDog
            </span>
            <img 
              src={dogLogo} 
              alt="WavDog Logo" 
              className="h-16 w-16 md:h-20 md:w-20 grayscale contrast-200"
            />
          </div>
          
          <p className="text-center text-muted-foreground font-pixel text-[10px] md:text-xs leading-relaxed">
            YouTube to WAV · Convert any YouTube video to lossless WAV audio
          </p>

          <ConverterForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-foreground">
        <div className="container py-4">
          <p className="font-pixel text-[8px] text-muted-foreground">
            For personal use only. Respect copyright.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
