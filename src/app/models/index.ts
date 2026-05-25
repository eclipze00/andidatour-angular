export type CabinClass = 'economica' | 'executiva' | 'primeira';
export type QuoteStatus = 'rascunho' | 'enviada' | 'aprovada' | 'expirada' | 'cancelada';

export interface Airline {
  code: string;
  name: string;
  color: string;
  initials: string;
}

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface FlightSegment {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  airline: string;
  flightNumber: string;
  duration: string;
}

export interface FlightOption {
  id: string;
  airline: Airline;
  from: Airport;
  to: Airport;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
  taxes: number;
  miles?: number;
  milesProgram?: string;
  cabin: CabinClass;
  baggage: string;
  segments: FlightSegment[];
}

export interface FlightQuote {
  id: string;
  clientName: string;
  from: string;
  to: string;
  travelDate: string;
  bestPrice: number;
  status: QuoteStatus;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  preferences?: string;
  notes?: string;
  quotes: number;
}

export interface PriceAlert {
  id: string;
  from: string;
  to: string;
  periodStart: string;
  periodEnd: string;
  maxPrice: number;
  milesProgram?: string;
  channels: ('email' | 'whatsapp' | 'panel')[];
  active: boolean;
}

export interface ApiIntegration {
  id: string;
  name: string;
  category: 'airline' | 'search' | 'miles' | 'payment' | 'email' | 'whatsapp';
  status: 'connected' | 'disconnected' | 'error';
  apiKeyMask?: string;
}