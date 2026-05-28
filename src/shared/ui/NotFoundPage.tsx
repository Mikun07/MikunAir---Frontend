import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <div aria-hidden="true" className="text-8xl font-extrabold text-blue-700">
        404
      </div>
      <h1 className="text-2xl font-semibold text-gray-800">Page not found</h1>
      <p className="text-gray-600 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
      >
        Back to home
      </Link>
    </main>
  );
}
