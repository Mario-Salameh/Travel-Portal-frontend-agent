import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passportValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        const passportRegex = /^[A-Za-z0-9]+$/;
        return passportRegex.test(control.value)
            ? null
            : { passport: { message: 'Passport must contain letters and numbers only.' } };
    };
}
