import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export const emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;
  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  return emailRegex.test(value) ? null : {emailValidator: true};
}
