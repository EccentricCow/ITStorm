import {CommentType} from '../../../types/comment.type';
import {CommentActionEnum} from '../../../types/comment-action.enum';
import {CommentActionResponseType} from '../../../types/responses/comment-action-response.type';

export class CommentStateUtil {
  static updateCommentStateAfterAction(comment: CommentType, action: CommentActionEnum): CommentType {
    const editedComment = {...comment};
    switch (action) {
      case CommentActionEnum.like:
        if (editedComment.like) {
          editedComment.likesCount--;
        } else {
          editedComment.likesCount++;
          if (editedComment.dislike) {
            editedComment.dislikesCount--;
            editedComment.dislike = false;
          }
        }
        editedComment.like = !editedComment.like;
        break;
      case CommentActionEnum.dislike:
        if (editedComment.dislike) {
          editedComment.dislikesCount--;
        } else {
          editedComment.dislikesCount++;
          if (editedComment.like) {
            editedComment.likesCount--;
            editedComment.like = false;
          }
        }
        editedComment.dislike = !editedComment.dislike;
        break;
    }
    return editedComment;
  }

  static updateCommentsWithActions(comment: CommentType, actions: CommentActionResponseType[]): CommentType {
    const editedComment = {...comment};
    const currentCommentAction = actions.find(action => action.comment === comment.id);
    if (currentCommentAction) {
      editedComment[currentCommentAction.action] = true;
    }
    return editedComment;
  }
}
