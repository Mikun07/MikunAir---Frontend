export interface AirportOption {
  iataCode: string;
  city: string;
  country: string;
  name: string;
}

export const AIRPORTS: AirportOption[] = [
  { iataCode: 'ARN', city: 'Stockholm', country: 'Sweden', name: 'Stockholm Arlanda' },
  { iataCode: 'GOT', city: 'Gothenburg', country: 'Sweden', name: 'Göteborg Landvetter' },
  { iataCode: 'MMX', city: 'Malmö', country: 'Sweden', name: 'Malmö Airport' },
  { iataCode: 'CPH', city: 'Copenhagen', country: 'Denmark', name: 'Copenhagen Airport' },
  { iataCode: 'OSL', city: 'Oslo', country: 'Norway', name: 'Oslo Gardermoen' },
  { iataCode: 'BGO', city: 'Bergen', country: 'Norway', name: 'Bergen Airport' },
  { iataCode: 'TRD', city: 'Trondheim', country: 'Norway', name: 'Trondheim Værnes' },
  { iataCode: 'HEL', city: 'Helsinki', country: 'Finland', name: 'Helsinki Vantaa' },
  { iataCode: 'LHR', city: 'London', country: 'United Kingdom', name: 'Heathrow' },
  { iataCode: 'LGW', city: 'London', country: 'United Kingdom', name: 'Gatwick' },
  { iataCode: 'STN', city: 'London', country: 'United Kingdom', name: 'Stansted' },
  { iataCode: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam Schiphol' },
  { iataCode: 'CDG', city: 'Paris', country: 'France', name: 'Paris Charles de Gaulle' },
  { iataCode: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { iataCode: 'MUC', city: 'Munich', country: 'Germany', name: 'Munich Airport' },
  { iataCode: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Barcelona El Prat' },
  { iataCode: 'MAD', city: 'Madrid', country: 'Spain', name: 'Adolfo Suárez Madrid–Barajas' },
  { iataCode: 'FCO', city: 'Rome', country: 'Italy', name: 'Rome Fiumicino' },
  { iataCode: 'MXP', city: 'Milan', country: 'Italy', name: 'Milan Malpensa' },
  { iataCode: 'VIE', city: 'Vienna', country: 'Austria', name: 'Vienna International' },
  { iataCode: 'ZRH', city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport' },
  { iataCode: 'BRU', city: 'Brussels', country: 'Belgium', name: 'Brussels Airport' },
  { iataCode: 'DUB', city: 'Dublin', country: 'Ireland', name: 'Dublin Airport' },
  { iataCode: 'LIS', city: 'Lisbon', country: 'Portugal', name: 'Humberto Delgado' },
  { iataCode: 'ATH', city: 'Athens', country: 'Greece', name: 'Athens Eleftherios Venizelos' },
  { iataCode: 'WAW', city: 'Warsaw', country: 'Poland', name: 'Warsaw Chopin' },
  { iataCode: 'PRG', city: 'Prague', country: 'Czech Republic', name: 'Václav Havel Airport' },
  { iataCode: 'BUD', city: 'Budapest', country: 'Hungary', name: 'Budapest Ferenc Liszt' },
  { iataCode: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International' },
  { iataCode: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy' },
  { iataCode: 'EWR', city: 'New York', country: 'USA', name: 'Newark Liberty' },
  { iataCode: 'LAX', city: 'Los Angeles', country: 'USA', name: 'Los Angeles International' },
  { iataCode: 'ORD', city: 'Chicago', country: 'USA', name: "O'Hare International" },
  { iataCode: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson' },
  { iataCode: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Changi Airport' },
  { iataCode: 'NRT', city: 'Tokyo', country: 'Japan', name: 'Tokyo Narita' },
  { iataCode: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith' },
];

export function searchAirports(query: string): AirportOption[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  return AIRPORTS.filter(
    (a) =>
      a.iataCode.toLowerCase().startsWith(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q),
  ).slice(0, 6);
}
