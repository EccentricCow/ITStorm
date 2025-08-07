import {
  Component, computed, ElementRef, HostListener,
  inject, OnDestroy,
  OnInit,
  signal, ViewChild
} from '@angular/core';
import {ArticleCard} from '../../../shared/components/article-card/article-card';
import {ArticleService} from '../../../shared/services/article.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ArticlesResponseType} from '../../../../types/responses/articles-response.type';
import {ActivatedRoute, Router} from '@angular/router';
import {CategoryResponseType} from '../../../../types/responses/category-response.type';
import {CategoryType} from '../../../../types/category.type';
import {Subscription} from 'rxjs';
import {FilterType} from '../../../../types/filter.type';

@Component({
  standalone: true,
  selector: 'app-articles',
  imports: [
    ArticleCard,
  ],
  templateUrl: './articles.html',
  styleUrl: './articles.scss'
})
export class Articles implements OnInit, OnDestroy {
  private readonly _articleService = inject(ArticleService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  protected _isFilterOpened = signal<boolean>(false);
  private _currentCategories = signal<string[]>([]);
  protected _currentPage = signal<number>(1);
  protected _articles = signal<ArticlesResponseType>({count: 0, pages: 0, items: []});
  private _categories = signal<CategoryResponseType[]>([]);
  protected readonly _categoriesWithFlag = computed((): CategoryType[] => {
    return this._categories().map(category => {
      return {
        id: category.id,
        name: category.name,
        url: category.url,
        isInFilter: !!this._currentCategories().find(curCat => curCat === category.url)
      };
    })
  });
  protected _pages = computed((): number[] =>
    Array.from({length: this._articles().pages}, (_, i): number => i + 1)
  )
  private _activatedRouteSubscription!: Subscription;

  @ViewChild('filter')
  private _filterRef!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this._isFilterOpened()) {
      return
    }
    const clickInside = this._filterRef.nativeElement.contains(event.target);
    if (!clickInside) {
      this._isFilterOpened.set(false);
    }
  }

  constructor() {
    const query = this._activatedRoute.snapshot.queryParamMap;
    this._currentPage.set(+(query.get('page') ?? '1'));
    this._currentCategories.set(query.getAll('categories[]') ?? []);
  }

  public ngOnInit(): void {
    this._activatedRouteSubscription = this._activatedRoute.queryParams
      .subscribe((params): void => {
        if (!params['page']) {
          this._currentPage.set(1);
        }
        if (!params['categories[]']) {
          this._currentCategories.set([]);
        }

        this._articleService.getArticles(this._currentPage(), this._currentCategories())
          .subscribe({
            next: articleResponse => {
              if (articleResponse) {
                this._articles.set(articleResponse);
              }
            },
            error: (errorResponse: HttpErrorResponse): void => {
              if (errorResponse.error && errorResponse.message) {
                this._snackBar.open(errorResponse.error.message);
              } else {
                this._snackBar.open('Ошибка получения статей');
              }
            }
          })
      });

    this._articleService.getCategories()
      .subscribe({
        next: (categoriesResponse: CategoryResponseType[]): void => {
          if (categoriesResponse && categoriesResponse.length > 0) {
            this._categories.set(categoriesResponse);
          }
        },
        error: (errorResponse: HttpErrorResponse): void => {
          if (errorResponse.error && errorResponse.message) {
            this._snackBar.open(errorResponse.error.message);
          } else {
            this._snackBar.open('Ошибка получения категорий');
          }
        }
      })
  }

  protected _applyFilters(filter: FilterType): void {
    if (filter.type === 'category') {
      const filterValue = filter.value as string;
      this._currentPage.set(1);
      if (filter.isInFilter) {
        this._currentCategories.update(categories => categories.filter(category => category !== filterValue))
      } else {
        this._currentCategories.update(categories => [...categories, filterValue]);
      }
    } else if (filter.type === 'page') {
      this._currentPage.set(filter.value as number);
    }
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: {
        'page': this._currentPage(),
        'categories[]': this._currentCategories() ? this._currentCategories() : [],
      }
    })
  }

  public ngOnDestroy(): void {
    this._activatedRouteSubscription.unsubscribe();
  }
}
