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
    const confirmed = await this.dialogService.confirm({
      title: 'Delete draft policies?',
      message: 'This will permanently delete all draft policies created up to yesterday.',
      confirmText: 'Delete drafts',
      tone: 'danger',
    });

    if (!confirmed) return;

    await this.policyRespository.deleteDraftPolicies();
    this.dialogService.openDialog('Draft policies (up to yesterday) deleted successfully!', 'success');
  }

  async exportCurrentInsuredClients(): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Export current insured clients?',
      message: 'The report will be generated using policy inception and expiry dates.',
      confirmText: 'Export report',
      tone: 'primary',
    });

    if (!confirmed) return;

    this.appService.isLoading.set('Building Current Insured Clients Report...');
    try {
      await this.policyRespository.exportCurrentInsuredClients();
    } finally {
      this.appService.isLoading.set(null);
    }
  }
}
