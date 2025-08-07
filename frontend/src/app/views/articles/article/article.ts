import {Component, computed, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {ArticleService} from '../../../shared/services/article.service';
import {ArticleResponseType} from '../../../../types/responses/article-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../../environments/environment';
import {ArticleCard} from '../../../shared/components/article-card/article-card';
import {AuthService} from '../../../core/auth.service';
import {CommentService} from '../../../shared/services/comment.service';
import {Comment} from '../../../shared/components/comment/comment';
import {CommentActionEnum} from '../../../../types/comment-action.enum';
import {CommentType} from '../../../../types/comment.type';
import {CommentsResponseType} from '../../../../types/responses/comments-response.type';
import {DefaultResponseType} from '../../../../types/responses/default-response.type';
import {CommentActionResponseType} from '../../../../types/responses/comment-action-response.type';
import {CommentStateUtil} from '../../../shared/utils/comment-state.util';
import {TextParserUtil} from '../../../shared/utils/text-parser.util';
import {Loader} from '../../../shared/components/loader/loader';

@Component({
  standalone: true,
  selector: 'app-article',
  imports: [
    Comment,
    ArticleCard,
    RouterLink,
    Loader,
  ],
  templateUrl: './article.html',
  styleUrl: './article.scss'
})
export class Article implements OnInit {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _articleService = inject(ArticleService);
  private readonly _commentService = inject(CommentService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _location = inject(Location);
  private readonly _authService = inject(AuthService);

  @ViewChild('commentArea')
  protected readonly _commentArea!: ElementRef;

  protected readonly _serverStaticPath = environment.serverStaticPath;
  protected _article = signal<ArticleResponseType>({
    id: '',
    url: '',
    title: '',
    description: '',
    image: '',
    date: '',
    category: '',
    text: '',
    comments: [],
    commentsCount: 0,
  });
  protected readonly _articleContent = computed((): string => {
    return TextParserUtil.convertArticleTextToHtml(this._article().text!);
  });
  protected _relatedArticles = signal<ArticleResponseType[]>([]);
  protected _commentsSignals = signal<WritableSignal<CommentType>[]>([]);
  protected _numberOfCommentsToShow = signal<number>(0);
  protected _numberOfAllComments = signal<number>(0);
  protected _areCommentsLoading = signal<boolean>(false);
  protected readonly _isLogged = computed((): boolean => this._authService.isLogged());
  protected _url!: string;

  public ngOnInit(): void {
    this._url = this._activatedRoute.snapshot.paramMap.get('id') ?? '';
    if (!this._url) {
      this._location.back();
      return;
    }
    this._articleService.getArticle(this._url)
      .subscribe({
        next: (article: ArticleResponseType): void => {
          if (article && article.title && article.description && article.image && article.text && article.id) {
            this._article.set(article);
            if (article.comments && article.comments.length > 0 && article.commentsCount) {
              this._numberOfAllComments.set(article.commentsCount);
              this._numberOfCommentsToShow.set(article.commentsCount > environment.initialNumberOfComments
                ? environment.initialNumberOfComments : article.comments.length);

              const commentsSignals = article.comments.map(comment => signal(comment));
              this._commentsSignals.set(commentsSignals);
            }

            this._articleService.getRelatedArticles(this._url)
              .subscribe({
                next: (articles: ArticleResponseType[]): void => {
                  if (articles && articles.length > 0) {
                    this._relatedArticles.set(articles);
                  }
                },
              })

            if (this._isLogged()) {
              this._getUserActionsForAllComments(article.id);
            }
          }
        },
        error: (errorResponse: HttpErrorResponse): void => {
          this._location.back();
          console.error(errorResponse.message);
          this._snackBar.open('Не удалось загрузить статью');
        }
      })
  }

  protected _addComment(): void {
    if (!this._isLogged()) {
      this._snackBar.open('Для добавления комментария необходимо авторизоваться');
      return;
    }
    if (!this._commentArea.nativeElement.value) {
      this._snackBar.open('Добавьте отзыв');
      return;
    }
    this._commentService.addComment(this._commentArea.nativeElement.value, this._article().id)
      .subscribe({
        next: (response): void => {
          if (response && response.error) {
            console.log(response?.message);
            this._snackBar.open('Не удалось добавить комментарий');
            return;
          }
          this._commentArea.nativeElement.value = '';
          this._numberOfAllComments.update(num => num + 1);
          this._loadComments(0);
          this._snackBar.open('Комментарий добавлен!');
        },
        error: (errorResponse: HttpErrorResponse): void => {
          console.error(errorResponse.message);
          this._snackBar.open('Не удалось добавить комментарий');
        }
      })
  }

  protected _handleCommentAction(commentId: string, action: CommentActionEnum): void {
    if (!this._isLogged()) {
      this._snackBar.open('Необходимо авторизоваться');
      return;
    }

    if (action === CommentActionEnum.violate) {
      const reportedComment = this._commentService.getReportedComments(this._authService.userId(), this._article().id);
      if (reportedComment.find(comment => comment === commentId)) {
        this._snackBar.open('Жалоба уже отправлена');
        return;
      }
    }

    this._commentService.applyCommentAction(commentId, action)
      .subscribe({
        next: actionResponse => {
          if (actionResponse.error) {
            console.error(actionResponse?.message);
            this._snackBar.open('Не удалось оставить реакцию');
          }
          this._snackBar.open(action === CommentActionEnum.violate ? 'Жалоба отправлена' : 'Ваш голос учтен');

          const commentSignals = this._commentsSignals();
          const commentToUpdate = commentSignals.find(comment => comment().id === commentId);
          if (action === CommentActionEnum.violate) {
            this._commentService.markCommentAsReported(this._authService.userId(), this._article().id, commentId);
            return;
          }
          if (commentToUpdate) {
            commentToUpdate.update((comment): CommentType => {
              return CommentStateUtil.updateCommentStateAfterAction(comment, action);
            })
          }
        },
        error: (errorResponse: HttpErrorResponse): void => {
          console.error(errorResponse.message);
          this._snackBar.open('Не удалось оставить реакцию');
        }
      });
  }

  protected _loadComments(offset: number): void {
    this._areCommentsLoading.set(true);
    this._commentService.getComments(offset, this._article().id)
      .subscribe({
          next: (commentsResponse: CommentsResponseType): void => {
            if (commentsResponse && commentsResponse.allCount && commentsResponse.comments
              && commentsResponse.comments.length > 0) {
              this._numberOfCommentsToShow.update(num => offset ? num + environment.numberOfCommentsToDefaultLoad
                : environment.initialNumberOfComments);

              if (offset) {
                const newCommentsSignals = commentsResponse.comments.map(comment => signal(comment));
                this._commentsSignals.set([...this._commentsSignals(), ...newCommentsSignals]);
              } else {
                const newCommentsSignals = commentsResponse.comments
                  .slice(0, this._numberOfCommentsToShow())
                  .map(comment => signal(comment));
                this._commentsSignals.set(newCommentsSignals);
              }
              // this._numberOfCommentsUploaded.set(this._commentsSignals().length);

              if (this._isLogged()) {
                this._getUserActionsForAllComments(this._article().id);
              }

              this._areCommentsLoading.set(false);
            }
          }
        }
      )
  }

  private _getUserActionsForAllComments(articleId: string): void {
    this._commentService.getUserActionsForAllComments(articleId)
      .subscribe({
        next: (actionsResponse: DefaultResponseType | CommentActionResponseType[]): void => {
          if ((actionsResponse as DefaultResponseType) && (actionsResponse as DefaultResponseType).error) {
            this._snackBar.open('Не удалось загрузить реакции пользователя');
            throw new Error((actionsResponse as DefaultResponseType)?.message);
          }
          const actionResult = actionsResponse as CommentActionResponseType[];

          this._commentsSignals().map(commentSignal => {
            commentSignal.update((comment): CommentType => {
              return CommentStateUtil.updateCommentsWithActions(comment, actionResult);
            });
          })
        },
        error: (errorResponse: HttpErrorResponse): void => {
          console.error(errorResponse.message);
          this._snackBar.open('Не удалось загрузить реакции пользователя');
        }
      });
  }
}
