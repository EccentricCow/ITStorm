import {CommentActionEnum} from '../comment-action.enum';

export interface CommentActionResponseType {
  comment: string,
  action: CommentActionEnum.like | CommentActionEnum.dislike
}
