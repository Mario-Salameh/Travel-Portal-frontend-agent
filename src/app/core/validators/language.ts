import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function arabicOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        const arabicRegex = /^[\u0600-\u06FF\s]+$/;
        return arabicRegex.test(control.value)
            ? null
            : { arabicOnly: { message: 'Arabic characters only are allowed.' } };
    };
}

export function englishOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        const englishRegex = /^[A-Za-z\s]+$/;
        return englishRegex.test(control.value)
            ? null
            : { englishOnly: { message: 'English characters only are allowed.' } };
    };
}
