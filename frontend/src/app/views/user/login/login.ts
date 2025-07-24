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
    private authService = inject(AuthService);
    private _snackBar = inject(MatSnackBar);
    private router = inject(Router);
    private fb = inject(FormBuilder);

    protected loginForm = this.fb.group({
        email: ['', [Validators.required, emailValidator]],
        password: ['', Validators.required],
        rememberMe: [false]
    })

    login() {
        if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
            this.authService.login(this.loginForm.value.email, this.loginForm.value.password, !!this.loginForm.value.rememberMe)
                .subscribe({
                    next: (data: DefaultResponseType | LoginResponseType) => {
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

                        this.authService.setUserInfo(loginResponse.accessToken, loginResponse.refreshToken, loginResponse.userId);
                        this._snackBar.open('Вы успешно авторизовались');
                        this.router.navigate(['/']);

                        this.authService.getUserInfo()
                            .subscribe({
                                next: data => {
                                    if ((data as DefaultResponseType).error) {
                                        this._snackBar.open('Не удалось получить имя пользователя');
                                        this.authService.userName = environment.userDefaultName;
                                    }
                                    const response = data as UserType;
                                    if (response && response.name) {
                                        this.authService.userName = response.name;
                                    }
                                },
                                error: () => {
                                    this._snackBar.open('Не удалось получить имя пользователя');
                                    this.authService.userName = environment.userDefaultName;
                                }
                            })
                    },
                    error: (errorResponse: HttpErrorResponse) => {
                        if (errorResponse.error && errorResponse.message) {
                            this._snackBar.open(errorResponse.error.message);
                        } else {
                            this._snackBar.open('Ошибка авторизации');
                        }
                    }
                })
        }
    }

    get emailInvalid() {
        const control = this.loginForm.get('email');
        return control?.invalid && (control.dirty || control.touched);
    }

    get emailErrorMsg() {
        const control = this.loginForm.get('email');
        if (control?.errors?.['required']) return 'Email обязателен';
        if (control?.errors?.['emailValidator']) return 'Неверный формат email';
        return '';
    }

    get passwordInvalid() {
        const control = this.loginForm.get('password');
        return control?.invalid && (control.dirty || control.touched);
    }

    get passwordErrorMsg() {
        const control = this.loginForm.get('password');
        if (control?.errors?.['required']) return 'Пароль обязателен';
        return '';
    }
}
