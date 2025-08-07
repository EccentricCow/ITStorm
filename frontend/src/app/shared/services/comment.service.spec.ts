import {CommentService} from './comment.service';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {UserInfoKeyEnum} from '../../../types/user-info-key.enum';
import {AuthInterceptor} from '../../core/auth.interceptor';

describe('CommentService', (): void => {
  let service: CommentService;
  let httpTestingController: HttpTestingController;
  const commentsResponse = {
    allCount: 1,
    comments: [
      {
        id: 'string',
        text: 'string',
        date: 'string',
        likesCount: 1,
        dislikesCount: 1,
        user: {
          id: 'string',
          name: 'string'
        },
        like: false,
        dislike: false,
      }
    ]
  };
  const defaultResponse: DefaultResponseType = {
    error: false,
    message: 'string',
  }
  const accessToken = 'mockAccessToken';

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [
        CommentService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    })
    service = TestBed.inject(CommentService);
    httpTestingController = TestBed.inject(HttpTestingController);
    localStorage.setItem(UserInfoKeyEnum.accessTokenKey, accessToken);
  });

  afterEach((): void => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should include pagination parameters in request', (): void => {
    const offset = 0;
    const article = 'articleId';

    service.getComments(offset, article)
      .subscribe(response => {
          expect(response).toEqual(commentsResponse);
        }
      )

    const req = httpTestingController.expectOne(
      request => request.url === environment.api + 'comments'
        && request.params.get('offset') === '0'
        && request.params.get('article') === 'articleId'
    );

    expect(req.request.method).toBe('GET');
    req.flush(commentsResponse);
  });

  it('should add comment with x-auth header for registered user', (): void => {
    const text = 'comment';
    const articleId = 'articleId';

    service.addComment(text, articleId)
      .subscribe(response => {
        expect(response).toEqual(defaultResponse);
      })

    const req = httpTestingController.expectOne(environment.api + 'comments');

    expect(req.request.headers.get('x-auth')).toBe(accessToken);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({text: text, article: articleId});

    req.flush(defaultResponse);
  });
})
