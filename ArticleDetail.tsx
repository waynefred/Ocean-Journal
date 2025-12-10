import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleById } from '../services/storage';
import { Article } from '../types';
import ReactMarkdown from 'react-markdown';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setLoading(false);
        setError('Article ID is missing.');
        return;
      }

      try {
        setLoading(true);
        const fetchedArticle = await getArticleById(id);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          setError('Article not found.');
        }
      } catch (err) {
        setError('Failed to fetch the article.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>{error}</p>
        <Link to="/" className="text-ocean-600 hover:underline mt-4 inline-block">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  if (!article) {
    return null; // Should be handled by the error state
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="bg-white p-8 rounded-lg shadow-lg">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-ocean-900 leading-tight">{article.title}</h1>
          <p className="text-slate-500 mt-2">
            Published on {new Date(article.date).toLocaleDateString()}
          </p>
        </header>
        <div className="prose lg:prose-xl max-w-none">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </article>
      <div className="mt-8">
        <Link to="/" className="text-ocean-600 hover:underline">
          &larr; Back to all articles
        </Link>
      </div>
    </div>
  );
};

export default ArticleDetail;
