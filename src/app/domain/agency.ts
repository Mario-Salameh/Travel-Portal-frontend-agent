import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { CreateAgencyRequest, UpdateAgencyRequest, ViewAgency } from "../data/models";
import { agenciesAgencyCodeDelete, agenciesAgencyCodePut, agenciesGet, agenciesPost } from "../data/functions";

@Injectable({
    providedIn: 'root'
})
export class AgencyRepository {
    apiService = inject(Api)

    public async GetAllAgencies(): Promise<ViewAgency[]> {
        const response = await this.apiService.invoke(agenciesGet, {})
        return response.sort((a, b) => b.agencyCode! - a.agencyCode!)
    }

    public async SaveAgency(data: CreateAgencyRequest): Promise<void> {
        await this.apiService.invoke(agenciesPost, {
            body: data
        })
    }

    public async UpdateAgency(data: UpdateAgencyRequest, agencyCode: string): Promise<void> {
        await this.apiService.invoke(agenciesAgencyCodePut, {
            agencyCode,
            body: data
        })
    }

    public async DeleteAgency(agencyCode: string): Promise<void> {
        await this.apiService.invoke(agenciesAgencyCodeDelete, {
            agencyCode
        })
    }
}