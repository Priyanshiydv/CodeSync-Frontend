import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle-btn" (click)="toggleTheme()">
      <span *ngIf="!isDarkMode">🌙</span>
      <span *ngIf="isDarkMode">☀️</span>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: var(--text-secondary);
    }
    .theme-toggle-btn:hover {
      background: var(--primary-bg);
      border-color: var(--primary);
      transform: scale(1.05);
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode = true;

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isDarkMode = false;
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      this.isDarkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }
}