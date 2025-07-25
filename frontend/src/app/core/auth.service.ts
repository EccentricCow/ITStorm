import {inject, Injectable, signal} from '@angular/core';
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
  private http = inject(HttpClient);

  private _userName = signal(localStorage.getItem(UserInfoKeyEnum.name));
  readonly userName = this._userName.asReadonly();

  login(email: string, password: string, rememberMe: boolean): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {
      email, password, rememberMe
    })
  }

  signup(name: string, email: string, password: string): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {
      name, email, password
    });
  }

  logout(): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'logout', {
      refreshToken: localStorage.getItem(UserInfoKeyEnum.refreshTokenKey),
    });
  }

  getUserInfo(): Observable<DefaultResponseType | UserType> {
    return this.http.get<DefaultResponseType | UserType>(environment.api + 'users');
  }

  refresh(): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'refresh', {
      refreshToken: localStorage.getItem(UserInfoKeyEnum.refreshTokenKey),
    });
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(UserInfoKeyEnum.accessTokenKey, accessToken);
    localStorage.setItem(UserInfoKeyEnum.refreshTokenKey, refreshToken);
  }

  getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(UserInfoKeyEnum.accessTokenKey),
      refreshToken: localStorage.getItem(UserInfoKeyEnum.refreshTokenKey),
    };
  }

  setUserInfo(accessToken: string, refreshToken: string, userId: string): void {
    localStorage.setItem(UserInfoKeyEnum.accessTokenKey, accessToken);
    localStorage.setItem(UserInfoKeyEnum.refreshTokenKey, refreshToken);
    localStorage.setItem(UserInfoKeyEnum.userIdKey, userId);
  }

  removeUserInfo(): void {
    localStorage.removeItem(UserInfoKeyEnum.accessTokenKey);
    localStorage.removeItem(UserInfoKeyEnum.refreshTokenKey);
    localStorage.removeItem(UserInfoKeyEnum.userIdKey);
    localStorage.removeItem(UserInfoKeyEnum.name);
    this._userName.set('');
  }

  setUserName(name: string) {
    this._userName.set(name);
    localStorage.setItem(UserInfoKeyEnum.name, name);
  }
}
