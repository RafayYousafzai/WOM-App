// types.ts
export interface CommentUser {
  id: string;
  username: string;
  avatar: string;
}

export interface Reply {
  id: string;
  user: CommentUser;
  text: string;
  timeAgo: string;
}

export interface Comment {
  id: string;
  user: CommentUser;
  text: string;
  timeAgo: string;
  rating?: number;
  likes: number;
  isLiked: boolean;
  replies: Reply[];
}

export interface CommentSectionProps {
  isVisible: boolean;
  onClose: () => void;
  post_id: string;
}
