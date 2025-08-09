import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/shared/services/notification.service';

interface TimeSlot {
  time: string;
  status: 'available' | 'pending' | 'booked';
  bookingId?: string;
  guestName?: string;
}

interface Room {
  id: string;
  name: string;
  slots: TimeSlot[];
}

@Component({
  selector: 'app-manage-rooms',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CalendarModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center space-x-3">
        <div
          class="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"
        >
          <i class="pi pi-home text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Manage Rooms</h1>
          <p class="text-gray-600">
            View room availability and manage bookings
          </p>
        </div>
      </div>

      <!-- Date Picker -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center space-x-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <p-calendar
              [(ngModel)]="selectedDate"
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              [minDate]="today"
              (onSelect)="onDateChange()"
              placeholder="Select date"
              styleClass="w-64"
            ></p-calendar>
          </div>
        </div>
      </div>

      <!-- Room Availability Grid -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            Room Availability - {{ formatDate(selectedDate) }}
          </h3>
        </div>

        <div class="overflow-x-auto">
          <div class="inline-block min-w-full">
            <!-- Time Header -->
            <div class="flex bg-gray-50 border-b border-gray-200">
              <div class="w-24 p-4 font-medium text-gray-700 text-center">
                Room
              </div>
              <div
                *ngFor="let timeSlot of timeSlots"
                class="w-32 p-4 text-center"
              >
                <div class="text-sm font-medium text-gray-700">
                  {{ timeSlot }}
                </div>
              </div>
            </div>

            <!-- Room Rows -->
            <div
              *ngFor="let room of rooms; trackBy: trackByRoomId"
              class="flex border-b border-gray-100 hover:bg-gray-50"
            >
              <div
                class="w-24 p-4 font-medium text-gray-900 flex items-center justify-center bg-gray-50"
              >
                {{ room.name }}
              </div>
              <div
                *ngFor="let slot of room.slots; let i = index"
                class="w-32 p-2"
              >
                <div
                  class="h-12 rounded-lg border-2 flex items-center justify-center relative group cursor-pointer transition-all duration-200"
                  [ngClass]="{
                    'bg-gray-50 border-dashed border-gray-300 hover:border-gray-400':
                      slot.status === 'available',
                    'bg-blue-500 border-blue-500 text-white':
                      slot.status === 'booked',
                    'bg-yellow-500 border-yellow-500 text-white':
                      slot.status === 'pending'
                  }"
                >
                  <span
                    class="text-sm font-medium"
                    [ngClass]="{
                      'text-gray-500': slot.status === 'available',
                      'text-white':
                        slot.status === 'booked' || slot.status === 'pending'
                    }"
                  >
                    {{ getSlotLabel(slot) }}
                  </span>

                  <button
                    *ngIf="
                      slot.status === 'booked' || slot.status === 'pending'
                    "
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    (click)="confirmCancelBooking(room, slot, i)"
                  >
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center  space-x-6 ml-8">
        <div class="flex items-center space-x-2">
          <div
            class="w-4 h-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded"
          ></div>
          <span class="text-sm text-gray-600">Available</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-blue-500 rounded"></div>
          <span class="text-sm text-gray-600">Booked</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-yellow-500 rounded"></div>
          <span class="text-sm text-gray-600">Pending</span>
        </div>
      </div>
    </div>

    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [
    `
      :host ::ng-deep {
        .p-calendar {
          .p-inputtext {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 0.75rem;
          }

          .p-inputtext:focus {
            border-color: #16a34a;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
          }
        }

        .p-button {
          border-radius: 8px;
        }

        .p-confirmdialog {
          border-radius: 12px;
          overflow: hidden;
        }

        .p-confirmdialog .p-dialog-header {
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }
      }
    `,
  ],
})
export class ManageRoomsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  selectedDate: Date = new Date();
  today: Date = new Date();
  rooms: Room[] = [];
  timeSlots: string[] = [];

  ngOnInit() {
    this.generateTimeSlots();
    this.loadRoomData();
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        this.timeSlots.push(time);
      }
    }
  }

  loadRoomData() {
    // Generate sample data similar to the screenshot
    this.rooms = [
      {
        id: '1',
        name: 'Room 1',
        slots: this.generateSampleSlots('room1'),
      },
      {
        id: '2',
        name: 'Room 2',
        slots: this.generateSampleSlots('room2'),
      },
    ];
  }

  generateSampleSlots(roomId: string): TimeSlot[] {
    return this.timeSlots.map((time, index) => {
      let status: 'available' | 'pending' | 'booked' = 'available';
      let guestName = '';

      // Sample data to match the screenshot
      if (roomId === 'room1') {
        if (time === '10:00') {
          status = 'pending';
          guestName = 'Pending Approval';
        }
      } else if (roomId === 'room2') {
        if (time === '10:00' || time === '10:30') {
          status = 'booked';
          guestName = 'John Doe';
        }
      }

      return {
        time,
        status,
        bookingId:
          status !== 'available' ? `booking-${roomId}-${index}` : undefined,
        guestName: status !== 'available' ? guestName : undefined,
      };
    });
  }

  onDateChange() {
    // Reload room data for the selected date
    this.loadRoomData();
  }

  getSlotLabel(slot: TimeSlot): string {
    switch (slot.status) {
      case 'available':
        return 'Available';
      case 'pending':
        return 'Pending';
      case 'booked':
        return 'Booked';
      default:
        return 'Available';
    }
  }

  confirmCancelBooking(room: Room, slot: TimeSlot, slotIndex: number) {
    const statusText = slot.status === 'booked' ? 'booking' : 'pending request';

    this.confirmationService.confirm({
      message: `Are you sure you want to cancel this ${statusText} for ${room.name} at ${slot.time}?`,
      header: 'Cancel Booking',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cancelBooking(room, slotIndex);
      },
    });
  }

  cancelBooking(room: Room, slotIndex: number) {
    // Simulate API call
    setTimeout(() => {
      room.slots[slotIndex] = {
        time: room.slots[slotIndex].time,
        status: 'available',
      };

      this.notificationService.success('Booking cancelled successfully');
    }, 500);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  trackByRoomId(index: number, room: Room): string {
    return room.id;
  }
}
