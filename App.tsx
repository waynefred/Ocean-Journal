import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import ArticleDetail from './ArticleDetail';
import Dashboard from './Dashboard';
import Editor from './Editor';
import Login from './Login';
import { getIsAdmin, getArticles } from './storage';
import { Article } from './types';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const isAdmin = getIsAdmin();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const allArticles = await getArticles();
        const published = allArticles.filter(a => a.status === 'published');
        setArticles(published);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        // Handle error state in UI if desired
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-ocean-50/50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home articles={articles} isLoading={loading} />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/login" element={isAdmin ? <Navigate to="/admin/manage" replace /> : <Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin/manage" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/create" element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit/:id" element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t border-ocean-100 py-8 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
           <p>© {new Date().getFullYear()} <span className="animate-rainbow-slow font-bold">Ocean Journal</span></p>
           <div className="flex items-center gap-4">
             <a 
               href="mailto:winfredkwao1995@gmail.com" 
               className="font-bold animate-rainbow hover:underline transition-all"
             >
               winfredkwao1995@gmail.com
             </a>
             <span className="text-slate-300">|</span>
             <Link to="/login" className="hover:text-ocean-600 transition-colors">Admin</Link>
           </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;