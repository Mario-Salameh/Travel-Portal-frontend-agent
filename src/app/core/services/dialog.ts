// dialog.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type MessageType = 'error' | 'success' | 'warning' | 'info';

export interface DialogData {
    active: boolean;
    message?: string;
    messageType?: MessageType;
}

export interface ToastData {
    id: number;
    message: string;
    messageType: MessageType;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
    private toasts$ = new BehaviorSubject<ToastData[]>([]);
    private id = 0;
    private timers = new Map<number, ReturnType<typeof setTimeout>>();
    private duration = 3000;

    getToasts() {
        return this.toasts$.asObservable();
    }

    openDialog(message: string, type: MessageType = 'info') {
        const toast: ToastData = {
            id: ++this.id,
            message,
            messageType: type
        };

        this.toasts$.next([...this.toasts$.value, toast]);
        this.startTimer(toast.id);
    }

    pause(id: number) {
        this.clearTimer(id);
    }

    resume(id: number) {
        this.startTimer(id);
    }

    remove(id: number) {
        this.toasts$.next(
            this.toasts$.value.filter(t => t.id !== id)
        );
    }

    private startTimer(id: number) {
        this.clearTimer(id);
        this.timers.set(
            id,
            setTimeout(() => this.remove(id), this.duration)
        );
    }

    private clearTimer(id: number) {
        const timer = this.timers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(id);
        }
    }
}
