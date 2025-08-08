import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '@/services/auth.service';
import { AuthUser } from '@/models/auth.model';
import { HeaderComponent } from '@/layout/header/header.component';
import { NotificationComponent } from '@/shared/components/notification/notification.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    NotificationComponent,
    NotificationComponent,
  ],
  template: `
    <app-notifications></app-notifications>

    <div *ngIf="currentUser; else noLayout" class="min-h-screen bg-gray-50">
      <app-header [user]="currentUser" (logout)="onLogout()"></app-header>

      <main class="container mx-auto px-4 py-6">
        <div class="max-w-7xl mx-auto">
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-200px)]"
          >
            <div class="p-6 lg:p-8">
              <router-outlet></router-outlet>
            </div>
          </div>
        </div>
      </main>
    </div>

    <ng-template #noLayout>
      <div class="min-h-screen">
        <router-outlet></router-outlet>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      ::-webkit-scrollbar {
        width: 6px;
      }

      ::-webkit-scrollbar-track {
        background: #f1f5f9;
      }

      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      main {
        min-height: calc(100vh - 120px);
      }

      .container {
        width: 100%;
        max-width: 1200px;
      }

      @media (max-width: 640px) {
        main {
          padding: 1rem;
        }

        .container {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
      }
    `,
  ],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  currentUser: AuthUser | null = null;

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
