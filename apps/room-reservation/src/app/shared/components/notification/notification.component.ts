import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import {
  NotificationService,
  Notification,
} from '@/shared/services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  template: `
    <div
      class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-2"
    >
      <div
        *ngFor="let notification of notifications; trackBy: trackByFn"
        [@slideIn]
        class="min-w-96 max-w-md mx-auto rounded-lg shadow-lg overflow-hidden"
        [class]="getNotificationClass(notification)"
      >
        <div class="p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <i [class]="getIconClass(notification)" class="text-lg"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ notification.message }}</p>
            </div>
          </div>
          <button
            (click)="remove(notification.id)"
            class="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-black/10 transition-colors"
            type="button"
          >
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'translateY(-100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class NotificationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  remove(id: string) {
    this.notificationService.remove(id);
  }

  trackByFn(index: number, item: Notification) {
    return item.id;
  }

  getNotificationClass(notification: Notification): string {
    const baseClasses = 'border-l-4';

    switch (notification.type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-400 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-400 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-400 text-gray-800`;
    }
  }

  getIconClass(notification: Notification): string {
    switch (notification.type) {
      case 'success':
        return 'pi pi-check-circle text-green-600';
      case 'error':
        return 'pi pi-times-circle text-red-600';
      case 'warning':
        return 'pi pi-exclamation-triangle text-yellow-600';
      case 'info':
        return 'pi pi-info-circle text-blue-600';
      default:
        return 'pi pi-info-circle text-gray-600';
    }
  }
}
