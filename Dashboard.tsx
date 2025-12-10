import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, deleteArticle, loadSampleData } from './storage';
import { Article } from './types';
import { Edit2, Trash2, Eye, Plus, Download, Copy, Check, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    setArticles(getArticles());
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Directly delete without window.confirm (blocked in sandbox)
    deleteArticle(id);
    loadArticles();
  };

  const handleExport = () => {
    if (articles.length === 0) {
      alert("You have no stories to export! Try adding a new story or loading sample data first.");
      return;
    }
    
    // Convert to JSON
    const json = JSON.stringify(articles, null, 2);
    
    // Strip the outer square brackets [ ] so the user can paste INSIDE the existing brackets
    // This prevents the [[...]] double-array error
    const contentToCopy = json.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
    
    // Remove the trailing comma if it exists after stripping
    const finalContent = contentToCopy.replace(/,$/, '');

    navigator.clipboard.writeText(finalContent).then(() => {
      setCopied(true);
      alert("Data copied! \n\nNOW:\n1. Open 'services/storage.ts'\n2. Paste INSIDE the 'SEED_ARTICLES' brackets []");
      setTimeout(() => setCopied(false), 5000);
    });
  };

  const handleLoadSamples = () => {
    if (confirm("This will overwrite your current empty list with sample stories. Continue?")) {
      loadSampleData();
      loadArticles();
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
          {articles.length === 0 && (
             <button
              onClick={handleLoadSamples}
              className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm border border-purple-200"
            >
              <Sparkles className="w-5 h-5" />
              Load Sample Stories
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={articles.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
              copied 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
            } ${articles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Copy article data to code for publishing"
          >
            {copied ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            {copied ? 'Copied to Clipboard!' : 'Export Data'}
          </button>
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
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map(article => (
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
                    {new Date(article.createdAt).toLocaleDateString()}
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
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer relative z-10" 
                        title="Delete Story"
                      >
                        <Trash2 className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                     No stories found. 
                     <br />
                     <span className="text-sm">Click "Load Sample Stories" above or create a new one.</span>
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
