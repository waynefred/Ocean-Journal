import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleById, saveArticle } from './storage';
import { generateExcerpt, improveWriting } from './gemini';
import { ArticleFormData } from './types';
import { Save, ArrowLeft, Wand2, Loader2, Image as ImageIcon, Upload } from 'lucide-react';

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    coverImage: 'https://picsum.photos/800/600',
    tags: [],
    status: 'draft',
  });

  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (id) {
      const article = getArticleById(id);
      if (article) {
        setFormData({
          title: article.title || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          coverImage: article.coverImage || '',
          tags: article.tags || [],
          status: article.status || 'draft',
        });
      }
    }
  }, [id]);

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

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      saveArticle(formData, id);
      setIsLoading(false);
      navigate('/admin/manage');
    }, 800);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize image to max width 800px to save LocalStorage space
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.7 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            handleChange('coverImage', dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Helpers
  const handleAiExcerpt = async () => {
    if (!formData.content) return;
    setAiLoading('excerpt');
    try {
      const excerpt = await generateExcerpt(formData.content);
      if (excerpt) handleChange('excerpt', excerpt);
    } catch (e) {
      console.error(e);
      alert("Could not generate excerpt.");
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiImprove = async () => {
     if (!formData.excerpt) return;
     setAiLoading('improve');
     try {
       const better = await improveWriting(formData.excerpt);
       if (better) handleChange('excerpt', better);
     } catch (e) {
        console.error(e);
        alert("Could not improve text.");
     } finally {
        setAiLoading(null);
     }
  };

  // Safe tags access
  const tags = formData.tags || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Toolbar */}
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
             onClick={() => setPreviewMode(!previewMode)}
             className="lg:hidden px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
           >
             {previewMode ? 'Edit' : 'Preview'}
           </button>
           <button 
             onClick={handleSave}
             disabled={isLoading}
             className="flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
           >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Save
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Editor Column */}
        <div className={`flex flex-col gap-6 ${previewMode ? 'hidden lg:flex' : 'flex'}`}>
           <input 
             type="text" 
             placeholder="Article Title" 
             value={formData.title}
             onChange={e => handleChange('title', e.target.value)}
             className="text-4xl font-serif font-bold text-slate-900 placeholder-slate-300 border-none outline-none bg-transparent"
           />
           
           <div className="space-y-4">
             <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Excerpt</label>
                <textarea 
                  value={formData.excerpt} 
                  onChange={e => handleChange('excerpt', e.target.value)}
                  placeholder="A short summary..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-600 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 outline-none transition-all resize-none h-24"
                />
                <div className="absolute top-8 right-2 flex gap-1">
                   {/* AI Buttons */}
                   <button 
                     onClick={handleAiExcerpt} 
                     disabled={!!aiLoading}
                     title="Generate Excerpt from Content"
                     className="p-1.5 bg-ocean-50 text-ocean-600 rounded hover:bg-ocean-100 transition-colors"
                   >
                      {aiLoading === 'excerpt' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>}
                   </button>
                </div>
             </div>

             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cover Image</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.coverImage}
                      onChange={e => handleChange('coverImage', e.target.value)}
                      placeholder="Paste URL or upload image"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 outline-none"
                    />
                  </div>
                  <button 
                    onClick={triggerFileUpload}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors whitespace-nowrap active:scale-95"
                    title="Upload from PC"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">Supports image URLs or uploads (auto-resized for performance)</p>
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
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Content</label>
              <textarea 
                value={formData.content}
                onChange={e => handleChange('content', e.target.value)}
                placeholder="Write your story here... (Press Enter for new lines)"
                className="w-full bg-white border border-slate-200 rounded-lg p-6 text-lg font-serif text-slate-700 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 outline-none transition-all leading-relaxed min-h-[600px]"
              />
           </div>
        </div>

        {/* Preview Column */}
        <div className={`bg-slate-50 rounded-2xl p-8 border border-slate-200 sticky top-24 ${previewMode ? 'flex' : 'hidden lg:block'}`}>
           <div className="prose prose-slate max-w-none w-full">
              <h1 className="font-serif break-words">{formData.title || "Untitled Story"}</h1>
              {formData.coverImage && (
                <div className="w-full h-64 rounded-xl overflow-hidden mb-8 bg-slate-200">
                  <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
              {/* Process content to ensure newlines are respected as paragraphs in preview */}
              <div className="font-serif text-slate-700" style={{ whiteSpace: 'pre-wrap' }}>
                {formData.content || "*Start writing to see preview...*"}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
