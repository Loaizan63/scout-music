import { Music } from "lucide-react";

interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

// Default icon mapping for categories
const categoryIcons: Record<string, string> = {
  "Clan": "🔥",
  "Marcha": "🚶",
  "Comunidad": "👥",
  "Ceremonia": "🎖️",
  "Manada": "👦",
  "Rovers": "🧗",
  "Tropa": "⚜️",
};

export const Sidebar = ({ selectedCategory, onCategoryChange, categories }: SidebarProps) => {
  const categoryList = [
    { id: "all", name: "Todas", icon: "🎵" },
    ...categories.map((cat) => ({
      id: cat,
      name: cat,
      icon: categoryIcons[cat] || "🎶",
    })),
  ];

  return (
    <aside className="w-64 bg-card border-r border-border p-6 hidden md:flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Music className="w-8 h-8 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Scout Music
          </span>
        </h1>
      </div>

      <nav className="space-y-2">
        {categoryList.map((category) => {
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
            >
              <span className="text-xl">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Música Scout</p>
          <p className="mt-1">Para fogatas y campamentos</p>
        </div>
      </div>
    </aside>
  );
};
