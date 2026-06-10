import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@shared/ui';
import { useWindowTitle } from '@shared/hooks';
import { SearchForm, SearchFormValues } from './SearchForm';

export function HomePage() {
  useWindowTitle('Search Flights');
  const navigate = useNavigate();

  function handleSearch(values: SearchFormValues) {
    const params = new URLSearchParams({
      origin: values.origin,
      destination: values.destination,
      departureDate: values.departureDate,
      passengers: String(values.passengers),
      seatClass: values.seatClass,
    });
    if (values.returnDate) params.set('returnDate', values.returnDate);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">MikunAir</h1>
          <p className="text-blue-200">Find and book your next flight</p>
        </div>
        <Card>
          <SearchForm onSearch={handleSearch} />
        </Card>
        <nav className="mt-6 flex justify-center gap-4 text-sm text-blue-200">
          <Link to="/auth/login" className="hover:text-white underline">Sign in</Link>
          <Link to="/auth/register" className="hover:text-white underline">Create account</Link>
        </nav>
      </div>
    </main>
  );
}
