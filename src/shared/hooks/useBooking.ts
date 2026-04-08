import { useState } from 'react';
import { axiosClient } from '@shared/api';

export interface PassengerDTO {
  fullName: string;
  dateOfBirth: string;
  documentType: 'PASSPORT' | 'ID_CARD';
  documentNumber: string;
}

export interface CreateBookingDTO {
  outboundFlightId: string;
  inboundFlightId?: string;
  seatClass: 'ECONOMY' | 'BUSINESS';
  passengers: PassengerDTO[];
}

export interface BookingConfirmationResponse {
  bookingId: string;
  reference: string;
  status: 'CONFIRMED';
  totalPricePence: number;
}

export function useBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBooking(dto: CreateBookingDTO): Promise<BookingConfirmationResponse> {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.post<BookingConfirmationResponse>('/bookings', dto);
      return data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const message =
        status === 409
          ? 'This flight is no longer available. Please search again.'
          : 'Booking failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { createBooking, isLoading, error };
}
