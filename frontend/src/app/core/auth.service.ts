import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {DefaultResponseType} from '../../types/responses/default-response.type';
import {LoginResponseType} from '../../types/responses/login-response.type';
import {Observable} from 'rxjs';
import {UserInfoKeyEnum} from '../../types/user-info-key.enum';
import {UserType} from '../../types/user.type';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _http = inject(HttpClient);

  private _userName = signal(localStorage.getItem(UserInfoKeyEnum.name));
  public userName = computed((): string | null => this._userName());

  public login(email: string, password: string, rememberMe: boolean): Observable<DefaultResponseType | LoginResponseType> {
    return this._http.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {
      email, password, rememberMe
    })
  }

  public signup(name: string, email: string, password: string): Observable<DefaultResponseType | LoginResponseType> {
    return this._http.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {
      name, email, password
    });
  }

  public logout(): Observable<DefaultResponseType> {
    return this._http.post<DefaultResponseType>(environment.api + 'logout', {
      refreshToken: localStorage.getItem(UserInfoKeyEnum.refreshTokenKey),
    });
  }

  public getUserInfo(): Observable<DefaultResponseType | UserType> {
    return this._http.get<DefaultResponseType | UserType>(environment.api + 'users');
  }

  public refresh(): Observable<DefaultResponseType | LoginResponseType> {
    return this._http.post<DefaultResponseType | LoginResponseType>(environment.api + 'refresh', {
      refreshToken: localStorage.getItem(UserInfoKeyEnum.refreshTokenKey),
    });
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(UserInfoKeyEnum.accessTokenKey, accessToken);
    localStorage.setItem(UserInfoKeyEnum.refreshTokenKey, refreshToken);
  }

  public getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(UserInfoKeyEnum.accessTokenKey),
      refreshToken: localStorage.getItem(UserInfoKeyEnum.refreshTokenKey),
    };
  }

  public setUserInfo(accessToken: string, refreshToken: string, userId: string): void {
    localStorage.setItem(UserInfoKeyEnum.accessTokenKey, accessToken);
    localStorage.setItem(UserInfoKeyEnum.refreshTokenKey, refreshToken);
    localStorage.setItem(UserInfoKeyEnum.userIdKey, userId);
  }

  public removeUserInfo(): void {
    localStorage.removeItem(UserInfoKeyEnum.accessTokenKey);
    localStorage.removeItem(UserInfoKeyEnum.refreshTokenKey);
    localStorage.removeItem(UserInfoKeyEnum.userIdKey);
    localStorage.removeItem(UserInfoKeyEnum.name);
    this._userName.set('');
  }

  public setUserName(name: string) {
    this._userName.set(name);
    localStorage.setItem(UserInfoKeyEnum.name, name);
  }
}
