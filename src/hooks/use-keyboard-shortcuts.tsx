import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  isEnabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeUp,
  onVolumeDown,
  isEnabled = true,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          onPlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPrevious();
          break;
        case "+":
        case "=":
          e.preventDefault();
          onVolumeUp();
          break;
        case "-":
        case "_":
          e.preventDefault();
          onVolumeDown();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPlayPause, onNext, onPrevious, onVolumeUp, onVolumeDown, isEnabled]);
};
