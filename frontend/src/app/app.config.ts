import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import {
  provideRouter, withInMemoryScrolling, withRouterConfig,

} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimations} from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material/snack-bar';
import {AuthInterceptor} from './core/auth.interceptor';
import {provideEnvironmentNgxMask} from 'ngx-mask';

export const appConfig: ApplicationConfig = {
  providers: [
    provideEnvironmentNgxMask(),
    AuthInterceptor,
    provideHttpClient(
      withInterceptors([
        (req: HttpRequest<any>, next: HttpHandlerFn) => {
          const interceptor = inject(AuthInterceptor);
          return interceptor.intercept(req, {handle: next});
        }
      ])
    ),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor, multi: true
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {duration: 2500}
    },
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: "enabled",
      }),
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    )
  ]
};
