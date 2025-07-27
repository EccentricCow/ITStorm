import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {
  catchError, Observable, switchMap, throwError,
} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {DefaultResponseType} from '../../types/responses/default-response.type';
import {LoginResponseType} from '../../types/responses/login-response.type';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokens = this._authService.getTokens();
    if (tokens && tokens.accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('x-auth', tokens.accessToken),
      });
      return next.handle(authReq)
        .pipe(
          catchError((error): Observable<HttpEvent<any>> => {
            if (error.status === 401 && !authReq.url.includes('/login') && !authReq.url.includes('/refresh')) {
              return this._handle401Error(authReq, next);
            }
            return throwError((): Error => error);
          }),
        );
    }
    return next.handle(req);
  }

  private _handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this._authService.refresh()
      .pipe(
        switchMap((result: DefaultResponseType | LoginResponseType): Observable<HttpEvent<any>> => {
          let error = '';
          if ((result as DefaultResponseType) !== undefined) {
            error = (result as DefaultResponseType).message;
          }
          const refreshResult = result as LoginResponseType;
          if (refreshResult.accessToken || refreshResult.refreshToken || refreshResult.userId) {
            error = 'Ошибка авторизации';
          }
          if (error) {
            return throwError((): Error => new Error(error));
          }
          this._authService.setTokens(refreshResult.accessToken, refreshResult.refreshToken);
          const authReq = req.clone({
            headers: req.headers.set('x-auth', refreshResult.accessToken),
          });
          return next.handle(authReq);
        }),
        catchError((error): Observable<never> => {
          this._authService.removeUserInfo();
          this._router.navigate(['/']);
          return throwError((): Error => new Error(error));
        }),
      );
  }
}
