import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { FormTextInput } from '../../../components/form-text-input';
import { AppService } from '../../../../core/services/app';
import { DialogService } from '../../../../core/services/dialog';
import { PolicyRepository } from '../../../../domain/policy';
import { GeneralDataRepository } from '../../../../domain/general-data';

interface MemberEntry {
  birthDate: string;
  covidFlag: boolean;
  tripCancellationFlag: boolean;
  winterSkiFlag: boolean;
}

@Component({
  selector: 'app-premium-calculator-form',
  imports: [CommonModule, ReactiveFormsModule, FormTextInput],
  templateUrl: './premium-calculator-form.html',
})
export class PremiumCalculatorForm implements OnDestroy {
  fb = inject(FormBuilder);
  appService = inject(AppService);
  dialogService = inject(DialogService);
  policyRepository = inject(PolicyRepository);
  generalRepository = inject(GeneralDataRepository);

  activeTab = signal<number>(0);

  tabs = [
    { label: 'Individual Travel', planType: 1, icon: 'bi-person-fill' },
    { label: 'Group Travel', planType: 1, icon: 'bi-people-fill' },
    { label: 'Student Plan', planType: 11, icon: 'bi-mortarboard-fill' },
  ];

  periods = new Map<number, { label: string; code: string }[]>();
  countries: { label: string; code: string }[] = [];

  singleForm: FormGroup;
  groupForm: FormGroup;
  memberForm: FormGroup;

  members = signal<MemberEntry[]>([]);
  showMemberModal = false;
  editingMemberIndex: number | null = null;

  premiumResult = signal<number | null>(null);
  calculating = signal(false);

  private destroyed$ = new Subject<void>();

  get currentPeriods(): { label: string; code: string }[] {
    const planType = this.tabs[this.activeTab()].planType;
    return this.periods.get(planType) || [];
  }

  constructor() {
    this.singleForm = this.fb.group({
      destination: ['', Validators.required],
      period: ['', Validators.required],
      birthDate: ['', Validators.required],
      covidFlag: [false],
      tripCancellationFlag: [false],
      winterSkiFlag: [false],
    });

    this.groupForm = this.fb.group({
      destination: ['', Validators.required],
      period: ['', Validators.required],
    });

    this.memberForm = this.fb.group({
      birthDate: ['', Validators.required],
      covidFlag: [false],
      tripCancellationFlag: [false],
      winterSkiFlag: [false],
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  async ngOnInit(): Promise<void> {
    this.singleForm.valueChanges.pipe(debounceTime(400), takeUntil(this.destroyed$)).subscribe(() => {
      if (this.singleForm.valid && !this.calculating()) {
        this.calculateSinglePremium();
      } else {
        this.premiumResult.set(null);
      }
    });

    this.groupForm.valueChanges.pipe(debounceTime(400), takeUntil(this.destroyed$)).subscribe(() => {
      this.tryCalculateGroup();
    });

    this.appService.isLoading.set('Loading calculator data...');

    try {
      const resCountries = await this.generalRepository.getCountries();
      if (resCountries) {
        this.countries = resCountries.map(c => ({ label: c.nameInEnglish!, code: c.id! }));
      }

      for (const planType of [1, 11]) {
        const resPeriods = await this.generalRepository.getPeriods(planType);
        if (resPeriods) {
          this.periods.set(planType, resPeriods.map(p => ({ label: p.periodNameNative!, code: p.periodId! })));
        }
      }
    } catch (error) {
      this.dialogService.openDialog('Error loading data', 'error');
    } finally {
      this.appService.isLoading.set(null);
    }
  }

  switchTab(index: number): void {
    this.activeTab.set(index);
    this.premiumResult.set(null);
    this.singleForm.reset({ destination: '', period: '', birthDate: '', covidFlag: false, tripCancellationFlag: false, winterSkiFlag: false });
    this.groupForm.reset({ destination: '', period: '' });
    this.members.set([]);
  }

  // ---- Single (Individual / Student) ----

  private tryCalculateGroup(): void {
    if (this.groupForm.valid && this.members().length > 0 && !this.calculating()) {
      this.calculateGroupPremium();
    } else {
      this.premiumResult.set(null);
    }
  }

  async calculateSinglePremium(): Promise<void> {
    if (this.singleForm.invalid || this.calculating()) return;

    const f = this.singleForm.getRawValue();
    const age = Math.floor((new Date().getTime() - new Date(f.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    const planType = this.tabs[this.activeTab()].planType;

    this.calculating.set(true);
    this.premiumResult.set(null);

    try {
      const result = await this.policyRepository.calculatePremium([{
        duration: Number(f.period),
        passengerAge: age,
        planType: planType,
        destinationCountryCode: f.destination,
        covidFlag: f.covidFlag,
        tripCancellationFlag: f.tripCancellationFlag,
        winterSkiFlag: f.winterSkiFlag,
      }]);
      this.premiumResult.set(result);
    } catch (error) {
      this.dialogService.openDialog('Error calculating premium', 'error');
    } finally {
      this.calculating.set(false);
    }
  }

  // ---- Group ----

  openAddMember(): void {
    this.editingMemberIndex = null;
    this.memberForm.reset({ birthDate: '', covidFlag: false, tripCancellationFlag: false, winterSkiFlag: false });
    this.showMemberModal = true;
  }

  openEditMember(index: number): void {
    const member = this.members()[index];
    this.editingMemberIndex = index;
    this.memberForm.patchValue(member);
    this.showMemberModal = true;
  }

  closeMemberModal(): void {
    this.showMemberModal = false;
    this.memberForm.reset();
  }

  saveMember(): void {
    if (this.memberForm.invalid) {
      this.dialogService.openDialog('Please fill in Date of Birth', 'error');
      Object.keys(this.memberForm.controls).forEach(key => this.memberForm.get(key)?.markAsTouched());
      return;
    }

    const memberData: MemberEntry = this.memberForm.getRawValue();
    const current = [...this.members()];

    if (this.editingMemberIndex !== null) {
      current[this.editingMemberIndex] = memberData;
    } else {
      current.push(memberData);
    }

    this.members.set(current);
    this.closeMemberModal();
    this.tryCalculateGroup();
  }

  removeMember(index: number): void {
    const current = [...this.members()];
    current.splice(index, 1);
    this.members.set(current);
    this.tryCalculateGroup();
  }

  getMemberAge(birthDate: string): number {
    return Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }

  async calculateGroupPremium(): Promise<void> {
    if (this.groupForm.invalid || this.members().length === 0 || this.calculating()) return;

    const f = this.groupForm.getRawValue();
    this.calculating.set(true);
    this.premiumResult.set(null);

    try {
      const result = await this.policyRepository.calculatePremium(
        this.members().map(m => ({
          duration: Number(f.period),
          passengerAge: this.getMemberAge(m.birthDate),
          planType: 1,
          destinationCountryCode: f.destination,
          covidFlag: m.covidFlag,
          tripCancellationFlag: m.tripCancellationFlag,
          winterSkiFlag: m.winterSkiFlag,
        }))
      );
      this.premiumResult.set(result);
    } catch (error) {
      this.dialogService.openDialog('Error calculating premium', 'error');
    } finally {
      this.calculating.set(false);
    }
  }
}
