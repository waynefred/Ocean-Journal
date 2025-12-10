import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar } from 'lucide-react';
import { Article } from './types';
import { motion } from 'framer-motion';

interface Props {
  article: Article;
  index: number;
}

const ArticleCard: React.FC<Props> = ({ article, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full"
    >
      <Link to={`/article/${article.id}`} className="block overflow-hidden h-48 sm:h-56">
        <img 
          src={article.coverImage} 
          alt={article.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-ocean-700 shadow-sm">
          {article.tags[0]}
        </div>
      </Link>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Calendar className="w-3 h-3" />
          {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        
        <Link to={`/article/${article.id}`}>
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-ocean-600 transition-colors font-serif leading-tight">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
          <div className="flex items-center gap-1 text-slate-400 group-hover:text-pink-500 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-medium">{article.likes}</span>
          </div>
          <Link 
            to={`/article/${article.id}`} 
            className="text-sm font-semibold text-ocean-600 hover:text-ocean-800 transition-colors"
          >
            Read Story &rarr;
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCard;
