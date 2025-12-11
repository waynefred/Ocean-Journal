import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, PenTool, LayoutDashboard } from 'lucide-react';
import { getIsAdmin, setAdmin } from './storage';

const Navbar: React.FC = () => {
  const [isAdmin, setIsAdminState] = React.useState(getIsAdmin());
  const location = useLocation();

  // Update admin state whenever the route changes to reflect login/logout status immediately
  useEffect(() => {
    setIsAdminState(getIsAdmin());
  }, [location]);

  const handleLogout = () => {
    setAdmin(false);
    setIsAdminState(false);
    // Force a reload or navigation to ensure state cleans up
    window.location.href = '#/';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-ocean-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-ocean-100 p-2 rounded-lg group-hover:bg-ocean-200 transition-colors">
              <BookOpen className="w-6 h-6 text-ocean-600" />
            </div>
            <span className="font-serif font-bold text-xl text-ocean-900 tracking-tight">Ocean<span className="text-ocean-500">Journal</span></span>
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-ocean-600' : 'text-slate-500 hover:text-ocean-600'}`}
            >
              Stories
            </Link>
            
            {isAdmin && (
              <>
                <Link 
                  to="/admin/manage" 
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${isActive('/admin/manage') ? 'text-ocean-600' : 'text-slate-500 hover:text-ocean-600'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage</span>
                </Link>
                <Link 
                  to="/admin/create" 
                  className="flex items-center gap-2 bg-ocean-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-ocean-700 transition-all shadow-md hover:shadow-lg"
                >
                  <PenTool className="w-4 h-4" />
                  Write
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
