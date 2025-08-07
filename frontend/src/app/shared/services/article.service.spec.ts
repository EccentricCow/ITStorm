import 'zone.js/testing';
import {ArticleService} from './article.service';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {CategoryResponseType} from '../../../types/responses/category-response.type';
import {ArticleResponseType} from '../../../types/responses/article-response.type';

describe('ArticleService', (): void => {
  let articleService: ArticleService;
  let httpServiceSpy: jasmine.SpyObj<HttpClient>;
  const articleResponse: ArticleResponseType = {
    id: 'id',
    title: 'title',
    description: 'description',
    image: 'image',
    date: 'date',
    category: 'category',
    url: 'url',
    comments: [],
    commentsCount: 0,
    text: 'text'
  };

  const category: CategoryResponseType = {
    id: 'id',
    name: 'name',
    url: 'frilans',
  };

  beforeEach((): void => {
    httpServiceSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [
        ArticleService,
        {provide: HttpClient, useValue: httpServiceSpy},
      ],
    })
    articleService = TestBed.inject(ArticleService);
  });

  it('should include pagination parameters in request', (): void => {
    httpServiceSpy.get.and.returnValue(of({count: 1, pages: 1, items: [articleResponse]}));
    const page = 1;
    const categories = [category.url];
    articleService.getArticles(page, categories);
    expect(httpServiceSpy.get).toHaveBeenCalledWith(environment.api + 'articles',
      jasmine.objectContaining({
        params: jasmine.objectContaining({
          page: page,
          'categories[]': categories,
        })
      }));
  });

  it('should fetch paginated articles with categories', (done: DoneFn): void => {
    httpServiceSpy.get.and.returnValue(of({count: 1, pages: 1, items: [articleResponse]}));
    const page = 1;
    const categories = [category.url];
    articleService.getArticles(page, categories)
      .subscribe(articles => {
        expect(httpServiceSpy.get).toHaveBeenCalledOnceWith(environment.api + 'articles', {
          params: {
            page: page,
            'categories[]': categories
          }
        });
        expect(articles).toEqual({count: 1, pages: 1, items: [articleResponse]});
        done();
      });
  });

  it('should fetch article', (done: DoneFn): void => {
    httpServiceSpy.get.and.returnValue(of(articleResponse));
    const categoryUrl = category.url;
    articleService.getArticle(category.url)
      .subscribe(article => {
        expect(httpServiceSpy.get).toHaveBeenCalledOnceWith(environment.api + 'articles/' + categoryUrl);
        expect(article).toEqual(articleResponse);
        done();
      });
  });

  it('should fetch top articles', (done: DoneFn): void => {
    httpServiceSpy.get.and.returnValue(of([articleResponse]));
    articleService.getTopArticles()
      .subscribe(articles => {
        expect(httpServiceSpy.get).toHaveBeenCalledOnceWith(environment.api + 'articles/top');
        expect(articles).toEqual([articleResponse]);
        done();
      });
  });

  it('should fetch categories', (done: DoneFn): void => {
    httpServiceSpy.get.and.returnValue(of([category]));
    articleService.getCategories()
      .subscribe(articles => {
        expect(httpServiceSpy.get).toHaveBeenCalledOnceWith(environment.api + 'categories');
        expect(articles).toEqual([category]);
        done();
      });
  });
})
