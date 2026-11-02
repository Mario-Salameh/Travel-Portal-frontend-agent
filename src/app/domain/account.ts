import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { accountsAccountCodeDelete, accountsGet, accountsPost, accountsPut, authAdminsPost } from "../data/functions";
import { CreateAccountRequest, UpdateAccountRequest, ViewAccount } from "../data/models";

@Injectable({
    providedIn: 'root'
})
export class AccountRepository {
    apiService = inject(Api);

    public async getAccounts(accountCode?: string): Promise<ViewAccount[]> {
        const response = await this.apiService.invoke(accountsGet, {
            accountCode: accountCode
        })
        return response;
    }

    public async addAccount(data: CreateAccountRequest): Promise<void> {
        await this.apiService.invoke(accountsPost, { body: data })
    }

    public async updateAccount(data: UpdateAccountRequest): Promise<void> {
        await this.apiService.invoke(accountsPut, {
            body: data
        })
    }

    public async deleteCurrencyRate(accountCode: string): Promise<void> {
        await this.apiService.invoke(accountsAccountCodeDelete, {
            accountCode: accountCode
        })
    }
}