import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/shared/services/notification.service';

interface BookingRequest {
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

@Component({
  selector: 'app-manage-requests',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
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
          <i class="pi pi-inbox text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Manage Requests</h1>
          <p class="text-gray-600">Review and approve booking requests</p>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <p-table
          [value]="bookingRequests"
          [loading]="loading"
          styleClass="p-datatable-sm"
          [scrollable]="true"
          scrollHeight="600px"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 20%">REQUESTER EMAIL</th>
              <th style="width: 15%">DATE OF REQUEST</th>
              <th style="width: 20%">BOOKING DATE & TIME</th>
              <th style="width: 10%">DURATION</th>
              <th style="width: 10%">ROOM</th>
              <th style="width: 25%" class="text-center action">ACTIONS</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-request>
            <tr>
              <td>
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                  >
                    <i class="pi pi-user text-blue-600 text-sm"></i>
                  </div>
                  <span class="font-medium text-gray-900">{{
                    request.requesterEmail
                  }}</span>
                </div>
              </td>
              <td>
                <span class="text-gray-600">{{
                  formatRequestDate(request.requestDate)
                }}</span>
              </td>
              <td>
                <div class="space-y-1">
                  <div class="font-medium text-gray-900">
                    {{ formatBookingDate(request.bookingDate) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ request.startTime }}-{{ request.endTime }}
                  </div>
                </div>
              </td>
              <td>
                <span class="text-gray-700">{{ request.duration }}</span>
              </td>
              <td>
                <span class="font-medium text-gray-900">{{
                  request.roomNumber
                }}</span>
              </td>
              <td class="text-center">
                <div class="flex items-center justify-center space-x-2">
                  <p-button
                    label="Approve"
                    icon="pi pi-check"
                    styleClass="p-button-success p-button-sm"
                    (onClick)="confirmApprove(request)"
                  ></p-button>
                  <p-button
                    label="Reject"
                    icon="pi pi-times"
                    styleClass="p-button-danger p-button-sm"
                    (onClick)="confirmReject(request)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8">
                <div class="text-gray-500">
                  <i class="pi pi-inbox text-4xl mb-4 block"></i>
                  <p class="text-lg font-medium">No pending requests</p>
                  <p class="text-sm">
                    All booking requests have been processed
                  </p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [
    `
      :host ::ng-deep {
        .p-datatable .p-datatable-thead > tr > th {
          background-color: #f8fafc;
          color: #374151;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem;
        }

        .p-datatable .p-datatable-thead > tr > th.action {
          text-align: right !important;
          padding-right: 10rem !important;
        }

        .p-datatable .p-datatable-tbody > tr > td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .p-datatable .p-datatable-tbody > tr:hover {
          background-color: #f9fafb;
        }

        .p-button-success {
          background: #16a34a;
          border-color: #16a34a;
          color: white;
        }

        .p-button-success:hover {
          background: #15803d;
          border-color: #15803d;
        }

        .p-button-danger {
          background: #dc2626;
          border-color: #dc2626;
          color: white;
        }

        .p-button-danger:hover {
          background: #b91c1c;
          border-color: #b91c1c;
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
export class ManageRequestsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  bookingRequests: BookingRequest[] = [];
  loading = false;

  ngOnInit() {
    this.loadBookingRequests();
  }

  loadBookingRequests() {
    this.loading = true;

    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.bookingRequests = [
        {
          id: '1',
          requesterEmail: 'john.doe@company.com',
          requestDate: new Date('2025-08-05'),
          bookingDate: new Date('2025-08-10'),
          startTime: '09:00',
          endTime: '12:00',
          duration: '3 hours',
          roomNumber: 'Room 1',
          status: 'pending',
        },
        {
          id: '2',
          requesterEmail: 'jane.smith@company.com',
          requestDate: new Date('2025-08-05'),
          bookingDate: new Date('2025-08-12'),
          startTime: '08:00',
          endTime: '16:00',
          duration: '8 hours',
          roomNumber: 'Room 2',
          status: 'pending',
        },
      ];
      this.loading = false;
    }, 1000);
  }

  confirmApprove(request: BookingRequest) {
    this.confirmationService.confirm({
      message: `Are you sure you want to approve the booking request from ${request.requesterEmail} for ${request.roomNumber}?`,
      header: 'Approve Request',
      icon: 'pi pi-check-circle',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.approveRequest(request);
      },
    });
  }

  confirmReject(request: BookingRequest) {
    this.confirmationService.confirm({
      message: `Are you sure you want to reject the booking request from ${request.requesterEmail} for ${request.roomNumber}?`,
      header: 'Reject Request',
      icon: 'pi pi-times-circle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-success',
      accept: () => {
        this.rejectRequest(request);
      },
    });
  }

  approveRequest(request: BookingRequest) {
    // Simulate API call to approve request
    setTimeout(() => {
      // Remove from pending requests
      this.bookingRequests = this.bookingRequests.filter(
        (r) => r.id !== request.id
      );

      // TODO: Update room slot status to 'booked'
      // For the requester: status = 'booked by you'
      // For other users: status = 'booked'

      this.notificationService.success(
        `Request from ${request.requesterEmail} has been approved`
      );
    }, 500);
  }

  rejectRequest(request: BookingRequest) {
    // Simulate API call to reject request
    setTimeout(() => {
      // Remove from pending requests
      this.bookingRequests = this.bookingRequests.filter(
        (r) => r.id !== request.id
      );

      // TODO: Update room slot status to 'available' for all users

      this.notificationService.success(
        `Request from ${request.requesterEmail} has been rejected`
      );
    }, 500);
  }

  formatRequestDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatBookingDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
