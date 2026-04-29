import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music } from "lucide-react";

interface ChordsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  song: {
    title: string;
    artist: string;
    chords?: string;
  } | null;
}

export const ChordsDialog = ({ isOpen, onClose, song }: ChordsDialogProps) => {
  if (!song) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Music className="w-6 h-6 text-accent" />
            Acordes - {song.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {song.chords ? (
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground bg-muted/30 p-4 rounded-lg">
              {song.chords}
            </pre>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay acordes disponibles para esta canción</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
