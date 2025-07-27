import {Component, inject} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatTooltip} from '@angular/material/tooltip';
import {emailValidator} from "../../../shared/validators/email.validator";
import {AuthService} from "../../../core/auth.service";
import {DefaultResponseType} from "../../../../types/responses/default-response.type";
import {LoginResponseType} from "../../../../types/responses/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {UserType} from "../../../../types/user.type";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-login',
  imports: [
    NgOptimizedImage,
    RouterLink,
    ReactiveFormsModule,
    MatTooltip,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly _authService = inject(AuthService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  protected readonly _loginForm = this._fb.group({
    email: ['', [Validators.required, emailValidator]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  protected _login(): void {
    if (this._loginForm.valid && this._loginForm.value.email && this._loginForm.value.password) {
      this._authService.login(this._loginForm.value.email, this._loginForm.value.password, !!this._loginForm.value.rememberMe)
        .subscribe({
          next: (data: DefaultResponseType | LoginResponseType): void => {
            let error = '';
            if ((data as DefaultResponseType).error) {
              error = (data as DefaultResponseType).message;
            }

            const loginResponse = data as LoginResponseType;

            if (!loginResponse.accessToken && !loginResponse.refreshToken && !loginResponse.userId) {
              error = 'Ошибка авторизации';
            }
            if (error) {
              this._snackBar.open(error);
              throw new Error(error);
            }

            this._authService.setUserInfo(loginResponse.accessToken, loginResponse.refreshToken, loginResponse.userId);
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
              this._snackBar.open('Ошибка авторизации');
            }
          }
        })
    }
  }

  protected get _emailInvalid(): boolean | undefined {
    const control = this._loginForm.get('email');
    return control?.invalid && (control.dirty || control.touched);
  }

  protected get _emailErrorMsg(): string {
    const control = this._loginForm.get('email');
    if (control?.errors?.['required']) return 'Email обязателен';
    if (control?.errors?.['emailValidator']) return 'Неверный формат email';
    return '';
  }

  protected get _passwordInvalid(): boolean | undefined {
    const control = this._loginForm.get('password');
    return control?.invalid && (control.dirty || control.touched);
  }

  protected get _passwordErrorMsg(): string {
    const control = this._loginForm.get('password');
    if (control?.errors?.['required']) return 'Пароль обязателен';
    return '';
  }
}
