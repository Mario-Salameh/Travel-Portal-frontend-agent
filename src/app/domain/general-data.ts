import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { generalCountriesGet, periodsGet, typesOfCoverageGet } from "../data/functions";
import { Country, PeriodResponseDto, ViewTypeOfCoverage } from "../data/models";

@Injectable({
    providedIn: 'root'
})
export class GeneralDataRepository {
    apiService = inject(Api);

    countries?: Country[];
    periods = new Map<number, PeriodResponseDto[]>();
    typesOfCoverage = new Map<number, ViewTypeOfCoverage[]>();

    async getCountries(): Promise<Country[] | void> {
        if (this.countries) return this.countries;

        const response = await this.apiService.invoke$Response(generalCountriesGet);
        if (response.status === 200) {
            const sortedCountries = response.body.sort((a, b) => {
                if (a.nameInEnglish! < b.nameInEnglish!) return -1;
                if (a.nameInEnglish! > b.nameInEnglish!) return 1;
                return 0;
            });

            sortedCountries.forEach(country => {
                if (country.nameInEnglish) {
                    country.nameInEnglish = country.nameInEnglish.charAt(0).toUpperCase() + country.nameInEnglish.slice(1).toLowerCase();
                }
            });

            return sortedCountries;
        }
    }

    async getPeriods(planType: number): Promise<PeriodResponseDto[] | void> {
        if (this.periods.has(planType)) return this.periods.get(planType);

        const response = await this.apiService.invoke$Response(periodsGet, { atrType: planType });
        if (response.status === 200) {
            const sortedPeriods = response.body.sort((a, b) => parseInt(a.periodId!) - parseInt(b.periodId!));
            return sortedPeriods;
        }
    }

    async getTypesOfCoverage(planType: number): Promise<ViewTypeOfCoverage[] | void> {
        if (this.typesOfCoverage.has(planType)) return this.typesOfCoverage.get(planType);

        const response = await this.apiService.invoke(typesOfCoverageGet, { planType: planType });
        return response
    }
}