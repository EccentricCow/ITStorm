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
    private authService = inject(AuthService);
    private _snackBar = inject(MatSnackBar);
    private router = inject(Router);
    private fb = inject(FormBuilder);

    protected signupForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, emailValidator]],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
        agree: [false, [Validators.requiredTrue]]
    })

    signup() {
        if (this.signupForm.valid && this.signupForm.value.name && this.signupForm.value.email
            && this.signupForm.value.password && this.signupForm.value.agree) {
            this.authService.signup(this.signupForm.value.name, this.signupForm.value.email, this.signupForm.value.password)
                .subscribe({
                    next: (data: DefaultResponseType | LoginResponseType) => {
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

                        this.authService.setUserInfo(signupResponse.accessToken, signupResponse.refreshToken, signupResponse.userId);
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
                            this._snackBar.open('Ошибка регистрации');
                        }
                    }
                })
        }
    }

    get nameInvalid() {
        const control = this.signupForm.get('name');
        return control?.invalid && (control.dirty || control.touched);
    }

    get nameErrorMsg() {
        const control = this.signupForm.get('name');
        if (control?.errors?.['required']) return 'Имя обязательно';
        if (control?.errors?.['minlength']) return 'Имя должно быть длиннее 2 символов';
        return '';
    }

    get emailInvalid() {
        const control = this.signupForm.get('email');
        return control?.invalid && (control.dirty || control.touched);
    }

    get emailErrorMsg() {
        const control = this.signupForm.get('email');
        if (control?.errors?.['required']) return 'Email обязателен';
        if (control?.errors?.['emailValidator']) return 'Неверный формат email';
        return '';
    }

    get passwordInvalid() {
        const control = this.signupForm.get('password');
        return control?.invalid && (control.dirty || control.touched);
    }

    get passwordErrorMsg() {
        const control = this.signupForm.get('password');
        if (control?.errors?.['required']) return 'Пароль обязателен';
        if (control?.errors?.['pattern']) return 'Пароль: минимум 8 символов, заглавная, строчная буква и цифра';
        return '';
    }

    get agreeInvalid() {
        const control = this.signupForm.get('agree');
        return control?.invalid && (control.dirty || control.touched);
    }
}
