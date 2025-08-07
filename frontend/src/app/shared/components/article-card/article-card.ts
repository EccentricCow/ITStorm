import {Component, input} from '@angular/core';
import {ArticleResponseType} from '../../../../types/responses/article-response.type';
import {environment} from '../../../../environments/environment';
import {RouterLink} from '@angular/router';
import {FitText} from '../../directives/fit-text';

@Component({
  standalone: true,
  selector: 'article-card',
  imports: [
    RouterLink,
    FitText
  ],
  templateUrl: './article-card.html',
  styleUrl: './article-card.scss'
})
export class ArticleCard {
  public readonly article = input<ArticleResponseType>();
  protected readonly _serverStaticPath = environment.serverStaticPath;
}
