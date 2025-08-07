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
  ],
  templateUrl: './popup-form.html',
  styleUrl: './popup-form.scss',
  providers: [provideNgxMask()],
})
export class PopupForm implements OnInit {
  private readonly _articleService = inject(ArticleService);
  private readonly _requestsService = inject(RequestsService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _data = inject<string>(MAT_DIALOG_DATA);

  private readonly _userName = this._authService.userName();
  protected _typeOfForm: 'order' | 'consultation';
  protected _isOrder = false;
  protected readonly _orderForm: FormGroup;
  protected _categories = signal<CategoryResponseType[]>([]);
  protected _isOrderSuccessful = signal(false);

  constructor() {
    const controlsConfig: Record<string, any> = {
      name: [this._userName, [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    };
    if (this._data) {
      this._typeOfForm = 'order';
      this._isOrder = true;
      controlsConfig['category'] = [this._data, [Validators.required]];
    } else {
      this._typeOfForm = 'consultation';
    }
    this._orderForm = this._fb.group(controlsConfig);
  }

  public ngOnInit(): void {
    if (this._isOrder) {
      this._articleService.getCategories()
        .subscribe((data: CategoryResponseType[]): void => {
          this._categories.set(data);
          const currentCategory = data.find(category => category.name === this._data);
          if (currentCategory && currentCategory.name) {
            this._orderForm.controls['category'].setValue(currentCategory.name);
          }
        });
    }
  }

  protected _sendRequest(): void {
    if (this._orderForm.valid && this._orderForm.value.name && this._orderForm.value.phone) {

      const params: RequestType = {
        name: this._orderForm.value.name,
        phone: '+7' + this._orderForm.value.phone,
        type: this._typeOfForm,
      }

      if (this._isOrder) {
        if (this._orderForm.value.category) {
          params.service = this._orderForm.value.category;
        } else {
          this._snackBar.open('Что-то пошло не так :(');
          return;
        }
      }

      this._requestsService.sendRequest(params)
        .subscribe({
          next: (data: DefaultResponseType): void => {
            if (data.error) {
              this._snackBar.open(data.message);
              throw new Error(data.message);
            }
            this._isOrderSuccessful.set(true);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Произошла ошибка при отправке формы, попробуйте еще раз');
            }
          }
        });
    }
  }

  protected get _nameInvalid(): boolean | undefined {
    const control = this._orderForm.controls['name'];
    return control?.invalid && (control.dirty || control.touched);
  }

  protected get _nameErrorMsg(): string {
    const control = this._orderForm.controls['name'];
    if (control?.errors?.['required']) return 'Имя обязательно';
    if (control?.errors?.['minlength']) return 'Имя должно быть длиннее 2 символов';
    return '';
  }

  protected get _phoneInvalid(): boolean | undefined {
    const control = this._orderForm.controls['phone'];
    return control?.invalid && (control.dirty || control.touched);
  }

  protected get _phoneErrorMsg(): string {
    const control = this._orderForm.controls['phone'];
    if (control?.errors?.['required']) return 'Номер телефона обязателен';
    if (control?.errors?.['pattern']) return 'Неверный номер телефона';
    return '';
  }
}
