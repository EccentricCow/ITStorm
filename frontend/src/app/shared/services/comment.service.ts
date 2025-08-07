import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommentsResponseType} from '../../../types/responses/comments-response.type';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DefaultResponseType} from '../../../types/responses/default-response.type';
import {CommentActionResponseType} from '../../../types/responses/comment-action-response.type';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly _http = inject(HttpClient);

  public getComments(offset: number, articleId: string): Observable<CommentsResponseType> {
    return this._http.get<CommentsResponseType>(environment.api + 'comments', {
      params: {offset: offset, article: articleId}
    });
  }

  public addComment(text: string, articleId: string): Observable<DefaultResponseType> {
    return this._http.post<DefaultResponseType>(environment.api + 'comments', {
      text: text,
      article: articleId
    });
  }

  public applyCommentAction(commentId: string, action: string): Observable<DefaultResponseType> {
    return this._http.post<DefaultResponseType>(environment.api + 'comments/' + commentId + '/apply-action', {
      action
    });
  }

  public getUserActionsForAllComments(articleId: string): Observable<DefaultResponseType | CommentActionResponseType[]> {
    return this._http.get<DefaultResponseType | CommentActionResponseType[]>(environment.api + 'comments/article-comment-actions', {
      params: {articleId}
    });
  }

  public markCommentAsReported(userId: string, articleId: string, commentId: string): void {
    const key = this._getStorageKey(userId, articleId);
    const existing: string[] = JSON.parse(localStorage.getItem(key) ?? '[]');

    if (!existing.includes(commentId)) {
      existing.push(commentId);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  }

  public getReportedComments(userId: string, articleId: string): string[] {
    const key = this._getStorageKey(userId, articleId);
    return JSON.parse(localStorage.getItem(key) ?? '[]');
  }

  private _getStorageKey(userId: string, articleId: string): string {
    return `reported:${userId}:${articleId}`;
  }
}
