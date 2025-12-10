import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-ocean-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-ocean-700 animate-rainbow">
          Ocean Journal
        </Link>
        <nav>
          <Link to="/admin/manage" className="text-slate-600 hover:text-ocean-600 transition-colors">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
