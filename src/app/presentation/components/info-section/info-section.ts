import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-section.html',
  styleUrls: ['./info-section.css']
})
export class InfoSection {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() highlight: boolean = false;

  get iconPath(): string {
    return `icons/${this.icon}`;
  }
}
