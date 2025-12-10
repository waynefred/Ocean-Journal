import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticleById, createArticle, updateArticle } from '../../services/storage';
import { Article } from '../../types';

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(id);

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const article = await getArticleById(id);
          if (article) {
            setTitle(article.title);
            setContent(article.content);
          } else {
            setError('Article not found.');
          }
        } catch (err) {
          setError('Failed to load article data.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchArticle();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing) {
        // Update existing article
        await updateArticle(id!, {
          title,
          content,
        });
      } else {
        // Create new article
        const newArticle: Omit<Article, 'id'> = {
          title,
          content,
          date: new Date().toISOString(),
        };
        await createArticle(newArticle);
      }
      navigate('/admin/manage');
    } catch (err) {
      setError('Failed to save the article. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading editor...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold text-ocean-800 mb-8">
        {isEditing ? 'Edit Article' : 'Create a New Article'}
      </h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <label htmlFor="title" className="block text-lg font-medium text-slate-700 mb-2">
            Article Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-ocean-200 rounded-lg focus:ring-ocean-500 focus:border-ocean-500 transition"
            required
            placeholder="e.g., The Wonders of the Deep Sea"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="content" className="block text-lg font-medium text-slate-700 mb-2">
            Content (Markdown is supported)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-ocean-200 rounded-lg h-96 focus:ring-ocean-500 focus:border-ocean-500 transition"
            required
            placeholder="Start writing your amazing article here..."
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-ocean-600 text-white px-6 py-3 rounded-lg hover:bg-ocean-700 transition-colors shadow hover:shadow-lg disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (isEditing ? 'Update Article' : 'Publish Article')}
        </button>
      </form>
    </div>
  );
};

export default Editor;
