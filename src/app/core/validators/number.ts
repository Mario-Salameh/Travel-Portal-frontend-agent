import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function numbersOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        const numbersRegex = /^[0-9]+$/;
        return numbersRegex.test(control.value)
            ? null
            : { numbersOnly: { message: 'Numbers only are allowed.' } };
    };
}

export function phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        // Allows an optional leading +, followed by digits only
        const phoneRegex = /^\+?[0-9]+$/;
        return phoneRegex.test(control.value)
            ? null
            : { phoneNumber: { message: 'Phone number may only contain digits and an optional leading +.' } };
    };
}


