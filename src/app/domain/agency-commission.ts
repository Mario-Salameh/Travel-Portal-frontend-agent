import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { agenciesCommissionBrokerCodeDelete, agenciesCommissionGet, agenciesCommissionPost, agenciesCommissionPut } from "../data/functions";
import { CreateAgencyCommissionRequest, UpdateAgencyCommissionRequest, ViewAgencyCommission } from "../data/models";

@Injectable({
    providedIn: 'root'
})
export class AgencyCommissionRepository {
    apiService = inject(Api);

    public async getAgencyCommissions(): Promise<ViewAgencyCommission[]> {
        const response = await this.apiService.invoke(agenciesCommissionGet, {});
        return response;
    }

    public async postAgencyCommission(data: CreateAgencyCommissionRequest): Promise<void> {
        await this.apiService.invoke(agenciesCommissionPost, {
            body: data
        });
    }

    public async updateAgencyCommission(data: UpdateAgencyCommissionRequest): Promise<void> {
        await this.apiService.invoke(agenciesCommissionPut, {
            body: data
        });
    }

    public async deleteAgencyCommission(brokerCode: string): Promise<void> {
        await this.apiService.invoke(agenciesCommissionBrokerCodeDelete, {
            brokerCode: brokerCode
        });
    }
}