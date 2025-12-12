// ArticleDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArticle, getComments, addComment } from './storage';
import { Article, Comment } from './types';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const articleId = parseInt(id, 10);
        const [fetchedArticle, fetchedComments] = await Promise.all([
          getArticle(articleId),
          getComments(articleId),
        ]);

        if (fetchedArticle) {
          setArticle(fetchedArticle);
          setComments(fetchedComments);
        } else {
          setError('Article not found.');
        }
      } catch (err) {
        setError('Failed to load article and comments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticleAndComments();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    try {
        const newCommentData = {
            article_id: parseInt(id, 10),
            author: 'Anonymous', // Replace with actual user later
            content: newComment,
        };
        const added = await addComment(newCommentData);
        if (added) {
            setComments([...comments, added]);
            setNewComment('');
        }
    } catch (err) {
        console.error("Failed to add comment", err);
        // Optionally, show an error to the user
    }
  };

  if (loading) return <p>Loading article...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!article) return <p>Article not found.</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <img
        src={article.cover_image_url || 'https://images.unsplash.com/photo-1472905391583-939a8c9e033b?q=80&w=2938&auto=format&fit=crop'}
        alt={article.title}
        className="w-full h-96 object-cover rounded-lg mb-8"
      />
      <h1 className="text-5xl font-extrabold mb-4 text-cyan-400">{article.title}</h1>
      <div className="text-gray-400 mb-8">
        <span>By {article.author}</span> | <span>{new Date(article.created_at).toLocaleDateString()}</span>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mb-8">
          {article.tags.map((tag, index) => (
            <span key={index} className="inline-block bg-gray-700 text-cyan-400 rounded-full px-3 py-1 text-sm font-semibold mr-2">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
        {article.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6 flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-cyan-400" />
            Comments
        </h2>
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 p-4 rounded-lg">
              <p className="font-bold">{comment.author}</p>
              <p>{comment.content}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
            </div>
          ))}
          {comments.length === 0 && <p>Be the first to comment!</p>}
        </div>
        <form onSubmit={handleCommentSubmit} className="flex gap-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-grow bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button type="submit" className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 transition-colors flex items-center">
            <Send className="mr-2 h-5 w-5" />
            Post
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ArticleDetail;
