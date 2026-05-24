import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, appId })
      });
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          throw new Error(data.error || `Authentication failed. Invalid credentials.`);
        } else {
          const rawText = await res.text();
          throw new Error(rawText.substring(0, 100) || `Server error during login (status: ${res.status})`);
        }
      }
      const user = await res.json();
      login(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-200 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center shadow-xl rotate-3 transform hover:rotate-0 transition-transform duration-500">
            <ShieldCheck className="w-12 h-12 text-amber-500" />
          </div>
          
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {appId ? 'Login' : 'Audit App'}
            </h2>
            <p className="mt-2 text-slate-500 text-sm font-medium">
              Please login to continue
            </p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-xs font-bold uppercase tracking-wider text-center"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-slate-900 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-slate-900 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            {!appId && (
              <div className="flex justify-center">
                  <button type="button" onClick={() => navigate('/signup')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                    Don't have an account? Sign Up
                  </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black shadow-xl shadow-slate-100 transition-all active:scale-95 group"
              >
                LOGIN
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
        
        <p className="text-center mt-10 text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">
          Secure Access Protocol
        </p>
      </motion.div>
    </div>
  );
}
