import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { companiesGet, companiesPut } from "../data/functions";
import { CompanyInfo, UpdateCompanyRequest } from "../data/models";

@Injectable({
    providedIn: 'root'
})
export class CompaniesRepository {
    apiService = inject(Api);

    async getCompaniesInfo(): Promise<CompanyInfo[]> {
        const response = await this.apiService.invoke(companiesGet)
        return response;
    }

    async updateCompanyInfo(
        data: UpdateCompanyRequest
    ): Promise<void> {
        await this.apiService.invoke(companiesPut, { body: data })
    }
}