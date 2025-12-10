import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllArticles, deleteArticle } from '../../services/storage';
import { Article } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article forever?')) {
      try {
        await deleteArticle(id);
        // Refresh the list after deletion
        setArticles(articles.filter(article => article.id !== id));
      } catch (err) {
        setError('Failed to delete the article. Please try again.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading articles...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-ocean-800">Manage Articles</h1>
        <Link 
          to="/admin/create" 
          className="bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition-colors shadow hover:shadow-lg"
        >
          Create New Article
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white rounded-lg shadow-md">
        <ul className="divide-y divide-ocean-100">
          <AnimatePresence>
            {articles.length > 0 ? (
              articles.map((article) => (
                <motion.li
                  key={article.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <h2 className="font-semibold text-ocean-800 text-lg">{article.title}</h2>
                    <p className="text-sm text-slate-500">
                      {new Date(article.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Link 
                      to={`/admin/edit/${article.id}`} 
                      className="text-ocean-600 hover:underline font-medium"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(article.id)} 
                      className="text-red-600 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </motion.li>
              ))
            ) : (
              <p className="p-4 text-slate-500 text-center">You haven't created any articles yet.</p>
            )}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
