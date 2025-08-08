import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { take } from 'rxjs/operators';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  get notifications() {
    return this.notifications$.asObservable();
  }

  show(notification: Omit<Notification, 'id'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 3000,
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, newNotification]);

    if (newNotification.autoClose) {
      timer(newNotification.duration!)
        .pipe(take(1))
        .subscribe(() => {
          this.remove(newNotification.id);
        });
    }
  }

  success(message: string, duration?: number): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration?: number): void {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration?: number): void {
    this.show({ type: 'info', message, duration });
  }

  remove(id: string): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter((n) => n.id !== id));
  }

  clear(): void {
    this.notifications$.next([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
