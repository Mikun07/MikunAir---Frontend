import { gql, useQuery } from '@apollo/client';

export interface Airport {
  iataCode: string;
  city: string;
}

export interface Fare {
  baseFarePence: number;
  taxesPence: number;
  totalPence: number;
  currency: string;
}

export interface FlightOption {
  id: string;
  flightNumber: string;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  availableSeats: number;
  farePerPassenger: Fare;
  origin: Airport;
  destination: Airport;
}

export interface ConnectingFlightOption {
  leg1: FlightOption;
  leg2: FlightOption;
  layoverMinutes: number;
  totalDurationMinutes: number;
  totalFarePerPassenger: Fare;
}

export interface FlightSearchResult {
  outbound: FlightOption[];
  inbound: FlightOption[] | null;
  connectingOutbound: ConnectingFlightOption[];
  connectingInbound: ConnectingFlightOption[] | null;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  passengers: number;
  returnDate?: string;
  seatClass?: 'ECONOMY' | 'BUSINESS';
}

const SEARCH_FLIGHTS = gql`
  query SearchFlights(
    $origin: String!
    $destination: String!
    $departureDate: String!
    $passengers: Int!
    $returnDate: String
    $seatClass: SeatClass
  ) {
    searchFlights(
      origin: $origin
      destination: $destination
      departureDate: $departureDate
      passengers: $passengers
      returnDate: $returnDate
      seatClass: $seatClass
    ) {
      outbound {
        id flightNumber departureAt arrivalAt durationMinutes availableSeats
        farePerPassenger { baseFarePence taxesPence totalPence currency }
        origin { iataCode city }
        destination { iataCode city }
      }
      inbound {
        id flightNumber departureAt arrivalAt durationMinutes availableSeats
        farePerPassenger { baseFarePence taxesPence totalPence currency }
        origin { iataCode city }
        destination { iataCode city }
      }
      connectingOutbound {
        layoverMinutes totalDurationMinutes
        totalFarePerPassenger { baseFarePence taxesPence totalPence currency }
        leg1 { id flightNumber departureAt arrivalAt durationMinutes availableSeats farePerPassenger { baseFarePence taxesPence totalPence currency } origin { iataCode city } destination { iataCode city } }
        leg2 { id flightNumber departureAt arrivalAt durationMinutes availableSeats farePerPassenger { baseFarePence taxesPence totalPence currency } origin { iataCode city } destination { iataCode city } }
      }
      connectingInbound {
        layoverMinutes totalDurationMinutes
        totalFarePerPassenger { baseFarePence taxesPence totalPence currency }
        leg1 { id flightNumber departureAt arrivalAt durationMinutes availableSeats farePerPassenger { baseFarePence taxesPence totalPence currency } origin { iataCode city } destination { iataCode city } }
        leg2 { id flightNumber departureAt arrivalAt durationMinutes availableSeats farePerPassenger { baseFarePence taxesPence totalPence currency } origin { iataCode city } destination { iataCode city } }
      }
    }
  }
`;

export function useFlightSearch(params: FlightSearchParams | null) {
  const { data, loading, error, refetch } = useQuery<{ searchFlights: FlightSearchResult }>(
    SEARCH_FLIGHTS,
    {
      variables: params ?? undefined,
      skip: params === null,
    },
  );

  return {
    data: data?.searchFlights ?? null,
    isLoading: loading,
    error: error ?? null,
    refetch,
  };
}
