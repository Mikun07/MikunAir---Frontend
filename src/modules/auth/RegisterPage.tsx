import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from './AuthContext';
import { Button, Input, Alert } from '@shared/ui';
import { useWindowTitle } from '@shared/hooks';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the privacy policy to register' }),
  }),
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

export function RegisterPage() {
  useWindowTitle('Create Account');
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    consentGiven?: string;
  }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');

    const result = schema.safeParse({ email, password, consentGiven });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        consentGiven: fieldErrors.consentGiven?.[0],
      });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await register(email, password, true);
      navigate('/', { replace: true, state: { registered: true } });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setServerError(
        status === 409 ? 'An account with this email already exists.' : 'Registration failed. Please try again.',
      );
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
            to="/auth/login"
            className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm flex flex-col gap-8">
          {/* Heading */}
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-white/50">Book flights in seconds, no hidden fees</p>
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
                hint="Minimum 8 characters"
                autoComplete="new-password"
                required
              />

              {/* Consent */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-start gap-3 text-sm text-white/70 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 accent-sky-500"
                    aria-describedby={errors.consentGiven ? 'consent-error' : undefined}
                  />
                  I agree to the privacy policy and consent to my data being processed.
                </label>
                {errors.consentGiven && (
                  <p id="consent-error" role="alert" className="text-xs text-red-400 pl-6">
                    {errors.consentGiven}
                  </p>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full mt-1">
                Create account
              </Button>
            </form>

            <p className="mt-6 text-sm text-center text-white/40">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 text-xs text-white/25">
            <span>🔒 Encrypted</span>
            <span>✈ Instant booking</span>
            <span>🌍 120+ routes</span>
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
