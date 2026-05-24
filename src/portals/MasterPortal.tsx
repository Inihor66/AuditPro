import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppInstance, UserRole, Subscription } from '../types';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  CreditCard, 
  LifeBuoy, 
  Plus, 
  Copy, 
  Settings, 
  MessageSquare, 
  ArrowRight,
  CheckCircle,
  Shield,
  Send,
  Clock,
  Globe,
  ExternalLink,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';

export function MasterPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [secretClicks, setSecretClicks] = useState(0);

  const [showSecretModal, setShowSecretModal] = useState(false);

  useEffect(() => {
    (window as any).triggerSecretModal = () => setShowSecretModal(true);
    return () => { delete (window as any).triggerSecretModal; };
  }, []);

  useEffect(() => {
    if (secretClicks > 0) {
      const timer = setTimeout(() => setSecretClicks(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [secretClicks]);

  const handleSecretClick = () => {
    setSecretClicks(prev => {
      const next = prev + 1;
      if (next >= 7) {
        setShowSecretModal(true);
        return 0;
      }
      return next;
    });
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/master' },
    { name: 'Profile', icon: UserIcon, path: '/master/profile' },
    { name: 'Subscription', icon: CreditCard, path: '/master/subscription' },
    { name: 'Support', icon: LifeBuoy, path: '/master/support' },
  ];

  const currentPathName = menuItems.find(m => m.path === location.pathname)?.name || 'Management';

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 cursor-alias group select-none" onClick={handleSecretClick}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg group-active:scale-95 transition-transform">M</div>
            <h1 className="text-white font-bold text-lg tracking-tight uppercase">Master Audit</h1>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">System Online</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-6 text-slate-400 hover:text-red-400 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Main Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-900">{currentPathName}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Main Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
              {user?.name?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 h-10 flex items-center justify-between px-8 text-[10px] text-slate-400 uppercase tracking-widest shrink-0">
          <div>Status: Online</div>
          <div className="flex gap-6">
            <span>Server Stable</span>
            <span className="text-slate-200">|</span>
            <span>Speed: Good</span>
          </div>
        </footer>

        <AnimatePresence>
          {showSecretModal && (
            <SecretModal 
                onClose={() => setShowSecretModal(false)} 
                onSuccess={() => {
                    setShowSecretModal(false);
                    navigate('/owner');
                }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SecretModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code === "A*2754") {
            onSuccess();
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
            setCode("");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`bg-slate-900 p-8 rounded-3xl w-full max-w-sm border-2 transition-colors ${error ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-blue-500/30'}`}
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4 border border-blue-500/20">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Identify Yourself</h3>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tight mt-1">Encrypted Terminal Request</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input 
                            type="password"
                            placeholder="SECRET_CODE"
                            autoFocus
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-white font-mono tracking-[1em] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                        >
                            Abort
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                        >
                            Authenticate
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

function Dashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppInstance[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [pendingTxn, setPendingTxn] = useState<any>(null);
  const [activeSubs, setActiveSubs] = useState<any[]>([]);
  const [allTxns, setAllTxns] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    await fetchApps();
    await fetchPendingTxn();
    await fetchActiveSubs();
  };

  const fetchApps = async () => {
    try {
      const res = await fetch(`/api/apps?ownerId=${user?.id}`);
      const data = await res.json();
      setApps(data);
    } catch (e) {
      console.error("Error fetching apps:", e);
    }
  };

  const fetchActiveSubs = async () => {
    try {
      const res = await fetch(`/api/subscriptions/status?userId=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveSubs(data);
      }
    } catch (e) {
      console.error("Error fetching active subs:", e);
    }
  };

  const fetchPendingTxn = async () => {
    try {
        const txRes = await fetch(`/api/master/transactions`);
        const txData = await txRes.json();
        setAllTxns(txData || []);
        const myPending = txData.find((t: any) => t.userId === user?.id && t.status === 'pending_verification');
        setPendingTxn(myPending || null);
    } catch (txErr) {
        console.error("Error setting pending state on dashboard:", txErr);
    }
  };

  const handleCreate = async () => {
    if (!newAppName) return;
    const res = await fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newAppName, ownerId: user?.id })
    });
    if (res.ok) {
        setShowCreate(false);
        setNewAppName('');
        fetchApps();
    } else {
        const err = await res.json();
        alert(err.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Apps</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and view your audit apps.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New App
        </button>
      </div>
      
      {pendingTxn && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 shrink-0">
            <Clock className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900">Subscription Verification in Progress</h4>
            <p className="text-xs text-amber-800 font-bold mt-0.5 animate-pulse">
              We've received your UTR: <span className="font-mono font-bold text-amber-955">{pendingTxn.utr}</span>. 
              Once verified, your subscription features will be unlocked within 24 hours.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <AppCard 
            key={app.id} 
            app={app} 
            activeSubs={activeSubs} 
            allTxns={allTxns} 
            onRefresh={fetchDashboardData} 
          />
        ))}
        {apps.length >= 2 && (
             <div className="bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3 text-slate-400">
                    <Settings className="w-6 h-6 animate-spin-slow" />
                </div>
                <p className="text-slate-600 font-bold">Slot Full (2/2)</p>
                <p className="text-xs text-slate-400 mt-1">Upgrade to create more apps</p>
             </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Create New Application</h3>
            <p className="text-slate-500 text-sm mb-6">Enter a name for your new audit portal.</p>
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 block">App Name</label>
                    <input 
                    type="text"
                    placeholder="e.g. My Audit Portal"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    autoFocus
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowCreate(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleCreate} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors">Create App</button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const AppCard: React.FC<{ 
  app: AppInstance, 
  activeSubs?: any[], 
  allTxns?: any[], 
  onRefresh?: () => void 
}> = ({ app, activeSubs = [], allTxns = [], onRefresh }) => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [isRequestingPlayStore, setIsRequestingPlayStore] = useState(app.onPlayStore);
  const [playStoreAppLink, setPlayStoreAppLink] = useState(app.playStoreAppLink || "");
  const [savingLink, setSavingLink] = useState(false);
  const [showRegisterInput, setShowRegisterInput] = useState(false);

  // Sync state with prop updates
  useEffect(() => {
    setIsRequestingPlayStore(app.onPlayStore);
    if (app.playStoreAppLink) {
      setPlayStoreAppLink(app.playStoreAppLink);
    }
  }, [app.onPlayStore, app.playStoreAppLink]);

  const handleIconClick = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 7) {
        (window as any).triggerSecretModal?.();
        return 0;
      }
      return next;
    });
  };

  const savePlayStoreLink = async (customLink?: string) => {
    const linkToSave = customLink !== undefined ? customLink : playStoreAppLink;
    if (!linkToSave) return alert("Please enter a valid link first.");
    setSavingLink(true);
    try {
      const res = await fetch(`/api/apps/${app.id}/play-store-link`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playStoreAppLink: linkToSave })
      });
      if (res.ok) {
        // Updated local object as well
        app.playStoreAppLink = linkToSave;
        alert("Google Play Target URL saved successfully!");
        onRefresh?.();
      }
    } catch (e) {
      alert("Failed to save link.");
    } finally {
      setSavingLink(false);
    }
  };

  const requestPlayStore = async () => {
      let currentLink = playStoreAppLink;
      if (!currentLink) {
          const promptLink = window.prompt("To proceed, please enter your App/PWA link for Play Store wrapping & listing:", app.link);
          if (!promptLink) return;
          currentLink = promptLink;
          setPlayStoreAppLink(promptLink);
      }
      
      // Save link first
      await savePlayStoreLink(currentLink);

      // Formalizing the request to create a transaction first
      try {
          const res = await fetch('/api/payments/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  userId: user?.id, 
                  type: 'master_play_store', 
                  amountUSD: 22,
                  appId: app.id,
                  playStoreAppLink: currentLink
              })
          });
          if (res.ok) {
              setIsRequestingPlayStore(true);
              alert("Payment session initiated for Play Store listing. Redirecting you to the Subscription page to complete payment.");
              setShowRegisterInput(false);
              onRefresh?.();
              navigate('/master/subscription');
          }
      } catch (e) {
          alert("Request failed.");
      }
  };

  const openAdmin = () => {
    if (user) {
        login({ ...user, appId: app.id });
        navigate('/admin');
    }
  };

  // Compute actual play store states from props and server-side enriched values
  const hasActiveListingSub = app.playStoreState === 'review_in_progress' || activeSubs.some(s => s.appId === app.id && s.type === 'master_play_store' && s.isActive);
  const hasPendingListingTx = app.playStoreState === 'pending_verification' || allTxns.some(t => t.appId === app.id && t.type === 'master_play_store' && t.status === 'pending_verification');
  const isLiveOnPlayStore = app.onPlayStore || app.playStoreState === 'published';
  const hasSubmittedListingTx = app.playStoreState === 'payment_submitted';

  const liveDetailsUrl = playStoreAppLink ? playStoreAppLink : `https://play.google.com/store/apps/details?id=com.audit.app_${app.id}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border-t-4 border-t-blue-600">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleIconClick}>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 ring-4 ring-blue-50">
                <span className="font-bold text-xl">{app.name[0].toUpperCase()}</span>
            </div>
            <div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{app.name}</h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">ID: {app.id}</p>
            </div>
        </div>
        <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-md tracking-tighter">Active</span>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 mb-6 flex items-center justify-between border border-slate-100 group-hover:bg-blue-50 transition-colors">
        <code className="text-xs text-blue-600 font-mono truncate mr-2">{app.link}</code>
        <button 
            onClick={() => { navigator.clipboard.writeText(app.link); alert("Link Copied!"); }}
            className="text-slate-300 hover:text-blue-600 transition-colors"
        >
            <Copy className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-auto space-y-3">
        <button 
          onClick={openAdmin}
          className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]"
        >
          Open Admin Panel
        </button>
        
        {isLiveOnPlayStore ? (
            <div className="space-y-2">
              <div className="text-center py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-200 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live on Google Play
              </div>
              <a 
                href={liveDetailsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[9px] uppercase font-black tracking-widest transition-all flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Open Play Store Link
              </a>
            </div>
        ) : hasActiveListingSub ? (
            <div className="text-center py-2.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-200 uppercase tracking-widest animate-pulse flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              Upload & Review in Progress (24h)
            </div>
        ) : hasPendingListingTx ? (
            <div className="text-center py-2.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg border border-orange-100 uppercase tracking-widest flex items-center justify-center gap-1.5 align-middle">
              <Clock className="w-3.5 h-3.5 animate-spin text-orange-500 shrink-0" />
              UTR Verification in Progress
            </div>
        ) : hasSubmittedListingTx ? (
            <div className="space-y-2 bg-amber-50 rounded-xl p-3 border border-amber-200">
               <div className="text-center py-1 text-amber-700 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1">
                 <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                 Payment Verification Required
               </div>
               <p className="text-[9px] text-amber-600 text-center leading-tight">Proceed to the scaling/subscription page to upload your proof of payment/UTR details.</p>
               <button 
                   onClick={() => navigate('/master/subscription')}
                   className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
               >
                   Go to Subscription Page
               </button>
            </div>
        ) : (
            <div className="space-y-2">
              <button 
                  onClick={requestPlayStore}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] uppercase font-black tracking-widest hover:brightness-110 shadow-sm transition-all"
              >
                  Register Play Store ($22)
              </button>
            </div>
        )}
      </div>
    </div>
  );
};

function Profile() {
    const { user, login } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState(user?.password || '');

    const handleSave = () => {
        login({ ...user!, name, email, password });
        alert("Encrypted profile sync completed!");
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" /> Account Settings
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 block">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 block">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 block">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                        <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Save Changes</button>
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-100 border border-slate-200 p-6 rounded-2xl flex items-center justify-between italic text-slate-500 text-sm">
                <span>Account registered on: {new Date(user?.createdAt || '').toLocaleDateString()}</span>
                <span className="font-mono text-xs">HASH: {user?.id}</span>
            </div>
        </div>
    );
}

function SubscriptionPage() {
    const { user } = useAuth();
    const [activeSubs, setActiveSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState<any>(null);
    const [verifying, setVerifying] = useState(false);
    const [pendingTxn, setPendingTxn] = useState<any>(null);
    const [userApps, setUserApps] = useState<AppInstance[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string>("");
    const [customPlayStoreLink, setCustomPlayStoreLink] = useState<string>("");

    useEffect(() => {
        fetchSubs();
        fetchUserApps();
    }, []);

    const fetchUserApps = async () => {
        try {
            const res = await fetch(`/api/apps?ownerId=${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setUserApps(data);
                    if (data.length > 0) {
                        setSelectedAppId(data[0].id);
                        setCustomPlayStoreLink(data[0].playStoreAppLink || "");
                    }
                }
            }
        } catch (e) {
            console.error("Error loading user apps inside subscription selection:", e);
        }
    };

    const fetchSubs = async () => {
        try {
            const res = await fetch(`/api/subscriptions/status?userId=${user?.id}`);
            const data = await res.json();
            setActiveSubs(data);
            
            // Fetch pending transactions for notification
            try {
                const txRes = await fetch(`/api/master/transactions`);
                const txData = await txRes.json();
                const myPending = txData.find((t: any) => t.userId === user?.id && t.status === 'pending_verification');
                setPendingTxn(myPending || null);
            } catch (txErr) {
                console.error("Error loading transactions:", txErr);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        { id: 'master_new_app', name: 'More Apps', price: 5, desc: 'Add 1 more application slot to your dashboard.', type: 'master_new_app', label: 'Recommended' },
        { id: 'master_play_store', name: 'Play Store Listing', price: 22, desc: 'Submit your app to the Google Play Store.', type: 'master_play_store', label: 'Full Access' }
    ];

    const startPayment = async (plan: any) => {
        if (plan.type === 'master_play_store') {
            if (!customPlayStoreLink) {
                alert("Please enter the Google Play Store Target Link / App shareable link first.");
                return;
            }
            
            // Save link to backend if an app was selected or present
            if (selectedAppId) {
                try {
                    await fetch(`/api/apps/${selectedAppId}/play-store-link`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ playStoreAppLink: customPlayStoreLink })
                    });
                } catch (err) {
                    console.error("Error saving link on selection:", err);
                }
            }
        }

        try {
            const res = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user?.id, 
                    type: plan.type, 
                    amountUSD: plan.price,
                    appId: plan.type === 'master_play_store' ? selectedAppId : undefined,
                    playStoreAppLink: plan.type === 'master_play_store' ? customPlayStoreLink : undefined
                })
            });
            const data = await res.json();
            setPaying(data);
        } catch (e) {
            alert("Payment failed to start. Try again.");
        }
    };

    const [utr, setUtr] = useState("");

    const verifyTransaction = async () => {
        if (!paying) return;
        if (!utr) return alert("Please enter the UTR/Transaction ID from your UPI app first.");
        
        setVerifying(true);
        try {
            const res = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    transactionId: paying.transaction.id,
                    utr: utr 
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setPaying(null);
                setUtr("");
                fetchSubs();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert("Verification failed. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return <div className="flex-1 flex items-center justify-center"><p className="text-slate-400">Loading subscriptions...</p></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scale your Enterprise</h2>
                <p className="text-slate-500">Pick the right expansion pack for your auditing firm.</p>
            </div>
            
            {pendingTxn && (
                <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-slate-900 shrink-0">
                        <Clock className="w-8 h-8 animate-spin-slow" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Manual Verification in Progress</h4>
                        <p className="text-sm text-amber-800 font-bold mt-1">We've received your UTR: <span className="font-mono font-bold">{pendingTxn.utr}</span>. Once verified, your subscription features will be unlocked within 24 hours.</p>
                    </div>
                    <div className="px-6 py-2 bg-amber-200 text-amber-800 rounded-full font-black text-[10px] uppercase tracking-widest leading-none shrink-0">Pending Support Sync</div>
                </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-8">
                {plans.map(plan => (
                    <div key={plan.id} className={`bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${plan.type === 'master_play_store' ? 'ring-2 ring-blue-600' : ''}`}>
                        <div className="flex justify-between items-start mb-6">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full tracking-widest">{plan.label}</span>
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                <Plus className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{plan.desc}</p>
                        
                        {plan.type === 'master_play_store' && (
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-3 mb-6">
                                {userApps.length > 0 ? (
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Target Application</label>
                                        <select 
                                            value={selectedAppId}
                                            onChange={(e) => {
                                                setSelectedAppId(e.target.value);
                                                const selected = userApps.find(a => a.id === e.target.value);
                                                setCustomPlayStoreLink(selected?.playStoreAppLink || "");
                                            }}
                                            className="w-full text-xs font-bold text-slate-800 p-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {userApps.map(app => (
                                                <option key={app.id} value={app.id}>{app.name} (ID: {app.id})</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-slate-500 bg-slate-100/50 p-2 ml-1 rounded-lg">
                                        No apps created yet. Paste your custom shareable/deployment link below:
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Play Store Target Link</label>
                                    <input 
                                        type="url"
                                        placeholder="e.g. https://your-host.pwa.app"
                                        value={customPlayStoreLink}
                                        onChange={(e) => setCustomPlayStoreLink(e.target.value)}
                                        className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-black text-slate-900">{formatCurrency(plan.price)}</span>
                            <span className="text-slate-400 text-sm">/ fixed credit</span>
                        </div>
                        
                        <button 
                            onClick={() => startPayment(plan)} 
                            className={`w-full py-4 rounded-2xl font-bold text-center transition-all ${
                                plan.type === 'master_play_store' 
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700' 
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                            Pay with UPI
                        </button>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {paying && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 text-center"
                        >
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Complete Payment</h3>
                            <p className="text-slate-500 text-sm mb-8">Scan QR with any UPI App or click pay below</p>
                            
                            <div className="flex justify-center mb-8 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paying.upiLink)}`} 
                                    alt="UPI QR Code"
                                    className="w-48 h-48"
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-2xl mb-6 flex justify-between items-center text-left">
                                <div>
                                    <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Amount to Pay</p>
                                    <p className="text-xl font-bold text-blue-600">₹{paying.transaction.amountINR}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">TXN ID</p>
                                    <p className="text-xs font-mono text-blue-600">{paying.transaction.id}</p>
                                </div>
                            </div>

                            <div className="mb-6 text-left">
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5 block">Transaction UTR / ID (From your app)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 412388..."
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <a 
                                    href={paying.upiLink}
                                    className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-slate-800 transition-all text-center"
                                >
                                    OPEN UPI APP
                                </a>
                                <button 
                                    onClick={verifyTransaction}
                                    disabled={verifying}
                                    className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                                        verifying ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                                    }`}
                                >
                                    {verifying ? "Checking Status..." : "I HAVE PAID"}
                                </button>
                                <button 
                                    onClick={() => setPaying(null)}
                                    className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors text-[10px] uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="bg-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-2xl font-bold mb-2">Easy Payments</h4>
                        <p className="text-blue-200 text-sm max-w-lg">Pay using UPI for quick credit. Your account will be updated automatically after verification.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center shrink-0">
                        <p className="text-[10px] text-blue-300 uppercase font-bold tracking-widest mb-1 leading-none">UPI ID</p>
                        <p className="text-lg font-mono font-bold">9422332475@ibl</p>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
            </div>

            {activeSubs.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Upgrades</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeSubs.map(sub => (
                            <div key={sub.id} className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-emerald-900 uppercase text-xs">{plans.find(p => p.type === sub.type)?.name || sub.type}</p>
                                    <p className="text-[10px] text-emerald-600">Expires: {new Date(sub.expiryDate).toLocaleDateString()}</p>
                                </div>
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Support() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/admin/owner-details')
            .then(r => r.json())
            .then(data => {
                if (data.id) setOwnerId(data.id);
            })
            .catch(() => setOwnerId('admin')); // Fallback
    }, []);

    const fetchMessages = async () => {
        if (!user || !ownerId) return;
        const res = await fetch(`/api/chats/${user.id}?otherId=${ownerId}`);
        const data = await res.json();
        setMessages(data);
    };

    useEffect(() => {
        if (ownerId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [user, ownerId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user || !ownerId) return;
        
        const res = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: user.id,
                receiverId: ownerId,
                text: inputText
            })
        });
        
        if (res.ok) {
            const newMsg = await res.json();
            setMessages([...messages, newMsg]);
            setInputText("");
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-250px)] flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Support Terminal</h2>
                    <p className="text-slate-500 text-sm">Direct uplink to master control node.</p>
                </div>
            </div>
            
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                <div ref={scrollRef} className="flex-1 p-8 bg-slate-50 overflow-auto flex flex-col gap-6 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                <MessageSquare className="w-10 h-10" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Initialize Communication</h4>
                            <p className="text-slate-400 text-sm max-w-xs">Send a message to our operations team. We are active 24/7.</p>
                        </div>
                    ) : (
                        messages.map((m) => {
                            const isMe = m.senderId === user?.id;
                            return (
                                <div key={m.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                    <div className={cn(
                                        "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                                        isMe 
                                            ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100" 
                                            : "bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm"
                                    )}>
                                        {m.text}
                                    </div>
                                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-2 tracking-widest">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            );
                        })
                    )}
                </div>
                <form onSubmit={sendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-4 items-center">
                    <input 
                        type="text" 
                        placeholder="Type your message here..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <button 
                        type="submit"
                        className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
}



