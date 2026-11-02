import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-offices-text-field',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],

    // CSS Code Here
    styles: [`
    
  `],
    // Html Code Here
    template: `

  `,
})
export class OfficesTextField {
    formControlName = input.required();
}
