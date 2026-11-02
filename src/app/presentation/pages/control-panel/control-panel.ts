import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../../core/services/app';
import { AuthorizationRepository } from '../../../domain/authorization';
import { Router } from '@angular/router';
import { DialogService } from '../../../core/services/dialog';
import { CompanyInfo } from '../../../data/models';
import { CompaniesRepository } from '../../../domain/companies';

@Component({
  selector: 'app-control-panel',
  imports: [FormsModule],
  templateUrl: './control-panel.html',
})
export class ControlPanel {
  router = inject(Router);
  authRepository = inject(AuthorizationRepository)
  appService = inject(AppService);
  dialogService = inject(DialogService)
  companiesRepo = inject(CompaniesRepository)

  // Declare a test array that contains a test data with type CompanyInfo
  companies!: CompanyInfo[];

  async ngOnInit(): Promise<void> {
    await this.showCompanies();
  }

  async showCompanies(): Promise<void> {
    this.appService.isLoading.set("Loading companies...");
    this.companies = await this.companiesRepo.getCompaniesInfo();
    this.appService.isLoading.set(null);
  }

  async updateCompanyInfo(
    // this is the main id that we will get the right company through it
    // it is like the primary key for the company
    companyGroupId: number,

    // those are the fields that we can update through the function
    isEnabled: boolean,
    existingCustomerManagementFeesPercent: number,
    newCustomerManagementFeesPercent: number

  ): Promise<void> {
    this.appService.isLoading.set("Updating company info...");

    await this.companiesRepo.updateCompanyInfo({
      companyGroupId,
      isEnabled,
      existingCustomerManagementFeesPercent,
      newCustomerManagementFeesPercent
    });

    this.appService.isLoading.set(null);
    this.dialogService.openDialog("Company info updated successfully.", "success");
    await this.showCompanies();
  }

  logout(): void {
    this.authRepository.logout()
    this.appService.selectedTabIndex.set(0);
    this.router.navigate(['/login']);
  }
}