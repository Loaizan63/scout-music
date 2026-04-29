import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin_auth')?.value === 'authenticated';

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return <AdminDashboard />;
}
