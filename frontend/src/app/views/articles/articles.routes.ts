import {Routes} from '@angular/router';
import {Articles} from './articles/articles';
import {Article} from './article/article';

export const ArticlesRoutes: Routes = [
  {path: '', component: Articles},
  {path: ':id', component: Article},
]
