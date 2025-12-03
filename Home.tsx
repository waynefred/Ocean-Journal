import React, { useEffect, useState } from 'react';
import { getArticles } from './storage';
import { Article } from './types';
import ArticleCard from './ArticleCard';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ARTICLES_PER_PAGE = 6;

const Home: React.FC = () => {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Only show published articles on home
    const all = getArticles();
    const published = all.filter(a => a.status === 'published').sort((a, b) => b.createdAt - a.createdAt);
    setAllArticles(published);
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const currentArticles = allArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of grid nicely
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <span className="inline-block py-1 px-3 rounded-full bg-ocean-100 text-ocean-700 text-xs font-bold tracking-wider mb-4 uppercase">
          The Journal
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
          Stories from the <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-500 to-cyan-400 animate-pulse">Deep</span>
        </h1>
        <p className="text-lg animate-rainbow-slow max-w-2xl mx-auto font-medium leading-relaxed">
          A collection of thoughts, tutorials, and aquatic musings. Dive in to explore minimalism, technology, and the serene mind.
        </p>
      </motion.div>

      {allArticles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-lg">No stories published yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {currentArticles.map((article, idx) => (
              <ArticleCard key={article.id} article={article} index={idx} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center gap-4"
            >
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-ocean-50 hover:text-ocean-600 hover:border-ocean-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full font-medium text-sm transition-all ${
                      currentPage === page 
                        ? 'bg-ocean-600 text-white shadow-md shadow-ocean-200 scale-110' 
                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-ocean-50 hover:text-ocean-600 hover:border-ocean-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </>
      )}
      
      {/* Decorative Background Elements */}
      <div className="fixed top-20 left-0 w-64 h-64 bg-ocean-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-float"></div>
      <div className="fixed bottom-20 right-0 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-float" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default Home;