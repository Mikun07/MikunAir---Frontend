import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from './AuthContext';
import { Button, Input, Card, Alert } from '@shared/ui';
import { useWindowTitle } from '@shared/hooks';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the privacy policy to register' }),
  }),
});

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
      navigate('/', { replace: true });
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create account</h1>
        {serverError && (
          <div className="mb-4">
            <Alert variant="error">{serverError}</Alert>
          </div>
        )}
        <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint="Minimum 8 characters"
            autoComplete="new-password"
            required
          />
          <div className="flex flex-col gap-1">
            <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5"
                aria-describedby={errors.consentGiven ? 'consent-error' : undefined}
              />
              I agree to the privacy policy and consent to my data being processed.
            </label>
            {errors.consentGiven && (
              <p id="consent-error" role="alert" className="text-xs text-red-600">
                {errors.consentGiven}
              </p>
            )}
          </div>
          <Button type="submit" loading={loading} className="w-full mt-2">
            Create account
          </Button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-blue-700 underline hover:no-underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
