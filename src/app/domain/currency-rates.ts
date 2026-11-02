import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { currencyRatesCrrIdDelete, currencyRatesGet, currencyRatesPost } from "../data/functions";
import { CreateCurrencyRateDto, CurrencyRateViewDto } from "../data/models";

@Injectable({
    providedIn: 'root'
})
export class CurrencyRatesRespository {
    apiService = inject(Api)

    public async addCurrencyRate(data: CreateCurrencyRateDto): Promise<CurrencyRateViewDto> {
        const response = await this.apiService.invoke(currencyRatesPost, { cgpId: 8, body: data })
        return response;
    }

    public async getCurrencyRates(): Promise<CurrencyRateViewDto[]> {
        const response = await this.apiService.invoke(currencyRatesGet, { cgpId: 8 })
        return response;
    }

    public async deleteCurrencyRate(rateId: number): Promise<void> {
        ;
        await this.apiService.invoke(currencyRatesCrrIdDelete, { crrId: rateId, cgpId: 8 })
    }
}