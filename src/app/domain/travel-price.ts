import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { travelPricesDelete, travelPricesGet, travelPricesPost, travelPricesPut } from "../data/functions";
import { CreateTravelPriceRequest, UpdateTravelPriceRequest, ViewTravelPrice } from "../data/models";

@Injectable({
    providedIn: 'root'
})
export class TravelPriceRepository {
    apiService = inject(Api);

    public async getTravelPrices(): Promise<ViewTravelPrice[]> {
        const response = await this.apiService.invoke(travelPricesGet, {})
        return response;
    }

    public async addTravelPrice(data: CreateTravelPriceRequest): Promise<void> {
        await this.apiService.invoke(travelPricesPost, { body: data })
    }

    public async updateTravelPrice(
        planType: number, typeOfCoverage: number,
        period: number,
        currentAgeFrom: number,
        currentAgeTo: number,
        data: UpdateTravelPriceRequest
    ): Promise<void> {
        await this.apiService.invoke(travelPricesPut, {
            body: data,
            period: period,
            planType: planType,
            typeOfCoverage: typeOfCoverage,
            currentAgeFrom: currentAgeFrom,
            currentAgeTo: currentAgeTo
        })
    }

    public async deleteTravelPrice(
        planType: number, typeOfCoverage: number,
        period: number,
        AgeFrom: number,
        AgeTo: number
    ) {
        await this.apiService.invoke(travelPricesDelete, {
            period: period,
            planType: planType,
            typeOfCoverage: typeOfCoverage,
            AgeFrom: AgeFrom,
            AgeTo: AgeTo,
        })
    }
}