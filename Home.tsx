import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllArticles } from '../services/storage';
import { Article } from '../types';
import ReactMarkdown from 'react-markdown';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const fetchedArticles = await getAllArticles();
        setArticles(fetchedArticles);
      } catch (err) {
        setError('Failed to fetch articles.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading articles...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-ocean-800 mb-8">Latest Articles</h1>
      {articles.length === 0 ? (
        <p className="text-slate-600">No articles have been published yet.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-ocean-700 mb-2 truncate">{article.title}</h2>
                <p className="text-slate-500 mb-4">{new Date(article.date).toLocaleDate-String()}</p>
                <div className="text-slate-600 mb-4 h-24 overflow-hidden">
                  <ReactMarkdown>{article.content.substring(0, 150) + '...'}</ReactMarkdown>
                </div>
                <Link to={`/article/${article.id}`} className="font-semibold text-ocean-600 hover:underline">
                  Read More &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
