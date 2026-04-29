'use client';

import { useActionState } from 'react';
import { loginAction, LoginState } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const initialState: LoginState = {
  error: null,
};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effect */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px] mix-blend-screen opacity-50" />
      </div>

      <Link href="/" className="absolute top-6 left-6 z-20">
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </Link>

      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl z-10 animate-scale-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center mb-4 border border-accent/20 shadow-[0_0_30px_hsl(var(--accent)/0.2)]">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-center tracking-tight">Acceso Restringido</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">Panel de Administración</p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white/80 ml-1">
              Contraseña Maestra
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-black/50 border-white/10 focus-visible:ring-accent h-12 text-center tracking-[0.25em]"
            />
          </div>

          {state?.error && (
            <p className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
            disabled={isPending}
          >
            {isPending ? 'Verificando...' : 'Entrar al Panel'}
          </Button>
        </form>
      </div>
    </div>
  );
}
