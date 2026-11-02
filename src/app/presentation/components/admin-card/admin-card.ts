import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-card.html',
  styles: [`
    .admin-card-hover {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }
    .admin-card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }
  `]
})
export class AdminCard {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() id?: number;
  @Input() iconColor: string = '';
  @Output() cardClick = new EventEmitter<number>();

  onCardClick(): void {
    this.cardClick.emit(this.id);
  }
}
