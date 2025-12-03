export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  coverImage: string;
  tags: string[];
  status: 'published' | 'draft';
  likes: number;
  likedBy: string[]; // Array of userIdentifier
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  articleId: string;
  commenterName: string;
  commenterEmail: string; // Kept private usually, but stored
  content: string;
  createdAt: number;
}

export interface UserSession {
  isAdmin: boolean;
  userId: string; // Unique ID for liking logic
}

export type ArticleFormData = Omit<Article, 'id' | 'likes' | 'likedBy' | 'createdAt' | 'updatedAt'>;
