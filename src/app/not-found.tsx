import Link from "next/link";
import { Music } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md bg-card/50 p-8 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="flex justify-center">
          <div className="relative">
            <Music className="w-24 h-24 text-muted-foreground/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-foreground/80">
              404
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Canción No Encontrada
          </h1>
          <p className="text-muted-foreground text-sm">
            Parece que la página que estás buscando se perdió en el campamento.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
