// Home.tsx

import React, { useState, useEffect } from 'react';
import { getArticles } from './storage';
import { Article } from './types';
import ArticleCard from './ArticleCard';
import Pagination from './Pagination';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const { articles: fetchedArticles, count } = await getArticles(currentPage, pageSize);
        setArticles(fetchedArticles);
        setTotalArticles(count);
      } catch (err) {
        setError('Failed to fetch articles. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage]);

  if (loading) {
    return <div className="text-center text-lg">Loading articles...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">Ocean Journal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalArticles}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Home;
