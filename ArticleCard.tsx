// ArticleCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Article } from './types';
import { Eye } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300"
    >
      <img
        src={article.cover_image_url || 'https://images.unsplash.com/photo-1472905391583-939a8c9e033b?q=80&w=2938&auto=format&fit=crop'}
        alt={article.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2 text-cyan-400">{article.title}</h2>
        <p className="text-gray-400 mb-4">{article.excerpt || `${article.content.substring(0, 100)}...`}</p>
        <div className="flex justify-between items-center">
            <Link
            to={`/article/${article.id}`}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
            >
                <Eye className="mr-2 h-5 w-5" />
                Read More
            </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCard;
