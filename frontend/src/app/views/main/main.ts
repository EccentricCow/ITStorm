import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {CarouselModule, OwlOptions} from "ngx-owl-carousel-o";
import {ArticleService} from '../../shared/services/article.service';
import {ArticleResponseType} from '../../../types/responses/article-response.type';
import {RouterLink} from '@angular/router';
import {environment} from '../../../environments/environment';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {PopupForm} from '../../shared/components/popup-form/popup-form';
import {CategoriesKeyEnum} from '../../../types/responses/categories-key.enum';

@Component({
  standalone: true,
  selector: 'app-main',
  imports: [
    CarouselModule,
    NgOptimizedImage,
    CommonModule,
    RouterLink,
    MatButton,
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit {
  private articleService = inject(ArticleService);
  readonly dialog = inject(MatDialog);

  protected categoriesName = CategoriesKeyEnum;

  topArticles = signal<ArticleResponseType[]>([]);
  protected serverStaticPath = environment.serverStaticPath;

  customOptionsMain: OwlOptions = {
    loop: true,
    items: 1,
    dots: true,
    nav: true,
    autoplay: true,
    navText: ['', '']
  };
  customOptionsReviews: OwlOptions = {
    loop: true,
    items: 3,
    dots: false,
    nav: true,
    autoplay: true,
    navText: ['', '']
  };

  ngOnInit(): void {
    this.articleService.getTopArticles()
      .subscribe({
        next: (data: ArticleResponseType[]) => {
          this.topArticles.set(data.filter(article => article.title && article.image && article.description && article.url));
        }
      })
  }

  openForm(category?: string): void {
    this.dialog.open(PopupForm, {
      panelClass: 'popup-form',
      data: category
    });
  }
}
