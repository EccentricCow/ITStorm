import {Routes} from '@angular/router';
import {Layout} from './layout/layout';

export const routes: Routes = [
  {
    path: '', component: Layout,
    children: [
      {path: '', loadComponent: () => import('./views/main/main').then(m => m.Main)},
      {path: 'signup', loadComponent: () => import('./views/user/signup/signup').then(m => m.Signup)},
      {path: 'login', loadComponent: () => import('./views/user/login/login').then(m => m.Login)},
    ]
  }
];
