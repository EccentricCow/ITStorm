import {ArticleResponseType} from './article-response.type';

export interface ArticlesResponseType {
  count: number,
  pages: number,
  items: ArticleResponseType[]
}
