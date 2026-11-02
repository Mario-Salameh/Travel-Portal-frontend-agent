import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from '../../../core/services/dialog';
import { AuthorizationRepository } from '../../../domain/authorization';
import { AppService } from '../../../core/services/app';
import { Api } from '../../../data/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class Login {
  fb = inject(FormBuilder)
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  router = inject(Router)
  dialogService = inject(DialogService)
  authorizationRepository = inject(AuthorizationRepository)
  appService = inject(AppService)
  apiService = inject(Api)

  constructor() {
    if (this.authorizationRepository.isAuthenticated)
      this.router.navigate(['/home']);
  }

  toggleTheme(): void {
    this.appService.toggleTheme();
  }

  toggleLanguage(): void {
    this.appService.toggleLanguage();
  }

  async onLogin(): Promise<void> {
    await this.authorizationRepository.login(this.loginForm.value.username!, this.loginForm.value.password!)
  }

  showInfo(): void {
    this.dialogService.openDialog("This project is currently under development. All displayed interfaces are subject to modification and improvement. If you have any suggestions or feedback, please feel free to contact<br><strong>Mario Salameh, Aws Qandah<br>or Ammar Alshammari</strong>.<br><br>The website is continuously being updated, and the last modification date is displayed on the interface for your reference.", 'info');
  }
}