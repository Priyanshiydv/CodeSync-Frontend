import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  unreadCount = 0;
  isOpen = false;
  loading = false;
  private pollingSubscription?: Subscription;
  private clickOutsideListener: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadUnreadCount();
    this.startPolling();
    this.setupClickOutsideListener();
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
    document.removeEventListener('click', this.clickOutsideListener);
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (res: any) => this.unreadCount = res.unreadCount || 0,
      error: () => this.unreadCount = 0
    });
  }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getMyNotifications().subscribe({
      next: (res: any[]) => {
        this.notifications = res.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      error: () => {
        this.notifications = [];
        this.loading = false;
      }
    });
  }

  startPolling() {
    this.pollingSubscription = interval(30000)
      .pipe(switchMap(() => this.notificationService.getUnreadCount()))
      .subscribe({
        next: (res: any) => this.unreadCount = res.unreadCount || 0
      });
  }

  setupClickOutsideListener() {
    this.clickOutsideListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-wrapper')) {
        this.isOpen = false;
      }
    };
    document.addEventListener('click', this.clickOutsideListener);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  handleNotificationClick(notification: any) {
    if (!notification.isRead) {
      this.markAsRead(notification.notificationId);
    }
    
    if (notification.relatedId && notification.relatedType) {
      // Handle navigation based on type
      console.log('Navigate to:', notification.relatedType, notification.relatedId);
    }
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.notificationId === notificationId);
        if (notification) {
          notification.isRead = true;
        }
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      }
    });
  }

  deleteNotification(notificationId: number) {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        const index = this.notifications.findIndex(n => n.notificationId === notificationId);
        if (index > -1) {
          if (!this.notifications[index].isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.notifications.splice(index, 1);
        }
      }
    });
  }

  clearRead() {
    this.notificationService.clearRead().subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => !n.isRead);
      }
    });
  }

  getNotificationIcon(type: string): string {
    const icons: any = {
      'SESSION_INVITE': '🔴',
      'COMMENT': '💬',
      'MENTION': '@',
      'SNAPSHOT': '📸',
      'FORK': '🍴',
      'BROADCAST': '📢',
      'SYSTEM': '⚙️'
    };
    return icons[type] || '🔔';
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  }
}