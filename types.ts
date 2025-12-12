// types.ts

export interface Article {
  id: number;
  created_at: string;
  title: string;
  content: string;
  author: string;
  cover_image_url?: string;
  excerpt?: string;
  status: 'draft' | 'published';
  tags?: string[];
}

export interface Comment {
  id: number;
  created_at: string;
  article_id: number;
  author: string;
  content: string;
}

// This type is for the form data when creating/editing an article
export type ArticleFormData = Omit<Article, 'id' | 'created_at'>;
