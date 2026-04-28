import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useFlightSearch, FlightOption, FlightSearchParams } from '@shared/hooks';
import { Alert, Button, Card } from '@shared/ui';
import { FlightResultsList } from './FlightResultsList';
import { SearchForm, SearchFormValues } from './SearchForm';

function paramsFromSearch(sp: URLSearchParams): FlightSearchParams | null {
  const origin = sp.get('origin');
  const destination = sp.get('destination');
  const departureDate = sp.get('departureDate');
  const passengers = Number(sp.get('passengers') ?? '1');
  if (!origin || !destination || !departureDate) return null;
  return {
    origin,
    destination,
    departureDate,
    passengers,
    returnDate: sp.get('returnDate') ?? undefined,
    seatClass: (sp.get('seatClass') as 'ECONOMY' | 'BUSINESS' | null) ?? 'ECONOMY',
  };
}

export function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = paramsFromSearch(searchParams);

  const { data, isLoading, error, refetch } = useFlightSearch(queryParams);

  const [selectedOutbound, setSelectedOutbound] = useState<FlightOption | null>(null);
  const [selectedInbound, setSelectedInbound] = useState<FlightOption | null>(null);

  const isReturnTrip = Boolean(searchParams.get('returnDate'));

  function handleSearch(values: SearchFormValues) {
    const params: Record<string, string> = {
      origin: values.origin,
      destination: values.destination,
      departureDate: values.departureDate,
      passengers: String(values.passengers),
      seatClass: values.seatClass,
    };
    if (values.returnDate) params.returnDate = values.returnDate;
    setSearchParams(params);
    setSelectedOutbound(null);
    setSelectedInbound(null);
  }

  function handleContinue() {
    if (!selectedOutbound) return;
    const passengers = searchParams.get('passengers') ?? '1';
    const seatClass = searchParams.get('seatClass') ?? 'ECONOMY';
    const params = new URLSearchParams({
      outboundFlightId: selectedOutbound.id,
      passengers,
      seatClass,
    });
    if (selectedInbound) params.set('inboundFlightId', selectedInbound.id);
    navigate(`/booking?${params.toString()}`);
  }

  const canContinue = selectedOutbound !== null && (!isReturnTrip || selectedInbound !== null);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <Card>
          <SearchForm
            onSearch={handleSearch}
            initialValues={{
              origin: searchParams.get('origin') ?? '',
              destination: searchParams.get('destination') ?? '',
              departureDate: searchParams.get('departureDate') ?? '',
              returnDate: searchParams.get('returnDate') ?? '',
              passengers: Number(searchParams.get('passengers') ?? '1'),
              seatClass: (searchParams.get('seatClass') as 'ECONOMY' | 'BUSINESS') ?? 'ECONOMY',
            }}
          />
        </Card>

        {error && (
          <Alert variant="error" title="Search failed" onRetry={() => void refetch()}>
            Unable to load flights. Please try again.
          </Alert>
        )}

        {!error && !isLoading && (data?.outbound?.length ?? 0) > 0 && (
          <h2 className="text-xl font-bold text-gray-900">Available flights</h2>
        )}

        {!error && (
          <>
            <FlightResultsList
              title="Outbound flights"
              flights={data?.outbound ?? []}
              isLoading={isLoading}
              selectedId={selectedOutbound?.id ?? null}
              onSelect={setSelectedOutbound}
            />

            {isReturnTrip && (
              <FlightResultsList
                title="Return flights"
                flights={data?.inbound ?? []}
                isLoading={isLoading}
                selectedId={selectedInbound?.id ?? null}
                onSelect={setSelectedInbound}
              />
            )}
          </>
        )}

        {canContinue && (
          <div className="flex justify-end">
            <Button size="lg" onClick={handleContinue}>
              Continue to booking
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
