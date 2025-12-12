// Editor.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createArticle, getArticle, updateArticle, uploadCoverImage } from './storage';
import { ArticleFormData } from './types';
import { Save, Upload, Eye } from 'lucide-react';

const Editor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ArticleFormData>({
        title: '',
        content: '',
        author: 'Current User', // Replace with actual user later
        cover_image_url: '',
        excerpt: '',
        status: 'draft',
        tags: [],
    });
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const fetchArticle = async () => {
                try {
                    const article = await getArticle(parseInt(id, 10));
                    if (article) {
                        setFormData({
                            title: article.title,
                            content: article.content,
                            author: article.author,
                            cover_image_url: article.cover_image_url,
                            excerpt: article.excerpt,
                            status: article.status,
                            tags: article.tags || [],
                        });
                    }
                } catch (err) {
                    setError('Failed to load article for editing.');
                    console.error(err);
                }
            };
            fetchArticle();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tags = e.target.value.split(',').map(tag => tag.trim());
        setFormData(prev => ({ ...prev, tags }));
    };

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCoverImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            let imageUrl = formData.cover_image_url;
            if (coverImageFile) {
                const uploadedUrl = await uploadCoverImage(coverImageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    throw new Error('Failed to upload cover image.');
                }
            }

            const articleData = { ...formData, cover_image_url: imageUrl };

            if (id) {
                await updateArticle(parseInt(id, 10), articleData);
            } else {
                await createArticle(articleData);
            }
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to save the article. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Memoized preview component to avoid re-renders on every keystroke
    const MemoizedPreview = useCallback(() => {
      return (
        <div className="prose prose-invert max-w-none text-gray-300">
          {formData.cover_image_url && <img src={formData.cover_image_url} alt="Cover Preview" className="w-full h-64 object-cover rounded-md" />}
          <h1>{formData.title}</h1>
          <p className="lead">{formData.excerpt}</p>
          {formData.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
        </div>
      );
    }, [formData.title, formData.content, formData.excerpt, formData.cover_image_url]);


    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-cyan-400">{id ? 'Edit Article' : 'Create New Article'}</h1>
            {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Editor Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={15}
                            className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-400 mb-1">Excerpt</label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="A short summary of the article..."
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label htmlFor="coverImage" className="flex-1 cursor-pointer inline-flex items-center justify-center bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors">
                            <Upload className="mr-2 h-5 w-5" />
                            {coverImageFile ? 'Change Cover Image' : 'Upload Cover Image'}
                        </label>
                        <input id="coverImage" type="file" onChange={handleCoverImageChange} className="hidden" accept="image/*" />
                        {coverImageFile && <span className="text-sm text-gray-400">{coverImageFile.name}</span>}
                    </div>

                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-400 mb-1">Tags (comma-separated)</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags?.join(', ')}
                            onChange={handleTagsChange}
                            className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center bg-cyan-500 text-white font-bold py-2 px-6 rounded-md hover:bg-cyan-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <Save className="mr-2 h-5 w-5" />
                            {isSubmitting ? 'Saving...' : (id ? 'Update Article' : 'Save Article')}
                        </button>
                    </div>
                </form>

                {/* Live Preview */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-400">
                        <Eye className="mr-2 h-6 w-6" /> Live Preview
                    </h2>
                    <div className="border-t border-gray-700 pt-4">
                       <MemoizedPreview />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Editor;
