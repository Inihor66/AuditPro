import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { motion } from 'motion/react';
import { User, Mail, Lock, ShieldPlus, ChevronRight, Phone, MapPin } from 'lucide-react';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [auditLocation, setAuditLocation] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MASTER);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId');
  const initialRole = searchParams.get('role') as UserRole || UserRole.MASTER;

  const activeRole = appId ? initialRole : role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, location, auditLocation, role: activeRole, appId })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Signup sequence failed');
      }
      const user = await res.json();
      login(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-200">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
              <ShieldPlus className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {appId ? `Join as ${initialRole.toUpperCase()}` : 'Sign Up'}
            </h2>
            <p className="mt-2 text-slate-500 text-sm font-medium">Create your account to get started</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-xs font-black uppercase tracking-wider text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {activeRole === UserRole.STUDENT && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Audit Location Covered (e.g., Delhi, Mumbai)"
                    value={auditLocation}
                    onChange={(e) => setAuditLocation(e.target.value)}
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!appId && (
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Account Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black focus:border-slate-900 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value={UserRole.MASTER}>MASTER USER</option>
                  <option value={UserRole.FIRM}>FIRM / COMPANY</option>
                  <option value={UserRole.STUDENT}>STUDENT / AUDITOR</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center py-4 px-6 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95 group"
            >
              CREATE ACCOUNT
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-center text-xs font-medium text-slate-500">
              Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-slate-900 font-black uppercase tracking-wider ml-1 hover:underline">Sign In</button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
