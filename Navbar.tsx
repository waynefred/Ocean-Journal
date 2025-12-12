// Navbar.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-cyan-400">
            Ocean Journal
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center text-gray-300 hover:text-cyan-400 transition-colors">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Link>
            <Link to="/dashboard" className="flex items-center text-gray-300 hover:text-cyan-400 transition-colors">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Dashboard
            </Link>
            {/* Add login/logout button here in the future */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
