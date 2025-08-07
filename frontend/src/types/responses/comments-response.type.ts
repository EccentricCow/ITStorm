import {CommentType} from '../comment.type';

export interface CommentsResponseType {
  allCount: number;
  comments: CommentType[]
}
