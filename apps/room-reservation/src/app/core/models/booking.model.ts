export interface BookingRequest {
  id: string;
  requesterEmail: string;
  requestDate: Date;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  duration: string;
  roomNumber: string;
  status: 'pending';
}
