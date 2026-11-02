
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
  `
})
export class DialogComponent {
  dialogService = inject(DialogService);
  toasts$ = this.dialogService.getToasts();

  close(id: number) {
    this.dialogService.remove(id);
  }

  pause(id: number) {
    this.dialogService.pause(id);
  }

  resume(id: number) {
    this.dialogService.resume(id);
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
