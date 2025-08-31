import {ApplicationRef, Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {CarouselModule, OwlOptions} from "ngx-owl-carousel-o";
import {ArticleService} from '../../shared/services/article.service';
import {ArticleResponseType} from '../../../types/responses/article-response.type';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {PopupForm} from '../../shared/components/popup-form/popup-form';
import {CategoriesKeyEnum} from '../../../types/responses/categories-key.enum';
import {ArticleCard} from '../../shared/components/article-card/article-card';
import {filter, take} from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-main',
  imports: [
    CarouselModule,
    NgOptimizedImage,
    CommonModule,
    RouterLink,
    MatButton,
    ArticleCard,
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit {
  private readonly _articleService = inject(ArticleService);
  private readonly _dialog = inject(MatDialog);
  private readonly _router = inject(Router);
  private readonly _applicationRef = inject(ApplicationRef);

  protected _topArticles = signal<ArticleResponseType[]>([]);
  protected readonly _categoriesName = CategoriesKeyEnum;
  protected readonly _customOptionsMain: OwlOptions = {
    loop: true,
    items: 1,
    dots: true,
    nav: true,
    autoplay: true,
    navText: ['', '']
  };
  protected readonly _customOptionsReviews: OwlOptions = {
    loop: true,
    items: 3,
    dots: false,
    nav: true,
    autoplay: true,
    navText: ['', '']
  };

  constructor() {
    this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((): void => {
        const fragment = this._router.parseUrl(this._router.url).fragment;
        if (fragment) {
          this._applicationRef.isStable
            .pipe(filter(stable => stable), take(1))
            .subscribe((): void => {
              requestAnimationFrame((): void => {
                const el = document.getElementById(fragment);
                if (el) {
                  el.scrollIntoView({behavior: 'smooth', block: 'start'});
                }
              });
            });
        }
      });
  }

  public ngOnInit(): void {
    this._articleService.getTopArticles()
      .subscribe({
        next: (data: ArticleResponseType[]): void => {
          this._topArticles.set(data.filter(article => article.title && article.image && article.description && article.url));
        }
      });
  }

  protected _openForm(category?: string): void {
    this._dialog.open(PopupForm, {
      panelClass: 'popup-form',
      data: category
    });
  }
}
