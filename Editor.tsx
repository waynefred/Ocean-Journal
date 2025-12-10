import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleById, saveArticle } from './storage';
import { ArticleFormData } from './types';
import { Save, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For fetching initial data

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: [],
    status: 'draft',
  });

  const [tagInput, setTagInput] = useState('');

  const fetchArticle = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const article = await getArticleById(id);
      if (article) {
        setFormData({
          title: article.title || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          coverImage: article.coverImage || '',
          tags: article.tags || [],
          status: article.status || 'draft',
        });
      } else {
        // Handle case where article is not found
        navigate('/admin/manage');
      }
    } catch (error) {
      console.error("Failed to fetch article for editing:", error);
      navigate('/admin/manage');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleChange = (field: keyof ArticleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = formData.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        handleChange('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = formData.tags || [];
    handleChange('tags', currentTags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveArticle(formData, id);
      navigate('/admin/manage');
    } catch (error) {
      console.error("Failed to save article:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-ocean-500" />
      </div>
    );
  }

  const tags = formData.tags || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 sticky top-20 z-40 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/admin/manage')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <h1 className="text-2xl font-bold text-slate-800">{id ? 'Edit Story' : 'New Story'}</h1>
        </div>
        <div className="flex items-center gap-3">
           <select 
             value={formData.status}
             onChange={e => handleChange('status', e.target.value)}
             className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-ocean-100 outline-none"
           >
             <option value="draft">Draft</option>
             <option value="published">Published</option>
           </select>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
           >
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Save
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 items-start">
        <div className="flex flex-col gap-6">
           <input 
             type="text" 
             placeholder="Article Title" 
             value={formData.title}
             onChange={e => handleChange('title', e.target.value)}
             className="text-4xl font-serif font-bold text-slate-900 placeholder-slate-300 border-none outline-none bg-transparent p-2"
           />
           
           <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Excerpt</label>
                <textarea 
                  value={formData.excerpt} 
                  onChange={e => handleChange('excerpt', e.target.value)}
                  placeholder="A short summary..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-600 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 outline-none transition-all resize-none h-24"
                />
              </div>

             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cover Image URL</label>
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={formData.coverImage}
                    onChange={e => handleChange('coverImage', e.target.value)}
                    placeholder="Paste a URL for the cover image"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-1">Please use an image hosting service (e.g., Unsplash, Imgur).</p>
             </div>

             <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tags (Press Enter)</label>
               <div className="flex flex-wrap gap-2 mb-2 p-2 bg-white border border-slate-200 rounded-lg min-h-[46px]">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-ocean-50 text-ocean-700 px-2 py-1 rounded text-sm">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-ocean-900">&times;</button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 bg-transparent outline-none min-w-[100px] text-sm"
                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                  />
               </div>
             </div>
           </div>

           <div className="flex-1 flex flex-col">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Content (Markdown supported)</label>
              <textarea 
                value={formData.content}
                onChange={e => handleChange('content', e.target.value)}
                placeholder="Write your story here..."
                className="w-full bg-white border border-slate-200 rounded-lg p-6 text-lg font-serif text-slate-700 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 outline-none transition-all leading-relaxed min-h-[600px]"
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
