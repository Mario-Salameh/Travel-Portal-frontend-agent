import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo-loading-blur',
  imports: [],
  templateUrl: './logo-loading-blur.html',
})
export class LogoLoadingBlur {
  message = input.required<string | null>();
}
