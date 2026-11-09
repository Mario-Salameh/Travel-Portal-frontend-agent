
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, MessageType } from '../../../core/services/dialog';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.html',
  styles: `
    .toast {
        animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(30%);
        }

        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .confirmation-backdrop {
      z-index: 10000;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.58);
      backdrop-filter: blur(3px);
    }

    .confirmation-content {
      overflow: hidden;
      border: 0;
      border-radius: 1rem;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
    }

    .confirmation-body {
      padding: 2rem 2rem 1.25rem;
    }

    .confirmation-icon {
      display: grid;
      place-items: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      font-size: 1.6rem;
    }

    .confirmation-icon--danger {
      color: #b42318;
      background: #fee4e2;
    }

    .confirmation-icon--primary {
      color: #175cd3;
      background: #eaf2ff;
    }

    .confirmation-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      padding: 0 2rem 2rem;
    }

    .confirmation-actions .btn {
      min-height: 44px;
      margin: 0;
    }

    @media (max-width: 420px) {
      .confirmation-body {
        padding: 1.5rem 1.25rem 1rem;
      }

      .confirmation-actions {
        grid-template-columns: 1fr;
        padding: 0 1.25rem 1.5rem;
      }
    }
  `
})
export class DialogComponent {
  dialogService = inject(DialogService);
  toasts$ = this.dialogService.getToasts();
  confirmation$ = this.dialogService.getConfirmation();

  close(id: number) {
    this.dialogService.remove(id);
  }

  pause(id: number) {
    this.dialogService.pause(id);
  }

  resume(id: number) {
    this.dialogService.resume(id);
  }

  resolveConfirmation(confirmed: boolean): void {
    this.dialogService.resolveConfirmation(confirmed);
  }

  getConfirmButtonClass(type: 'danger' | 'primary'): string {
    return type === 'danger' ? 'btn-danger' : 'btn-primary';
  }

  getClass(type: MessageType) {
    return {
      error: 'bg-danger text-white',
      success: 'bg-success text-white',
      warning: 'bg-warning text-dark',
      info: 'bg-info text-white',
    }[type];
  }
}
