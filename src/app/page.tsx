import { fetchSongs, fetchCategories } from "@/lib/data";
import HomeClient from "@/components/HomeClient";

// Opt-out of static rendering if you want to always fetch the latest songs,
// or keep it static if songs rarely change.
export const revalidate = 60; // revalidate every 60 seconds

export default async function Home() {
  try {
    const [initialSongs, initialCategories] = await Promise.all([
      fetchSongs(),
      fetchCategories(),
    ]);

    return <HomeClient initialSongs={initialSongs} initialCategories={initialCategories} />;
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Error al cargar las canciones. Por favor intenta más tarde.</p>
      </div>
    );
  }
}
