import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { CreateOfficeRequest, SelectMenuRecord, UpdateOfficeRequest, ViewOffice } from "../data/models";
import { officesGet, officesOfficeIdDelete, officesOfficeIdPut, officesPost, officesRecordsGet } from "../data/functions";

@Injectable({
    providedIn: 'root'
})
export class OfficeRepository {
    apiService = inject(Api)

    public async GetAllOffices(): Promise<ViewOffice[]> {
        const response = await this.apiService.invoke(officesGet, {})
        return response.sort((a, b) => (a.nameInEnglish ?? '').localeCompare(b.nameInEnglish ?? ''));
    }

    public async GetOfficesAsRecords(): Promise<SelectMenuRecord[]> {
        const response = await this.apiService.invoke(officesRecordsGet, {})
        const sorted = response.sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''));
        return [{ code: '', label: '' }, ...sorted];
    }

    public async SaveOffice(data: CreateOfficeRequest): Promise<void> {
        await this.apiService.invoke(officesPost, {
            body: data
        })
    }

    public async UpdateOffice(data: UpdateOfficeRequest, officeId: string): Promise<void> {
        await this.apiService.invoke(officesOfficeIdPut, {
            body: data,
            officeId: officeId
        })
    }

    public async DeleteOffice(officeId: string): Promise<void> {
        await this.apiService.invoke(officesOfficeIdDelete, {
            officeId: officeId
        })
    }
}