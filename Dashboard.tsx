import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, deleteArticle } from './storage';
import { Article } from './types';
import { Edit2, Trash2, Eye, Plus, Loader } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const allArticles = await getArticles();
      // Unlike the home page, the admin should see ALL articles
      setArticles(allArticles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    // No confirmation in sandbox
    try {
      await deleteArticle(id);
      // Refresh the list after deleting
      loadArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Stories</h1>
          <p className="text-slate-500">View, edit, and manage your journal entries.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/admin/create" 
            className="flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Story
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                       <Loader className="w-5 h-5 animate-spin" /> Loading stories...
                    </div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No stories found. Create your first one!
                  </td>
                </tr>
              ) : (
                articles.map(article => (
                  <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{article.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{article.excerpt}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(article.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex gap-3">
                         <span title="Likes">❤️ {article.likes}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/article/${article.id}`} className="p-2 text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/admin/edit/${article.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, article.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Story"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
