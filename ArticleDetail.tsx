import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Article, Comment } from './types';
import { getArticleById, toggleLike, getComments, addComment, getUserId, getIsAdmin, deleteComment } from './storage';
import { Heart, MessageCircle, Share2, ArrowLeft, Send, Clock, Trash2, Frown } from 'lucide-react';
import { motion } from 'framer-motion';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Comment Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchArticleData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setIsAdmin(getIsAdmin());
    
    try {
      const articleData = await getArticleById(id);
      if (articleData) {
        setArticle(articleData);
        setHasLiked((articleData.likedBy || []).includes(getUserId()));
        
        const commentsData = await getComments(id);
        setComments(commentsData);
      } else {
        setArticle(null);
      }
    } catch (error) {
      console.error("Failed to fetch article details:", error);
      setArticle(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticleData();
  }, [fetchArticleData]);

  const handleLike = async () => {
    if (article) {
      const updated = await toggleLike(article.id);
      if (updated) {
        setArticle(updated);
        setHasLiked((updated.likedBy || []).includes(getUserId()));
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (article && name && email && commentText) {
      setIsSubmitting(true);
      try {
        const newComment = await addComment(article.id, name, email, commentText);
        setComments([newComment, ...comments]);
        setName('');
        setEmail('');
        setCommentText('');
      } catch (error) {
        console.error("Failed to post comment:", error);
        // Here you might want to show an error toast to the user
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    // No confirmation for sandbox environment
    await deleteComment(commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 animate-pulse">
        Loading story...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-500 gap-4">
        <Frown className="w-16 h-16 text-slate-400" />
        <h2 className="text-2xl font-semibold">Story Not Found</h2>
        <p>The article you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-flex items-center text-ocean-600 hover:underline mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/" className="inline-flex items-center text-slate-500 hover:text-ocean-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Stories
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-ocean-50 text-ocean-700 rounded-full text-xs font-medium tracking-wide border border-ocean-100">
              #{tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {new Date(article.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>{Math.ceil(article.content.length / 500)} min read</span>
        </div>
      </motion.div>

      <motion.img 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        src={article.coverImage} 
        alt={article.title} 
        className="w-full h-auto object-contain rounded-2xl shadow-lg mb-12"
      />

      <motion.article 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="prose prose-lg prose-slate max-w-none mb-16 font-serif"
      >
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {article.content}
        </div>
      </motion.article>

      <div className="flex items-center justify-between border-t border-b border-slate-100 py-8 mb-16">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all ${hasLiked ? 'text-pink-500' : 'text-slate-500 hover:text-pink-500'}`}
          >
            <Heart className={`w-6 h-6 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="font-semibold text-lg">{article.likes}</span>
          </button>
          <div className="flex items-center gap-2 text-slate-500">
            <MessageCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">{comments.length}</span>
          </div>
        </div>
        <button className="text-slate-400 hover:text-ocean-600 transition-colors">
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-100"
      >
        <h3 className="text-2xl font-bold text-slate-900 mb-8">Discussion</h3>
        
        <form onSubmit={handleCommentSubmit} className="mb-12">
          {/* Form fields... */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Your Name" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 outline-none transition-all bg-slate-50 focus:bg-white"
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          <textarea 
            placeholder="What are your thoughts?" 
            rows={4}
            required
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 outline-none transition-all bg-slate-50 focus:bg-white mb-4 resize-y"
          ></textarea>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-ocean-600 hover:bg-ocean-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : <><Send className="w-4 h-4" /> Post Comment</>}
          </button>
        </form>

        <div className="space-y-8">
          {comments.length === 0 ? (
            <p className="text-slate-400 italic">No comments yet. Be the first to share your thoughts.</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-300 to-blue-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {comment.commenterName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{comment.commenterName}</span>
                      <span className="text-slate-400 text-xs">• {new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-slate-300 hover:text-red-500 transition-all p-1"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ArticleDetail;
