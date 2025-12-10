import { supabase } from './supabaseClient';
import { Article, Comment, ArticleFormData } from './types';

// ==========================================
// SUPABASE-POWERED DATA STORAGE
// ==========================================
// All functions are now async and interact with your Supabase backend.

// User Identification (Simplified for now)
// In a real app, you'd use Supabase Auth: https://supabase.com/docs/guides/auth
export const getUserId = (): string => {
  let uid = localStorage.getItem('user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('user_id', uid);
  }
  return uid;
};

export const getIsAdmin = (): boolean => {
  return localStorage.getItem('is_admin') === 'true';
};

export const setAdmin = (isAdmin: boolean) => {
  localStorage.setItem('is_admin', String(isAdmin));
};

// Article Operations
export const getArticles = async (): Promise<Article[]> => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  return data as Article[];
};

export const getArticleById = async (id: string): Promise<Article | undefined> => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return undefined;
  }
  return data as Article;
};

export const saveArticle = async (articleData: ArticleFormData, id?: string): Promise<Article> => {
  let articleToSave;

  if (id) {
    // Update
    const { data: existingData, error: fetchError } = await supabase
      .from('articles')
      .select('created_at, likedBy') // Fetch fields that don't change
      .eq('id', id)
      .single();

    if (fetchError || !existingData) throw new Error('Article not found to update.');

    articleToSave = {
      ...articleData,
      id: id,
      created_at: existingData.created_at, // Preserve original creation date
      updated_at: new Date().toISOString(),
      likedBy: existingData.likedBy || [], // Ensure likedBy is preserved
    };
  } else {
    // Create
    articleToSave = {
      ...articleData,
      id: Math.random().toString(36).substr(2, 9), // Generate a client-side ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };
  }

  const { data, error } = await supabase
    .from('articles')
    .upsert(articleToSave)
    .select()
    .single();

  if (error) {
    console.error('Error saving article:', error);
    throw new Error('Could not save article.');
  }

  return data as Article;
};

export const deleteArticle = async (id: string) => {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    throw new Error('Could not delete article.');
  }
};

// Like System
export const toggleLike = async (articleId: string): Promise<Article | undefined> => {
  const article = await getArticleById(articleId);
  if (!article) return undefined;

  const userId = getUserId();
  const currentLikedBy = article.likedBy || [];
  const hasLiked = currentLikedBy.includes(userId);

  let newLikes: number;
  let newLikedBy: string[];

  if (hasLiked) {
    newLikes = Math.max(0, article.likes - 1);
    newLikedBy = currentLikedBy.filter(uid => uid !== userId);
  } else {
    newLikes = article.likes + 1;
    newLikedBy = [...currentLikedBy, userId];
  }

  const { data, error } = await supabase
    .from('articles')
    .update({ likes: newLikes, likedBy: newLikedBy })
    .eq('id', articleId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling like:', error);
    return undefined;
  }

  return data as Article;
};

// Comment Operations
export const getComments = async (articleId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('articleId', articleId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data as Comment[];
};

export const addComment = async (articleId: string, name: string, email: string, content: string): Promise<Comment> => {
  const newComment = {
    articleId,
    commenterName: name,
    commenterEmail: email,
    content,
  };
  
  const { data, error } = await supabase
    .from('comments')
    .insert(newComment)
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw new Error('Could not add comment.');
  }

  return data as Comment;
};

export const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Could not delete comment.');
  }
};
