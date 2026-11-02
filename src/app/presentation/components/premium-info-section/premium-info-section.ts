import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-premium-info-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-info-section.html',
  styleUrls: ['./premium-info-section.css']
})
export class PremiumInfoSection {
  @Input() title: string = '';
  @Input() icon: string = '';

  get iconPath(): string {
    return `/icons/${this.icon}`;
  }
}
