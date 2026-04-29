'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginState {
  error: string | null;
}

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get('password');
  const masterPassword = process.env.ADMIN_PASSWORD;

  if (!masterPassword) {
    return { error: 'La contraseña maestra no está configurada en el servidor (.env).' };
  }

  if (password === masterPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    redirect('/admin');
  }

  return { error: 'Contraseña incorrecta.' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_auth');
  redirect('/admin/login');
}
