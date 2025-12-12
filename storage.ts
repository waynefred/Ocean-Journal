// storage.ts

import { supabase } from './supabaseClient';
import { Article, Comment, ArticleFormData } from './types';

// --- Articles ---

export const getArticles = async (page = 1, pageSize = 10): Promise<{ articles: Article[], count: number }> => {
  const { data, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], count: 0 };
  }
  return { articles: data || [], count: count || 0 };
};

export const getArticle = async (id: number): Promise<Article | null> => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }
  return data;
};

export const createArticle = async (articleData: ArticleFormData): Promise<Article | null> => {
    const { data, error } = await supabase
        .from('articles')
        .insert([articleData])
        .select()
        .single();

    if (error) {
        console.error('Error creating article:', error);
        return null;
    }
    return data;
};

export const updateArticle = async (id: number, articleData: Partial<ArticleFormData>): Promise<Article | null> => {
    const { data, error } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating article:', error);
        return null;
    }
    return data;
};

export const deleteArticle = async (id: number): Promise<boolean> => {
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting article:', error);
        return false;
    }
    return true;
};

// --- Comments ---

export const getComments = async (articleId: number): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data || [];
};

export const addComment = async (commentData: Omit<Comment, 'id' | 'created_at'>): Promise<Comment | null> => {
    const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        return null;
    }
    return data;
};

// --- Image Upload ---

export const uploadCoverImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase
        .storage
        .from('cover-images') // Make sure this is the name of your public bucket
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
    }

    // Get the public URL of the uploaded file
    const { data } = supabase
        .storage
        .from('cover-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
};
