import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogComponent } from "./presentation/components/dialog/dialog";
import { LogoLoadingBlur } from "./presentation/components/logo-loading-blur/logo-loading-blur";
import { AppService } from './core/services/app';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DialogComponent, LogoLoadingBlur],
  templateUrl: './app.html',
  styleUrls: ['../styles.css']
})
export class App {
  appService = inject(AppService);
}
