import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { filter } from 'rxjs/operators';

import { AuthUser } from '@/models/auth.model';
import { UserRole } from '@/models/user.model';

interface TabItem {
  label: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, ButtonModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="h-16 flex items-center justify-between px-6">
        <div class="flex items-center space-x-3">
          <div
            class="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md"
          >
            <i class="pi pi-home text-white text-lg"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">BookedIn</h1>
            <p class="text-xs text-gray-500 -mt-0.5">Meeting Management</p>
          </div>
        </div>

        <div class="hidden md:flex items-center space-x-2" *ngIf="user">
          <button
            *ngFor="let tab of getTabsForUser()"
            class="px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
            [class]="getTabClass(tab)"
            (click)="navigateToTab(tab)"
            type="button"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="flex items-center space-x-4">
          <div
            class="hidden lg:flex items-center space-x-3 text-right"
            *ngIf="user"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ user.email }}</p>
              <div class="flex items-center justify-end mt-0.5">
                <span
                  class="px-2 py-0.5 text-xs font-semibold rounded-full"
                  [class]="getRoleBadgeClass(user.role)"
                >
                  {{ getRoleDisplayName(user.role) }}
                </span>
              </div>
            </div>
            <div
              class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <i class="pi pi-user text-blue-600 text-sm"></i>
            </div>
          </div>

          <button
            class="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            (click)="logout.emit()"
            type="button"
          >
            <i class="pi pi-sign-out mr-2"></i>
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div class="md:hidden border-t border-gray-100 px-4 py-3" *ngIf="user">
        <div class="flex space-x-1 overflow-x-auto">
          <button
            *ngFor="let tab of getTabsForUser()"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            [class]="getTabClass(tab)"
            (click)="navigateToTab(tab)"
            type="button"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      /* Tab Styles */
      .tab-active {
        background-color: #3b82f6;
        color: white;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      }

      .tab-inactive {
        background-color: #f1f5f9;
        color: #64748b;
      }

      .tab-inactive:hover {
        background-color: #e2e8f0;
        color: #334155;
      }

      /* Badge Styles */
      .badge-admin {
        background-color: #fecaca;
        color: #dc2626;
      }

      .badge-staff {
        background-color: #bfdbfe;
        color: #2563eb;
      }

      /* Focus styles */
      button:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      /* Mobile overflow scroll */
      .overflow-x-auto::-webkit-scrollbar {
        height: 4px;
      }

      .overflow-x-auto::-webkit-scrollbar-track {
        background: #f1f5f9;
      }

      .overflow-x-auto::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 2px;
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  @Input() user: AuthUser | null = null;
  @Output() logout = new EventEmitter<void>();

  private router = inject(Router);
  currentRoute = '';

  private adminTabs: TabItem[] = [
    {
      label: 'Manage People',
      route: '/admin/manage-people',
      roles: [UserRole.ADMIN],
    },
    {
      label: 'Manage Rooms',
      route: '/admin/manage-rooms',
      roles: [UserRole.ADMIN],
    },
    {
      label: 'Requests',
      route: '/admin/manage-requests',
      roles: [UserRole.ADMIN],
    },
  ];

  private staffTabs: TabItem[] = [
    {
      label: 'Calendar',
      route: '/dashboard/calendar',
      roles: [UserRole.STAFF],
    },
    {
      label: 'My Bookings',
      route: '/dashboard/my-bookings',
      roles: [UserRole.STAFF],
    },
  ];

  ngOnInit() {
    this.currentRoute = this.router.url;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  getTabsForUser(): TabItem[] {
    if (!this.user) return [];

    return this.user.role === UserRole.ADMIN ? this.adminTabs : this.staffTabs;
  }

  getTabClass(tab: TabItem): string {
    return this.isActiveTab(tab) ? 'tab-active' : 'tab-inactive';
  }

  isActiveTab(tab: TabItem): boolean {
    return this.currentRoute === tab.route;
  }

  navigateToTab(tab: TabItem): void {
    this.router.navigate([tab.route]);
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.STAFF:
        return 'Staff';
      default:
        return 'User';
    }
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'badge-admin';
      case UserRole.STAFF:
        return 'badge-staff';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }
}
