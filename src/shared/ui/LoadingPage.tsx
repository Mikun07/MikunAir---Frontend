import { Spinner } from './Spinner';

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading…' }: LoadingPageProps) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner size="lg" label={message} />
      <p className="text-sm text-gray-500">{message}</p>
    </main>
  );
}
