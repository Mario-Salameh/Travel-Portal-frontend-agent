import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { authAdminsPost } from "../data/functions";
import { AppService } from "../core/services/app";
import { DialogService } from "../core/services/dialog";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthorizationRepository {
    apiService = inject(Api)
    router = inject(Router)
    dialogService = inject(DialogService)
    appService = inject(AppService)

    get officeName(): string {
        return localStorage.getItem('OfficeName')!;
    }

    get userName(): string {
        return localStorage.getItem('UserName')!;
    }

    get cashAccount(): string {
        return localStorage.getItem('CashAccount')!;
    }

    get role(): number {
        return parseInt(localStorage.getItem('Role')!);
    }

    get isAuthenticated(): boolean {
        const token = localStorage.getItem('Token');
        const expiration = localStorage.getItem('Expiration');

        if (!(token && expiration))
            return false

        return new Date(expiration) > new Date();
    }

    async login(username: string, password: string): Promise<void> {
        this.appService.isLoading.set("Logging in...");

        const response = await this.apiService.invoke(authAdminsPost, { body: { username: username, password: password } });

        localStorage.setItem('UserName', response!.username!);
        localStorage.setItem('Role', response!.role!.toString());
        localStorage.setItem('CashAccount', response!.cashAccount!);

        localStorage.setItem('Token', response!.token!);
        localStorage.setItem('Expiration', response!.expiresAt!);
        localStorage.setItem('OfficeName', response!.officename!);

        this.appService.isLoading.set(null);
        this.goToSuitablePage()
    }

    goToSuitablePage(): void {
        if (this.role === 0)
            this.router.navigate(['/control-panel'])
        else
            this.router.navigate(['/home']);
    }

    async logout(): Promise<void> {
        localStorage.clear();
        this.appService.resetDashboardState();
    }
}
