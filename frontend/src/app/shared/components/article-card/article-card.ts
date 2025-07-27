import {Component, input} from '@angular/core';
import {ArticleResponseType} from '../../../../types/responses/article-response.type';
import {environment} from '../../../../environments/environment';
import {NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'article-card',
  imports: [
    NgOptimizedImage,
    RouterLink
  ],
  templateUrl: './article-card.html',
  styleUrl: './article-card.scss'
})
export class ArticleCard {
  public readonly article = input<ArticleResponseType>();
  protected readonly _serverStaticPath = environment.serverStaticPath;
}
