// Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Article } from './types';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    // Fetch all articles, including drafts, for the dashboard
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Failed to fetch articles.');
      console.error('Error fetching articles:', error);
    } else {
      setArticles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) {
        alert('Failed to delete article.');
        console.error('Error deleting article:', error);
      } else {
        // Refresh the list after deleting
        fetchArticles();
      }
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-400">Dashboard</h1>
        <Link
          to="/editor"
          className="inline-flex items-center bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          New Article
        </Link>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-4 font-medium">{article.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      article.status === 'published'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{new Date(article.created_at).toLocaleDateString()}</td>
                <td className="p-4 flex items-center gap-4">
                    <Link to={`/article/${article.id}`} title="View" className="text-gray-400 hover:text-white">
                        <Eye size={20} />
                    </Link>
                    <Link to={`/editor/${article.id}`} title="Edit" className="text-gray-400 hover:text-white">
                        <Edit size={20} />
                    </Link>
                    <button onClick={() => handleDelete(article.id)} title="Delete" className="text-red-500 hover:text-red-400">
                        <Trash2 size={20} />
                    </button>
                </td>
              </tr>
            ))}
             {articles.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4">No articles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
