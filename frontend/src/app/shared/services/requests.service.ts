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
  private http = inject(HttpClient);

  sendRequest(params: RequestType): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'requests', params);
  }
}
