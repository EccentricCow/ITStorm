import {Component, inject} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatTooltip} from "@angular/material/tooltip";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {emailValidator} from "../../../shared/validators/email.validator";
import {DefaultResponseType} from "../../../../types/responses/default-response.type";
import {LoginResponseType} from "../../../../types/responses/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {AuthService} from "../../../core/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserType} from "../../../../types/user.type";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-signup',
  imports: [
    NgOptimizedImage,
    RouterLink,
    MatTooltip,
    ReactiveFormsModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
  private readonly _authService = inject(AuthService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  protected readonly _signupForm = this._fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, emailValidator]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
    agree: [false, [Validators.requiredTrue]]
  });

  protected _signup(): void {
    if (this._signupForm.valid && this._signupForm.value.name && this._signupForm.value.email
      && this._signupForm.value.password && this._signupForm.value.agree) {
      this._authService.signup(this._signupForm.value.name, this._signupForm.value.email, this._signupForm.value.password)
        .subscribe({
          next: (data: DefaultResponseType | LoginResponseType): void => {
            let error = '';
            if ((data as DefaultResponseType).error) {
              error = (data as DefaultResponseType).message;
            }

            const signupResponse = data as LoginResponseType;

            if (!signupResponse.accessToken && !signupResponse.refreshToken && !signupResponse.userId) {
              error = 'Ошибка авторизации';
            }
            if (error) {
              this._snackBar.open(error);
              throw new Error(error);
            }

            this._authService.setUserInfo(signupResponse.accessToken, signupResponse.refreshToken, signupResponse.userId);
            this._snackBar.open('Вы успешно авторизовались');
            this._router.navigate(['/']);

            this._authService.getUserInfo()
              .subscribe({
                next: data => {
                  if ((data as DefaultResponseType).error) {
                    this._snackBar.open('Не удалось получить имя пользователя');
                    this._authService.setUserName(environment.userDefaultName);
                  }
                  const response = data as UserType;
                  if (response && response.name) {
                    this._authService.setUserName(response.name);
                  }
                },
                error: (): void => {
                  this._snackBar.open('Не удалось получить имя пользователя');
                  this._authService.setUserName(environment.userDefaultName);
                }
              })
          },
          error: (errorResponse: HttpErrorResponse): void => {
            if (errorResponse.error && errorResponse.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка регистрации');
            }
          }
        })
    }
  }

  protected get _nameInvalid(): boolean | undefined {
    const control = this._signupForm.get('name');
    return control?.invalid && (control.dirty || control.touched);
  }

  protected get _nameErrorMsg(): string {
    const control = this._signupForm.get('name');
    if (control?.errors?.['required']) return 'Имя обязательно';
    if (control?.errors?.['minlength']) return 'Имя должно быть длиннее 2 символов';
    return '';
  }

  protected get _emailInvalid(): boolean | undefined {
    const control = this._signupForm.get('email');
    return control?.invalid && (control.dirty || control.touched);
  }

  protected get _emailErrorMsg(): string {
    const control = this._signupForm.get('email');
    if (control?.errors?.['required']) return 'Email обязателен';
    if (control?.errors?.['emailValidator']) return 'Неверный формат email';
    return '';
  }

  protected get _passwordInvalid(): boolean | undefined {
    const control = this._signupForm.get('password');
    return control?.invalid && (control.dirty || control.touched);
  }

  protected get _passwordErrorMsg(): string {
    const control = this._signupForm.get('password');
    if (control?.errors?.['required']) return 'Пароль обязателен';
    if (control?.errors?.['pattern']) return 'Пароль: минимум 8 символов, заглавная, строчная буква и цифра';
    return '';
  }

  protected get _agreeInvalid(): boolean | undefined {
    const control = this._signupForm.get('agree');
    return control?.invalid && (control.dirty || control.touched);
  }
}
