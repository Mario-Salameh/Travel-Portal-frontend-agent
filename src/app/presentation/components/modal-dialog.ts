import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalType = 'error' | 'success' | 'warning' | 'info';

@Component({
  selector: 'app-modal-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-icon" [ngClass]="type">
            <!-- Error Icon -->
            <svg *ngIf="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <!-- Success Icon -->
            <svg *ngIf="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <!-- Warning Icon -->
            <svg *ngIf="type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <!-- Info Icon -->
            <svg *ngIf="type === 'info'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
        </div>
        <div class="modal-body" *ngIf="title">
          <h3 *ngIf="title" class="modal-title">{{ title }}</h3>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        <div class="modal-footer">
          <button class="modal-button" (click)="close()">{{ buttonText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background-color: var(--surface-color, #ffffff);
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .modal-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-icon.error {
      background-color: #fef2f2;
      color: #ef4444;
    }

    .modal-icon.success {
      background-color: #f0fdf4;
      color: #22c55e;
    }

    .modal-icon.warning {
      background-color: #fffbeb;
      color: #f59e0b;
    }

    .modal-icon.info {
      background-color: #eff6ff;
      color: #3b82f6;
    }

    .modal-body {
      text-align: center;
      color: var(--text-color, #1f2937);
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .modal-body p {
      margin: 0 0 12px 0;
      line-height: 1.5;
    }

    .modal-body p:last-child {
      margin-bottom: 0;
    }

    .modal-footer {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }

    .modal-button {
      padding: 10px 32px;
      font-size: 1rem;
      font-weight: 500;
      color: #ffffff;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .modal-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    :host-context(.dark-theme) .modal-content {
      background-color: #1f2937;
    }

    :host-context(.dark-theme) .modal-body {
      color: #f9fafb;
    }

    :host-context(.dark-theme) .modal-icon.error {
      background-color: rgba(239, 68, 68, 0.2);
    }

    :host-context(.dark-theme) .modal-icon.success {
      background-color: rgba(34, 197, 94, 0.2);
    }

    :host-context(.dark-theme) .modal-icon.warning {
      background-color: rgba(245, 158, 11, 0.2);
    }

    :host-context(.dark-theme) .modal-icon.info {
      background-color: rgba(59, 130, 246, 0.2);
    }
  `]
})
export class ModalDialog {
  @Input() isOpen: boolean = false;
  @Input() type: ModalType = 'info';
  @Input() title: string = '';
  @Input() buttonText: string = 'OK';
  @Input() closeOnOverlayClick: boolean = true;

  @Output() closed = new EventEmitter<void>();

  onOverlayClick(): void {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }
}
