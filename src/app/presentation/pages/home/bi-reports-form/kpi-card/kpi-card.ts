import { Component, Input, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

const PALETTE = ['#C0390A', '#D95A0A', '#E87A20', '#F0A800', '#F5C800', '#7B1A1A', '#9B2A10', '#FFAA00'];

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.html',
})
export class KpiCard {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string;
  @Input({ required: true }) change!: string;
  @Input({ required: true }) icon!: string;
  @Input() up = true;
  @Input() index = 0;

  get color(): string {
    return PALETTE[this.index % PALETTE.length];
  }

  get bgColor(): string {
    const hex = this.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},0.09)`;
  }
}
