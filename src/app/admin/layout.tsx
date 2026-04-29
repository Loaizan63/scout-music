import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Campfire Tunes',
  description: 'Panel de Administración de canciones',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent/30 selection:text-white">
      {children}
    </div>
  );
}
