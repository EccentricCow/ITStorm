import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ArticleResponseType} from '../../../types/responses/article-response.type';
import {environment} from '../../../environments/environment';
import {CategoryResponseType} from '../../../types/responses/category-response.type';
import {ArticlesResponseType} from '../../../types/responses/articles-response.type';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly _http = inject(HttpClient);

  public getTopArticles(): Observable<ArticleResponseType[]> {
    return this._http.get<ArticleResponseType[]>(environment.api + 'articles/top');
  }

  public getArticles(page: number, categories: string[]): Observable<ArticlesResponseType> {
    const params: Record<string, any> = {
      page,
      'categories[]': categories,
    }
    return this._http.get<ArticlesResponseType>(environment.api + 'articles', {params});
  }

  public getCategories(): Observable<CategoryResponseType[]> {
    return this._http.get<CategoryResponseType[]>(environment.api + 'categories');
  }

  public getArticle(url: string): Observable<ArticleResponseType> {
    return this._http.get<ArticleResponseType>(environment.api + 'articles/' + url);
  }

  public getRelatedArticles(url: string): Observable<ArticleResponseType[]> {
    return this._http.get<ArticleResponseType[]>(environment.api + 'articles/related/' + url);
  }
}
