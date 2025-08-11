export interface TimeSlot {
  time: string;
  status: 'available' | 'pending' | 'booked';
  bookingId?: string;
  guestName?: string;
}

export interface Room {
  id: string;
  name: string;
  slots: TimeSlot[];
}
