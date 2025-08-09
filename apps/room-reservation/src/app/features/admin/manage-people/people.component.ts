import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { NotificationService } from '@/shared/services/notification.service';

interface StaffMember {
  id: string;
  email: string;
  status: 'Active' | 'Pending';
  createdAt: Date;
}

@Component({
  selector: 'app-manage-people',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    TagModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div
            class="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"
          >
            <i class="pi pi-users text-white text-xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Staff Members</h1>
            <p class="text-gray-600 mt-1">
              Manage staff user accounts and access
            </p>
          </div>
        </div>
        <p-button
          label="Add People"
          icon="pi pi-plus"
          styleClass="p-button-success"
          (onClick)="showAddDialog()"
        ></p-button>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <p-table
          [value]="staffMembers"
          [loading]="loading"
          styleClass="p-datatable-sm"
          [scrollable]="true"
          scrollHeight="600px"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 50%">EMAIL ADDRESS</th>
              <th style="width: 25%">STATUS</th>
              <th style="width: 25%" class="text-center">ACTION</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-member>
            <tr>
              <td>
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                  >
                    <i class="pi pi-user text-blue-600 text-sm"></i>
                  </div>
                  <span class="font-medium text-gray-900">{{
                    member.email
                  }}</span>
                </div>
              </td>
              <td>
                <p-tag
                  [value]="member.status"
                  [severity]="
                    member.status === 'Active' ? 'success' : 'warning'
                  "
                ></p-tag>
              </td>
              <td class="text-center">
                <p-button
                  label="Delete"
                  icon="pi pi-trash"
                  styleClass="p-button-danger p-button-sm"
                  (onClick)="confirmDelete(member)"
                ></p-button>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="3" class="text-center py-8">
                <div class="text-gray-500">
                  <i class="pi pi-users text-4xl mb-4 block"></i>
                  <p class="text-lg font-medium">No staff members yet</p>
                  <p class="text-sm">Start by adding your first staff member</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="Add Staff Member"
      [(visible)]="displayAddDialog"
      [modal]="true"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="p-fluid"
      [style]="{ width: '450px' }"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            pInputText
            [(ngModel)]="newUserEmail"
            placeholder="Enter email address"
            class="w-full"
            [class.ng-invalid]="emailError"
          />
          <small *ngIf="emailError" class="text-red-600 mt-1 block">
            {{ emailError }}
          </small>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end space-x-2">
          <p-button
            label="Cancel"
            icon="pi pi-times"
            styleClass="p-button-danger p-button-sm"
            (onClick)="hideAddDialog()"
          ></p-button>
          <p-button
            label="Save"
            icon="pi pi-check"
            styleClass="p-button-success  p-button-sm"
            (onClick)="addStaffMember()"
            [disabled]="!isValidEmail(newUserEmail)"
            [loading]="adding"
          ></p-button>
        </div>
      </ng-template>
    </p-dialog>

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

        .p-datatable .p-datatable-tbody > tr > td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .p-datatable .p-datatable-tbody > tr:hover {
          background-color: #f9fafb;
        }

        .p-tag.p-tag-success {
          background: #c8fcdbd5;
          color: #2fe271ff;
        }

        .p-tag.p-tag-warning {
          background: #fbedc9ff;
          color: #eab208ff;
        }

        .p-button-success {
          background: #16a34a;
          border-color: #16a34a;
        }

        .p-button-success:hover {
          background: #15803d;
          border-color: #15803d;
        }

        .p-button-danger {
          background: #dc2626;
          border-color: #dc2626;
        }

        .p-button-danger:hover {
          background: #b91c1c;
          border-color: #b91c1c;
        }

        .p-dialog {
          border-radius: 12px;
          overflow: hidden;
        }

        .p-dialog .p-dialog-header {
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }
      }
    `,
  ],
})
export class ManagePeopleComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  staffMembers: StaffMember[] = [];
  loading = false;
  adding = false;

  displayAddDialog = false;
  newUserEmail = '';
  emailError = '';

  ngOnInit() {
    this.loadStaffMembers();
  }

  loadStaffMembers() {
    this.loading = true;

    setTimeout(() => {
      this.staffMembers = [
        {
          id: '1',
          email: 'john.doe@company.com',
          status: 'Active',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          email: 'jane.smith@company.com',
          status: 'Pending',
          createdAt: new Date('2024-01-20'),
        },
        {
          id: '3',
          email: 'mike.wilson@company.com',
          status: 'Active',
          createdAt: new Date('2024-01-25'),
        },
      ];
      this.loading = false;
    }, 1000);
  }

  showAddDialog() {
    this.displayAddDialog = true;
    this.newUserEmail = '';
    this.emailError = '';
  }

  hideAddDialog() {
    this.displayAddDialog = false;
    this.newUserEmail = '';
    this.emailError = '';
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  addStaffMember() {
    if (!this.isValidEmail(this.newUserEmail)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    if (
      this.staffMembers.some((member) => member.email === this.newUserEmail)
    ) {
      this.emailError = 'This email is already registered';
      return;
    }

    this.adding = true;
    this.emailError = '';

    setTimeout(() => {
      const newMember: StaffMember = {
        id: Date.now().toString(),
        email: this.newUserEmail,
        status: 'Pending',
        createdAt: new Date(),
      };

      this.staffMembers = [...this.staffMembers, newMember];
      this.staffMembers.sort((a, b) => a.email.localeCompare(b.email));

      this.adding = false;
      this.hideAddDialog();

      this.notificationService.success('User added successfully');
    }, 1500);
  }

  confirmDelete(member: StaffMember) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${member.email}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteStaffMember(member.id);
      },
    });
  }

  deleteStaffMember(id: string) {
    setTimeout(() => {
      this.staffMembers = this.staffMembers.filter(
        (member) => member.id !== id
      );
      this.notificationService.success('User deleted successfully');
    }, 500);
  }
}
