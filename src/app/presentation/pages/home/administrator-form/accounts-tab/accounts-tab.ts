import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormTextInput } from '../../../../components/form-text-input';
import { AppService } from '../../../../../core/services/app';
import { DialogService } from '../../../../../core/services/dialog';
import { AccountRepository } from '../../../../../domain/account';
import { CreateAccountRequest, UpdateAccountRequest, ViewAccount } from '../../../../../data/models';
import { arabicOnlyValidator, englishOnlyValidator } from '../../../../../core/validators/language';

@Component({
  selector: 'app-accounts-tab',
  imports: [CommonModule, ReactiveFormsModule, FormTextInput],
  templateUrl: './accounts-tab.html',
})
export class AccountsTab {
  fb = inject(FormBuilder);
  appService = inject(AppService);
  dialogService = inject(DialogService);
  accountRepository = inject(AccountRepository);

  private destroyRef = inject(DestroyRef);

  accounts = signal<ViewAccount[]>([]);
  selectedAccountCode: string | null = null;
  showAccountModal = false;
  isEditMode = false;
  accountForm: FormGroup;
  searchControl = new FormControl('');

  itemsPerPage = 12;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.accounts().length / this.itemsPerPage) || 1;
  }

  get paginatedAccounts(): ViewAccount[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.accounts().slice(start, start + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else if (this.currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
    } else if (this.currentPage >= this.totalPages - 2) {
      for (let i = this.totalPages - 4; i <= this.totalPages; i++) pages.push(i);
    } else {
      for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) pages.push(i);
    }
    return pages;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  goBack(): void {
    this.appService.selectedTabIndex.set(this.appService.accountsReturnContext()?.tabIndex ?? 6);
  }

  constructor() {
    this.accountForm = this.fb.group({
      accountCode: ['', Validators.required],
      accountNameNative: ['', [Validators.required, englishOnlyValidator()]],
      accountNameForiegn: ['', arabicOnlyValidator()],
      sltId: [4],
      catId: ['TA'],
      creditLimit: [0],
      brokerCommission: ['0']
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.loadAccounts(value || undefined);
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadAccounts();
  }

  async loadAccounts(accountCode?: string): Promise<void> {
    this.appService.isLoading.set('Loading accounts...');

    try {
      const response = await this.accountRepository.getAccounts(accountCode);
      this.accounts.set(response);
      this.currentPage = 1;
      this.appService.isLoading.set(null);

    } catch (error) {
      this.dialogService.openDialog('Error loading accounts', 'error');
    }
  }

  selectAccount(code: string): void {
    this.selectedAccountCode = code;
  }

  selectAccountForPolicy(): void {
    if (!this.selectedAccountCode) return;

    const context = this.appService.accountsReturnContext();
    if (!context) return;

    this.appService.accountsReturnContext.set({
      ...context,
      selectedAccountCode: this.selectedAccountCode,
    });
    this.goBack();
  }

  openAddAccountModal(): void {
    this.isEditMode = false;
    this.accountForm.reset({
      accountCode: '',
      accountNameForiegn: '',
      accountNameNative: '',
      sltId: 4,
      catId: 'TA',
      creditLimit: 0,
      brokerCommission: '0'
    });
    this.accountForm.get('accountCode')?.enable();
    this.showAccountModal = true;
  }

  openEditAccountModal(): void {
    if (!this.selectedAccountCode) return;

    const account = this.accounts().find(a => a.accountCode === this.selectedAccountCode);
    if (!account) return;

    this.isEditMode = true;
    this.accountForm.patchValue({
      accountCode: account.accountCode,
      accountNameForiegn: account.accountNameForiegn,
      accountNameNative: account.accountNameNative,

      sltId: account.sltId,
      catId: account.catId,
      creditLimit: account.creditLimit,
      brokerCommission: account.brokerCommission
    });
    this.accountForm.get('accountCode')?.disable();
    this.showAccountModal = true;
  }

  closeModal(): void {
    this.showAccountModal = false;
    this.accountForm.reset();
  }

  async saveAccount(): Promise<void> {
    if (this.accountForm.invalid) {
      this.dialogService.openDialog('Please fill in all required fields', 'error');
      Object.keys(this.accountForm.controls).forEach(key => {
        this.accountForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.accountForm.getRawValue();
    this.appService.isLoading.set(this.isEditMode ? 'Updating account...' : 'Creating account...');

    try {
      if (this.isEditMode) {
        const updateData: UpdateAccountRequest = {
          accountCode: formValue.accountCode,
          accountNameForiegn: formValue.accountNameForiegn,
          accountNameNative: formValue.accountNameNative,
          brokerCommission: formValue.brokerCommission,
          catId: formValue.catId,
          creditLimit: formValue.creditLimit,
          sltId: formValue.sltId,
        };
        await this.accountRepository.updateAccount(updateData);
        this.dialogService.openDialog('Account updated successfully', 'success');
      } else {
        const createData: CreateAccountRequest = {
          accountCode: formValue.accountCode,
          accountNameForiegn: formValue.accountNameForiegn,
          accountNameNative: formValue.accountNameNative,
          brokerCommission: formValue.brokerCommission,
          catId: formValue.catId,
          creditLimit: formValue.creditLimit,
          sltId: formValue.sltId,
        };
        await this.accountRepository.addAccount(createData);
        this.dialogService.openDialog('Account created successfully', 'success');
      }
      this.appService.isLoading.set(null);

      this.closeModal();
      await this.loadAccounts();
    } catch (error) {
      this.dialogService.openDialog('Error saving account', 'error');
    } finally {
      this.appService.isLoading.set(null);
    }
  }

  async deleteAccount(): Promise<void> {
    if (!this.selectedAccountCode) return;

    const confirmed = await this.dialogService.confirm({
      title: 'Delete account?',
      message: `Account ${this.selectedAccountCode} will be permanently deleted.`,
      confirmText: 'Delete account',
      tone: 'danger',
    });
    if (!confirmed) return;

    this.appService.isLoading.set('Deleting account...');

    try {
      await this.accountRepository.deleteCurrencyRate(this.selectedAccountCode);
      this.dialogService.openDialog('Account deleted successfully', 'success');
      this.selectedAccountCode = null;
      await this.loadAccounts();
    } catch (error) {
      this.dialogService.openDialog('Error deleting account', 'error');
    } finally {
      this.appService.isLoading.set(null);
    }
  }
}
