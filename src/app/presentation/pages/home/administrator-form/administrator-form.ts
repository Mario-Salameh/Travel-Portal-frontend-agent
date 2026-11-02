import { Component, inject, output } from '@angular/core';
import { AdminCard } from '../../../components/admin-card/admin-card';
import { PolicyRepository } from '../../../../domain/policy';
import { DialogService } from '../../../../core/services/dialog';
import { AppService } from '../../../../core/services/app';

@Component({
  selector: 'app-administrator-form',
  imports: [AdminCard],
  templateUrl: './administrator-form.html',
})
export class AdministratorForm {
  goToAdministratorTab = output<number>();
  policyRespository = inject(PolicyRepository)
  dialogService = inject(DialogService)
  appService = inject(AppService)

  handleCardClick(cardId: number): void {
    this.goToAdministratorTab.emit(100 + cardId);
  }

  async deleteDraftPolicies(): Promise<void> {
    if (confirm("Are you sure you want to delete draft policies up to yesterday?")) {
      await this.policyRespository.deleteDraftPolicies();

      this.dialogService.openDialog("Draft policies (up to yesterday) deleted successfully!", "success")
    }
  }

  async exportCurrentInsuredClients(): Promise<void> {
    if (confirm("Are you sure you want to export current insured clients?\n(Based on Inception and Expiry dates)")) {

      this.appService.isLoading.set("Building Current Insured Clients Report...")

      await this.policyRespository.exportCurrentInsuredClients();
      this.appService.isLoading.set(null)
    }
  }
}
