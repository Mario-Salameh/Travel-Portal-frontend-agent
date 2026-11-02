import { Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { SelectMenuRecord } from '../../data/models';

@Component({
  selector: 'app-form-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [
    `
      .validator-popup {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 0.5rem 0.75rem;
        z-index: 1000;
        margin-top: 2px;
      }
      .validator-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: 0.8rem;
        padding: 2px 0;
      }
    `,
  ],
  template: `
    <div style="position: relative;">
      @if (options()) {
        <label [for]="this.controlName" class="form-label mb-1">
          {{ label() }}
          <span class="text-danger m-0 p-0 fw-bolder">{{ isRequired ? ' *' : '' }}</span>
        </label>

        <select
          class="form-control"
          [id]="this.controlName"
          [style.background-color]="hasErrors && !value ? 'var(--error-bg)' : ''"
          [value]="value"
          [disabled]="disabled() || options()!.length <= 1"
          (change)="onInputChange($event)"
          (focus)="isFocused.set(true)"
          (blur)="onBlur()"
        >
          <option value="" disabled hidden [selected]="!value"></option>
          @for (option of options(); track $index) {
            <option [selected]="option.code === value" [value]="option.code">
              {{ option.label }}
            </option>
          }
        </select>
      } @else if (inputType() === 'date') {
        <label [for]="this.controlName" class="form-label mb-1">
          {{ label() }}
          <span class="text-danger m-0 p-0 fw-bolder">{{ isRequired ? ' *' : '' }}</span>
        </label>
        <div class="input-group mb-2" style="position: relative;">
          <input
            type="text"
            class="form-control"
            [id]="this.controlName"
            [style.background-color]="hasErrors ? 'var(--error-bg)' : ''"
            [value]="displayValue()"
            [readonly]="readonly()"
            [disabled]="disabled()"
            placeholder="DD/MM/YYYY"
            (input)="onTextDateInput($event)"
            (focus)="isFocused.set(true)"
            (blur)="onBlur()"
          />

          @if (!disabled() && !readonly()) {
            <button
              class="btn btn-success bi bi-calendar"
              type="button"
              (click)="openDatePicker()"
            ></button>
            <input
              #nativeDatePicker
              type="date"
              style="position: absolute; opacity: 0; pointer-events: none; width: 1px; height: 1px; top: 31px; right: 40px;"
              [value]="value"
              [min]="min() || minDateDefault"
              [max]="max()"
              (change)="onNativeDateChange($event)"
            />
          }
        </div>
      } @else {
        <label [for]="this.controlName" class="form-label mb-1">
          {{ label() }}
          <span class="text-danger m-0 p-0 fw-bolder">{{ isRequired ? ' *' : '' }}</span>
        </label>
        <input
          class="form-control mb-2"
          [type]="inputType()"
          [id]="this.controlName"
          [style.background-color]="hasErrors ? 'var(--error-bg)' : ''"
          [placeholder]=""
          [value]="value"
          [min]="min()"
          [readonly]="readonly()"
          [disabled]="disabled()"
          (input)="onInputChange($event)"
          (focus)="isFocused.set(true)"
          (blur)="onBlur()"
        />
      }

      @if (isFocused() && validatorMessages.length > 0) {
        <div class="validator-popup">
          @for (v of validatorMessages; track v.key) {
            <div class="validator-item">
              <i
                [class]="
                  v.satisfied
                    ? 'bi bi-check-circle-fill text-success'
                    : 'bi bi-x-circle-fill text-danger'
                "
              ></i>
              <span>{{ v.message }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class FormTextInput implements ControlValueAccessor {
  label = input<string>('');
  inputType = input<string>('text');
  readonly = input<boolean>(false);
  disabled = input<boolean>(false);
  min = input<string>('');
  max = input<string>('');
  maxDateOfBirth = '';
  uppercase = input<boolean>(false);
  select = input<{ selectedOption: {} }>();
  options = input<{ label: string; code: string }[] | SelectMenuRecord[]>();

  nativeDatePickerRef = viewChild<ElementRef<HTMLInputElement>>('nativeDatePicker');

  ngControl = inject(NgControl, { self: true, optional: true });
  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get controlName(): string | null {
    return (this.ngControl as any)?.name ?? null;
  }

  get hasErrors(): boolean {
    const control = this.ngControl?.control;
    return !!control?.invalid;
  }

  get isRequired(): boolean {
    const control = this.ngControl?.control;
    if (!control || !control.validator) return false;
    const validators = control.validator({} as any);
    return validators?.['required'] !== undefined;
  }

  isFocused = signal(false);

  // Discovers all validators by probing with three test values:
  // empty string        → triggers required-like validators
  // null-byte (1 char)  → triggers format validators (numbers, language, passport…) and minlength
  // null-byte × 300     → triggers maxlength
  get validatorMessages(): { key: string; message: string; satisfied: boolean }[] {
    const control = this.ngControl?.control;
    if (!control?.validator) return [];

    const allErrors = {
      ...control.validator({ value: '' } as any),
      ...control.validator({ value: '\x00' } as any),
      ...control.validator({ value: '\x00'.repeat(300) } as any),
    };

    const builtInMessages: Record<string, (val: any) => string> = {
      required: () => 'This field is required.',
      minlength: (val) => `Minimum ${val?.requiredLength ?? ''} characters required.`,
      maxlength: (val) => `Maximum ${val?.requiredLength ?? ''} characters allowed.`,
      pattern: () => 'Invalid format.',
    };

    return Object.entries(allErrors)
      .filter(
        ([key, val]) =>
          (val && typeof val === 'object' && 'message' in (val as object)) ||
          key in builtInMessages,
      )
      .map(([key, val]) => ({
        key,
        message:
          val && typeof val === 'object' && 'message' in (val as object)
            ? ((val as any).message as string)
            : builtInMessages[key](val),
        satisfied: !control.errors?.[key],
      }));
  }

  value: string = '';
  displayValue = signal('');
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onBlur(): void {
    this.onTouched();
    this.isFocused.set(false);
  }

  openDatePicker(): void {
    this.nativeDatePickerRef()?.nativeElement.showPicker();
  }

  onNativeDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.displayValue.set(this.isoToDisplay(this.value));
    this.onChange(this.value);
  }

  onTextDateInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const isDeleting = (event as InputEvent).inputType?.startsWith('delete');
    const raw = inputEl.value.replace(/\D/g, '').slice(0, 8);

    if (raw.length === 0) {
      inputEl.value = '';
      this.displayValue.set('');
      this.value = '';
      this.onChange('');
      return;
    }

    // --- Day (first 2 digits, clamped to 01–31) ---
    let day = raw.slice(0, 2);
    if (day.length === 2) {
      const d = parseInt(day, 10);
      if (d > 31) day = '31';
      else if (d === 0) day = '01';
    }

    if (raw.length <= 2) {
      const formatted = day + (day.length === 2 && !isDeleting ? '/' : '');
      inputEl.value = formatted;
      this.displayValue.set(formatted);
      this.value = '';
      this.onChange('');
      return;
    }

    // --- Month ---
    // If first month digit > 1 there is no valid second digit (no month 20–99),
    // so auto-pad to 0X and advance straight to year.
    let remaining = raw.slice(2);
    let month: string;
    let autoAdvanced = false;

    if (parseInt(remaining[0], 10) > 1) {
      month = '0' + remaining[0];
      remaining = remaining.slice(1);
      autoAdvanced = true;
    } else {
      month = remaining.slice(0, 2);
      remaining = remaining.slice(2);
      if (month.length === 2) {
        const m = parseInt(month, 10);
        if (m > 12) month = '12';
        else if (m === 0) month = '01';
      }
    }

    if (!autoAdvanced && month.length < 2) {
      const formatted = `${day}/${month}`;
      inputEl.value = formatted;
      this.displayValue.set(formatted);
      this.value = '';
      this.onChange('');
      return;
    }

    // Clamp day to the max days of the selected month (use leap year 2000 as safe default)
    if (day.length === 2) {
      const maxDay = this.daysInMonth(parseInt(month, 10), 2000);
      if (parseInt(day, 10) > maxDay) day = String(maxDay).padStart(2, '0');
    }

    // --- Year (up to 4 digits) ---
    const year = remaining.slice(0, 4);

    // Re-clamp day once we know the actual year (handles non-leap Feb 29 → 28)
    if (year.length === 4 && day.length === 2) {
      const maxDayFinal = this.daysInMonth(parseInt(month, 10), parseInt(year, 10));
      if (parseInt(day, 10) > maxDayFinal) day = String(maxDayFinal).padStart(2, '0');
    }

    // Only add the trailing '/' after month when moving forward (not when the user is backspacing it away)
    const formatted =
      year.length === 0 && isDeleting ? `${day}/${month}` : `${day}/${month}/${year}`;
    inputEl.value = formatted;
    this.displayValue.set(formatted);

    if (year.length < 4) {
      this.value = '';
      this.onChange('');
      return;
    }

    // Full date — enforce minimum and commit
    const iso = `${year}-${month}-${day}`;
    const effectiveMin = this.min() || this.minDateDefault;
    if (iso < effectiveMin) {
      const minDisplay = this.isoToDisplay(effectiveMin);
      inputEl.value = minDisplay;
      this.displayValue.set(minDisplay);
      this.value = effectiveMin;
      this.onChange(effectiveMin);
      const picker = this.nativeDatePickerRef()?.nativeElement;
      if (picker) picker.value = effectiveMin;
      return;
    }

    this.value = iso;
    this.onChange(iso);
    const picker = this.nativeDatePickerRef()?.nativeElement;
    if (picker) picker.value = iso;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    let value = input.value;

    if (this.uppercase()) {
      value = value.toUpperCase();
      input.value = value;
    }

    this.value = value;
    this.onChange(value);
  }

  writeValue(value: string): void {
    this.value = value || '';
    this.displayValue.set(this.value ? this.isoToDisplay(this.value) : '');
  }

  get minDateDefault(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 100);
    return d.toISOString().split('T')[0];
  }

  private daysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  private isoToDisplay(iso: string): string {
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  ngOnInit(): void {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    this.maxDateOfBirth = this.formatDate(date);

    console.log('Max DOB:', this.maxDateOfBirth);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
