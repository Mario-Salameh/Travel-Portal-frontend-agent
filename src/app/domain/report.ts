import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { reportsAgentReportGet } from "../data/functions";
import { ProductionReportType } from "../data/models/production-report-type";
import { AppService } from "../core/services/app";
import { DialogService } from "../core/services/dialog";

@Injectable({
    providedIn: 'root'
})
export class ReportRepository {
    apiService = inject(Api)
    appService = inject(AppService)
    dialogService = inject(DialogService)

    public async GetReport(
        productionReportType: ProductionReportType,
        fileName: string,
        dateFrom: string,
        dateTo: string,
        officeId?: string
    ): Promise<boolean> {
        this.appService.isLoading.set('Generating report...');

        try {
            const response = await this.apiService.invoke(reportsAgentReportGet, {
                DateFrom: dateFrom,
                DateTo: dateTo,
                productionReportType,
                officeId
            });

            const a = document.createElement('a');
            a.href = URL.createObjectURL(response);
            a.download = fileName;
            a.click();

            this.dialogService.openDialog('Report generated and downloaded successfully', 'success');
            this.appService.isLoading.set(null);
            return true;
        }
        catch (error) {
            this.appService.isLoading.set(null);
            return false;
        }
    }
}
