import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ArticleResponseType} from '../../../types/responses/article-response.type';
import {environment} from '../../../environments/environment';
import {CategoryResponseType} from '../../../types/responses/category-response.type';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);

  getTopArticles(): Observable<ArticleResponseType[]> {
    return this.http.get<ArticleResponseType[]>(environment.api + 'articles/top');
  }

  getCategories(): Observable<CategoryResponseType[]> {
    return this.http.get<CategoryResponseType[]>(environment.api + 'categories');
  }
}
