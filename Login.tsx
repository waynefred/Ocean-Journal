import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, XCircle } from 'lucide-react';
import { setAdmin } from './storage';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const handleLogin = () => {
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (password === 'ocean') {
        // Success
        setError('');
        setWrongAttempts(0);
        setAdmin(true);
        navigate('/admin/manage');
      } else {
        // Wrong password
        setError('Incorrect password. Hint: ocean');
        setWrongAttempts(prev => prev + 1);
        setIsLoading(false);
        setPassword('');
        
        // Simple shake effect on error via class/state
        const input = document.getElementById('password-input');
        input?.classList.add('animate-shake');
        setTimeout(() => input?.classList.remove('animate-shake'), 500);
      }
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
          {/* Lock icon */}
          <div className="flex justify-center mb-8 relative">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full relative shadow-lg">
              <Lock className="w-8 h-8 text-white" />
              {wrongAttempts > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500 rounded-full animate-pulse">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">
            {wrongAttempts > 0 ? "Access Denied" : "Admin Access"}
          </h1>
          
          <p className="text-center text-gray-500 mb-8 text-sm">
            Please enter your password to manage the journal.
          </p>

          <div className="space-y-6">
            <div>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Password"
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white ${
                  wrongAttempts > 0 
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
                autoFocus
              />
              
              {error && (
                <div className="flex items-center gap-2 mt-3 text-red-500 text-sm font-medium animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading || !password}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Enter Journal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs mt-8 text-slate-400">
             Restricted area. Authorized personnel only.
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;