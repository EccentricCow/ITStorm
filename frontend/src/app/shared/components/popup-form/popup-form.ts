import {Component, inject, OnInit, signal} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatOption} from '@angular/material/autocomplete';
import {ArticleService} from '../../services/article.service';
import {CategoryResponseType} from '../../../../types/responses/category-response.type';
import {MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {AuthService} from '../../../core/auth.service';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {MatTooltip} from '@angular/material/tooltip';
import {RequestsService} from '../../services/requests.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DefaultResponseType} from '../../../../types/responses/default-response.type';
import {NgIf} from '@angular/common';
import {RequestType} from '../../../../types/request.type';

@Component({
  standalone: true,
  selector: 'app-popup-form',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    NgxMaskDirective,
    MatTooltip,
    NgIf,
  ],
  templateUrl: './popup-form.html',
  styleUrl: './popup-form.scss',
  providers: [provideNgxMask()],
})
export class PopupForm implements OnInit {
  private articleService = inject(ArticleService);
  private requestsService = inject(RequestsService);
  private _snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private data = inject<string>(MAT_DIALOG_DATA);
  private userName = inject(AuthService).userName();

  protected typeOfForm: 'order' | 'consultation';
  isOrder = false;
  orderForm: FormGroup;

  categories = signal<CategoryResponseType[]>([]);
  isOrderSuccessful = signal(false);
  protected selected: string | null = '';

  constructor() {
    const controlsConfig: Record<string, any> = {
      name: [this.userName, [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    }
    if (this.data) {
      this.typeOfForm = 'order';
      this.isOrder = true;
      controlsConfig['category'] = [this.data, [Validators.required]];
    } else {
      this.typeOfForm = 'consultation';
    }
    this.orderForm = this.fb.group(controlsConfig)
  }

  ngOnInit() {
    this.articleService.getCategories()
      .subscribe((data: CategoryResponseType[]) => {
        this.categories.set(data);

        if (this.data) {
          const currentCategory = data.find(category => category.name === this.data);

          if (currentCategory && currentCategory.name && this.orderForm.contains('category')) {
            this.orderForm.get('category'!)?.setValue(currentCategory.name);
          }
        }
      });
    if (this.orderForm.contains('category')) {
      this.orderForm.get('category'!)?.valueChanges
        .subscribe(value => this.selected = value);
    }
  }

  sendRequest() {
    if (this.orderForm.valid && this.orderForm.value.name && this.orderForm.value.phone) {

      const params: RequestType = {
        name: this.orderForm.value.name,
        phone: '+7' + this.orderForm.value.phone,
        type: this.typeOfForm,
      }

      if (this.isOrder) {
        if (this.orderForm.value.category) {
          params.service = this.orderForm.value.category;
        } else {
          this._snackBar.open('Что-то пошло не так :(');
          return;
        }
      }

      this.requestsService.sendRequest(params)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error) {
              this._snackBar.open(data.message);
              throw new Error(data.message);
            }
            this.isOrderSuccessful.set(true);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка регистрации');
            }
          }
        });
    }
  }

  get nameInvalid() {
    const control = this.orderForm.get('name');
    return control?.invalid && (control.dirty || control.touched);
  }

  get nameErrorMsg() {
    const control = this.orderForm.get('name');
    if (control?.errors?.['required']) return 'Имя обязательно';
    if (control?.errors?.['minlength']) return 'Имя должно быть длиннее 2 символов';
    return '';
  }

  get phoneInvalid() {
    const control = this.orderForm.get('phone');
    return control?.invalid && (control.dirty || control.touched);
  }

  get phoneErrorMsg() {
    const control = this.orderForm.get('phone');
    if (control?.errors?.['required']) return 'Номер телефона обязателен';
    if (control?.errors?.['pattern']) return 'Неверный номер телефона';
    return '';
  }
}
