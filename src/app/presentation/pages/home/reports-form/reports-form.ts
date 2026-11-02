import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../../../core/services/app';
import { DialogService } from '../../../../core/services/dialog';
import { ReportRepository } from '../../../../domain/report';
import { HasRoleDirective } from "../../../../core/directives/has-role-directive";
import { FormTextInput } from '../../../components/form-text-input';
import { OfficeRepository } from '../../../../domain/office';
import { SelectMenuRecord } from '../../../../data/models';
import { ProductionReportType } from '../../../../data/models/production-report-type';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  accentColor: string;
  productionReportType: ProductionReportType;
  fileName: string;
  roles?: number[];
}

@Component({
  selector: 'app-reports-form',
  imports: [CommonModule, HasRoleDirective, ReactiveFormsModule, FormTextInput],
  templateUrl: './reports-form.html',
})
export class ReportsForm implements OnInit {
  appService = inject(AppService);
  dialogService = inject(DialogService);
  reportRepository = inject(ReportRepository);
  officeRepo = inject(OfficeRepository);

  activeReportId = signal<string | null>(null);
  dateFrom = new FormControl('');
  dateTo = new FormControl('');
  officeId = new FormControl('');
  generatingReportId = signal<string | null>(null);

  offices: SelectMenuRecord[] = [];

  async ngOnInit() {
    this.offices = await this.officeRepo.GetOfficesAsRecords();
  }

  reports: ReportCard[] = [
    {
      id: 'reinsurance',
      title: 'Re-Insurance Report',
      description: 'Generate a detailed CSV report of re-insurance data for a selected date range. Includes policy details, coverage amounts, and reinsurance allocations.',
      icon: 'bi-shield-check',
      gradient: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
      accentColor: '#0d6efd',
      productionReportType: 1,
      fileName: 'PRODUCTION RE-INSURANCE.csv',
      roles: [2]
    },
    {
      id: 'policies-full',
      title: 'Policies Report',
      description: 'Export a comprehensive report of all policies within the specified period. Covers individual and group policies with full premium and client details.',
      icon: 'bi-file-earmark-spreadsheet',
      gradient: 'linear-gradient(135deg, #198754 0%, #0dcaf0 100%)',
      accentColor: '#198754',
      productionReportType: 0,
      fileName: 'POLICIES REPORT.csv',
    },
    {
      id: 'customer-portal-fees',
      title: 'Customer Portal Fees Report',
      description: 'Generate a detailed CSV report of customer portal fees for a selected date range. Includes fee details, customer information, and transaction history.',
      icon: 'bi-currency-dollar',
      gradient: 'linear-gradient(135deg, #c2185b 0%, #7b1fa2 100%)',
      accentColor: '#c2185b',
      productionReportType: 2,
      fileName: 'CUSTOMER PORTAL FEES REPORT.csv',
      roles: [2]
    }
  ];

  openReport(reportId: string): void {
    if (this.activeReportId() === reportId) {
      this.activeReportId.set(null);
      this.dateFrom.setValue('');
      this.dateTo.setValue('');
      this.officeId.setValue('');
      return;
    }
    this.activeReportId.set(reportId);
    this.dateFrom.setValue('');
    this.dateTo.setValue('');
    this.officeId.setValue('');
  }

  async generateReport(reportId: string): Promise<void> {
    if (!this.dateFrom.value || !this.dateTo.value) {
      this.dialogService.openDialog('Please select both From and To dates', 'error');
      return;
    }

    if (this.dateFrom.value > this.dateTo.value) {
      this.dialogService.openDialog('From date must be before To date', 'error');
      return;
    }

    this.generatingReportId.set(reportId);

    const officeId = this.officeId.value || undefined;
    const report = this.reports.find(r => r.id === reportId)!;
    await this.reportRepository.GetReport(report.productionReportType, report.fileName, this.dateFrom.value, this.dateTo.value, officeId);
    this.generatingReportId.set(null);
  }
}
