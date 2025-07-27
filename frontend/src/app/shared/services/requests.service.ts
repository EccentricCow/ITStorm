import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {environment} from '../../../environments/environment';
import {RequestType} from '../../../types/request.type';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private readonly _http = inject(HttpClient);

  public sendRequest(params: RequestType): Observable<DefaultResponseType> {
    return this._http.post<DefaultResponseType>(environment.api + 'requests', params);
  }
}
