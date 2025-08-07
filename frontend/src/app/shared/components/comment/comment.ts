import {Component, computed, input, output, WritableSignal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {CommentActionEnum} from '../../../../types/comment-action.enum';
import {CommentType} from '../../../../types/comment.type';

@Component({
  standalone: true,
  selector: 'article-comment',
  imports: [
    DatePipe
  ],
  templateUrl: './comment.html',
  styleUrl: './comment.scss',
})
export class Comment {
  public commentSignal = input<WritableSignal<CommentType>>();
  protected readonly _comment = computed((): CommentType => {
    return this.commentSignal()!();
  })
  action = output<CommentActionEnum>();
  protected readonly _commentAction = CommentActionEnum;

  protected _applyAction(action: CommentActionEnum): void {
    this.action.emit(action);
  }
}
