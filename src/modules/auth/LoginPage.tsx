import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from './AuthContext';
import { Button, Input, Alert } from '@shared/ui';
import { useWindowTitle } from '@shared/hooks';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

function MikunAirWordmark() {
  return (
    <div className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 shadow-lg shadow-sky-500/30">
        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </span>
      <span className="text-white">
        Mikun<span className="text-sky-400">Air</span>
      </span>
    </div>
  );
}

export function LoginPage() {
  useWindowTitle('Sign In');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');

    const result = schema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
    } catch {
      setServerError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" aria-label="MikunAir home">
            <MikunAirWordmark />
          </Link>
          <Link
            to="/auth/register"
            className="px-4 py-1.5 text-sm font-medium text-slate-900 bg-white hover:bg-white/90 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Create account
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm flex flex-col gap-8">
          {/* Heading */}
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-white/50">Sign in to manage your bookings</p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
            {serverError && (
              <div className="mb-5">
                <Alert variant="error">{serverError}</Alert>
              </div>
            )}

            <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="flex flex-col gap-5">
              <Input
                dark
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
                required
              />
              <Input
                dark
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
                required
              />
              <Button type="submit" loading={loading} className="w-full mt-1">
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-sm text-center text-white/40">
              Don&apos;t have an account?{' '}
              <Link to="/auth/register" className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-xs text-white/20">
          © 2026 MikunAir. Portfolio project by Festus-Olaleye Ayomikun.
        </p>
      </footer>
    </div>
  );
}
