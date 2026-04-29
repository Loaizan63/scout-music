import { Flame, Footprints, Award, Music, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", name: "Todas", icon: Music },
  { id: "Fogata", name: "Fogata", icon: Flame },
  { id: "Marcha", name: "Marcha", icon: Footprints },
  { id: "Ceremonia", name: "Ceremonia", icon: Award },
];

export const MobileNav = ({ selectedCategory, onCategoryChange }: MobileNavProps) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-border p-4 z-50">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Music className="w-6 h-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Scout Music
          </span>
        </h1>

        <Sheet>
          <SheetTrigger asChild>
            <button 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="space-y-2 mt-8">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    aria-label={`Filtrar por ${category.name}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
