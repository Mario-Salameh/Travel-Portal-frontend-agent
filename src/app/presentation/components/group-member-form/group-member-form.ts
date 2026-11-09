import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormTextInput } from '../form-text-input';
import { GroupSubPolicy } from '../../../data/models/group-sub-policy';
import { arabicOnlyValidator, englishOnlyValidator } from '../../../core/validators/language';
import { numbersOnlyValidator, phoneNumberValidator } from '../../../core/validators/number';
import { passportValidator } from '../../../core/validators/passport';
import { PhoneNumberInputField } from '../phone-number-input-field/phone-number-input-field';
import { DialogService } from '../../../core/services/dialog';
@Component({
  selector: 'app-group-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormTextInput, PhoneNumberInputField],
  templateUrl: './group-member-form.html',
  styleUrl: './group-member-form.css',
})

export class GroupMemberForm implements OnInit {
  @Input() countries: { label: string; code: string }[] = [];
  @Input() memberData?: GroupSubPolicy;
  @Input() memberIndex?: number;
  @Output() onSave = new EventEmitter<GroupSubPolicy>();
  @Output() onCancel = new EventEmitter<void>();
  maxDateOfBirth = '';
  fb = inject(FormBuilder);
  memberForm!: FormGroup;
  dialogService = inject(DialogService);
  showArabicFields = false;
  genders = [
    { label: 'Male', code: '1' },
    { label: 'Female', code: '2' },
  ];

  private readonly fieldLabels: Record<string, string> = {
    firstNameNative: 'First Name',
    fatherNameNative: 'Father Name',
    lastNameNative: 'Last Name',

    firstNameForeign: 'First Name (Arabic)',
    fatherNameForeign: 'Father Name (Arabic)',
    lastNameForeign: 'Last Name (Arabic)',

    addressNative: 'Address',
    addressForeign: 'Address (Arabic)',

    phoneNumber: 'Phone Number',
    fax: 'Fax',

    passportNumber: 'Passport Number',
    birthDate: 'Date of Birth',
    nationalityCountryCode: 'Nationality',
    passengerGender: 'Gender',

    tripCancellationFlag: 'Trip Cancellation',
    winterSkiFlag: 'Winter Ski',
    covidFlag: 'COVID-19',
  };

  private getValidationMessage(controlName: string, errors: Record<string, any>): string {
    const fieldName = this.fieldLabels[controlName] ?? controlName;

    if (errors['required']) {
      return `${fieldName}: This field is required`;
    }

    if (errors['englishOnly']) {
      return `${fieldName}: Only English characters are allowed`;
    }

    if (errors['arabicOnly']) {
      return `${fieldName}: Only Arabic characters are allowed`;
    }

    if (errors['numbersOnly']) {
      return `${fieldName}: Only numbers are allowed`;
    }

    if (errors['phoneNumber']) {
      return `${fieldName}: Invalid phone number`;
    }

    if (errors['passport']) {
      return `${fieldName}: Invalid passport number`;
    }

    if (errors['pattern']) {
      return `${fieldName}: Invalid format`;
    }

    if (errors['minlength']) {
      return `${fieldName}: Minimum length is ${errors['minlength'].requiredLength}`;
    }

    if (errors['maxlength']) {
      return `${fieldName}: Maximum length is ${errors['maxlength'].requiredLength}`;
    }

    return `${fieldName}: Invalid value`;
  }

  private showValidationErrors(form: FormGroup): void {
    const errors: string[] = [];

    Object.keys(form.controls).forEach((controlName) => {
      const control = form.get(controlName);

      if (control?.invalid) {
        control.markAsTouched();

        if (control.errors) {
          errors.push(this.getValidationMessage(controlName, control.errors));
        }
      }
    });

    if (errors.length > 0) {
      this.dialogService.openDialog(
        `Please fix the following fields:<br><br>${errors.join('<br>')}`,
        'error',
      );
    }
  }

  ngOnInit(): void {
    this.memberForm = this.fb.group({
      firstNameNative: [
        this.memberData?.firstNameNative || '',
        [Validators.required, englishOnlyValidator()],
      ],
      fatherNameNative: [this.memberData?.fatherNameNative || '', englishOnlyValidator()],
      lastNameNative: [
        this.memberData?.lastNameNative || '',
        [Validators.required, englishOnlyValidator()],
      ],

      firstNameForeign: [this.memberData?.firstNameForeign || '', arabicOnlyValidator()],
      fatherNameForeign: [this.memberData?.fatherNameForeign || '', arabicOnlyValidator()],
      lastNameForeign: [this.memberData?.lastNameForeign || '', arabicOnlyValidator()],

      addressNative: [this.memberData?.addressNative || '', englishOnlyValidator()],
      addressForeign: [this.memberData?.addressForeign || '', arabicOnlyValidator()],

      phoneNumber: [
        this.memberData?.phoneNumber || '',
        [Validators.required, phoneNumberValidator()],
      ],
      fax: [this.memberData?.fax || '', numbersOnlyValidator()],

      passportNumber: [
        this.memberData?.passportNumber || '',
        [Validators.required, passportValidator()],
      ],
      birthDate: [this.memberData?.birthDate || '', Validators.required],
      nationalityCountryCode: [this.memberData?.nationalityCountryCode || '',Validators.required],
      passengerGender: [this.memberData?.passengerGender?.toString() || '',Validators.required],

      tripCancellationFlag: [this.memberData?.tripCancellationFlag || false],
      winterSkiFlag: [this.memberData?.winterSkiFlag || false],
      covidFlag: [this.memberData?.covidFlag || false],
    });

    const date = new Date();
    date.setDate(date.getDate() - 30);

    this.maxDateOfBirth = date.toISOString().split('T')[0];
  }

  saveMember(): void {
    if (this.memberForm.invalid) {
      this.showValidationErrors(this.memberForm);
      return;
    }
    if (this.memberForm.valid) {
      const formValue = this.memberForm.value;

      const member: GroupSubPolicy = {
        firstNameNative: formValue.firstNameNative,
        fatherNameNative: formValue.fatherNameNative || null,
        lastNameNative: formValue.lastNameNative,

        firstNameForeign: formValue.firstNameForeign || null,
        fatherNameForeign: formValue.fatherNameForeign || null,
        lastNameForeign: formValue.lastNameForeign || null,

        addressNative: formValue.addressNative || null,
        addressForeign: formValue.addressForeign || null,

        phoneNumber: formValue.phoneNumber,
        fax: formValue.fax || null,

        passportNumber: formValue.passportNumber,
        birthDate: formValue.birthDate,
        nationalityCountryCode: formValue.nationalityCountryCode || null,
        passengerGender: formValue.passengerGender ? parseInt(formValue.passengerGender) : 1,

        tripCancellationFlag: formValue.tripCancellationFlag,
        winterSkiFlag: formValue.winterSkiFlag,
        covidFlag: formValue.covidFlag,
      };

      this.onSave.emit(member);
    }
    // } else {
    //   Object.keys(this.memberForm.controls).forEach((key) => {
    //     this.memberForm.get(key)?.markAsTouched();
    //   });
    // }
  }

  cancel(): void {
    this.onCancel.emit();
  }
toggleArabicFields(): void {
  this.showArabicFields = !this.showArabicFields;
}
}
