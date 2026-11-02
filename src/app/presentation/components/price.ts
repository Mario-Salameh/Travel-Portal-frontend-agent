import { Component, input } from '@angular/core';

@Component({
  selector: 'app-price',
  templateUrl: './price.html',
})
export class Price {
  price = input.required<number>();
  label = input<string>('Premium / U.S $');
}
