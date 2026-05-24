import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppInstance, UserRole } from '../types';
import { 
  Users, 
  MessageSquare, 
  ClipboardCheck, 
  Ban, 
  Grid3X3, 
  DollarSign, 
  Terminal, 
  Shield,
  Send,
  User as UserIcon,
  ChevronRight,
  ExternalLink,
  History,
  CheckCircle,
  XCircle,
  PackageCheck,
  Home,
  Layout
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

type Tab = 'users' | 'chats' | 'requests' | 'finance';

export function OwnerPortal() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [stats, setStats] = useState({ users: 0, apps: 0, revenue: 0 });

  useEffect(() => {
    fetch('/api/owner/stats').then(r => r.json()).then(setStats);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-400 flex overflow-hidden">
      {/* Sidebar Nav */}
      <aside className="w-20 lg:w-64 bg-slate-900 border-r border-emerald-900/20 flex flex-col pt-8">
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">O</div>
          <div className="hidden lg:block">
            <h1 className="text-white font-black uppercase text-sm tracking-widest">Master</h1>
            <p className="text-[10px] text-emerald-500/50 uppercase font-bold">Control Node</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavButton 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
            icon={Users} 
            label="Users" 
          />
          <NavButton 
            active={activeTab === 'chats'} 
            onClick={() => setActiveTab('chats')} 
            icon={MessageSquare} 
            label="Communications" 
          />
          <NavButton 
            active={activeTab === 'requests'} 
            onClick={() => setActiveTab('requests')} 
            icon={Terminal} 
            label="System Requests" 
          />
          <NavButton 
            active={activeTab === 'finance'} 
            onClick={() => setActiveTab('finance')} 
            icon={DollarSign} 
            label="Finance" 
          />
          
          <div className="pt-8 opacity-50 px-4">
              <p className="text-[10px] font-black uppercase text-slate-600 mb-4 tracking-widest">Navigation</p>
              <button 
                onClick={() => navigate('/master')}
                className="w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all group"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Back to Portal</span>
              </button>
          </div>
        </nav>

        <div className="p-4 border-t border-emerald-900/10">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <Ban className="w-5 h-5" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950/50">
        <header className="h-20 border-b border-emerald-900/10 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-8">
            <h2 className="text-white font-black uppercase tracking-[0.2em] text-xs">
              {activeTab === 'users' && "Global User Matrix"}
              {activeTab === 'chats' && "Secure Communication Uplink"}
              {activeTab === 'requests' && "System Requests & Approvals"}
              {activeTab === 'finance' && "Financial Ledger Admin"}
            </h2>
            <div className="hidden md:flex gap-6">
                <StatMini label="Users" value={stats.users} />
                <StatMini label="Revenue" value={formatCurrency(stats.revenue)} color="text-blue-400" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-8 relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full"
                >
                    {activeTab === 'users' && <UsersManagement onChat={(userId) => { setActiveTab('chats'); (window as any).selectChatUser = userId; }} />}
                    {activeTab === 'chats' && <OwnerChats />}
                    {activeTab === 'requests' && <SystemRequestsList onChat={(userId) => { setActiveTab('chats'); (window as any).selectChatUser = userId; }} />}
                    {activeTab === 'finance' && <FinanceLedger />}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl transition-all group relative",
                active ? "bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/5"
            )}
        >
            <Icon className={cn("w-5 h-5 transition-transform group-active:scale-90", active ? "stroke-[2.5px]" : "")} />
            <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">{label}</span>
            {active && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-slate-950 rounded-r-full" />}
        </button>
    );
}

function StatMini({ label, value, color = "text-emerald-400" }: { label: string, value: any, color?: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-bold text-slate-600 tracking-widest">{label}:</span>
            <span className={cn("text-[10px] font-black uppercase tracking-tight", color)}>{value}</span>
        </div>
    );
}

function FinanceLedger() {
    const [txns, setTxns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTxns = async () => {
        const res = await fetch('/api/master/transactions');
        const data = await res.json();
        
        // Fetch users to map IDs to names
        const usersRes = await fetch('/api/owner/users');
        const users = await usersRes.json();
        
        const enriched = data.map((t: any) => {
            const user = users.find((u: any) => u.id === t.userId);
            return { ...t, userName: user?.name || 'Unknown User', userEmail: user?.email || 'N/A' };
        });

        setTxns(enriched);
        setLoading(false);
    };

    useEffect(() => {
        fetchTxns();
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        const res = await fetch(`/api/master/transactions/${id}/${action}`, { method: 'POST' });
        if (res.ok) {
            alert(`Transaction ${action}ed successfully.`);
            fetchTxns();
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 overflow-hidden">
            <div className="flex justify-between items-end bg-slate-900/50 p-6 rounded-3xl border border-emerald-900/20">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Finance Ledger</h2>
                    <p className="text-slate-500 text-xs font-medium">Verification of incoming UPI packets and operational revenue.</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Global Revenue</p>
                    <p className="text-xl font-black text-emerald-400 font-mono">${txns.filter(t => t.status === 'completed').reduce((acc, curr) => acc + curr.amountUSD, 0)}</p>
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-[2rem] border border-emerald-900/20 shadow-xl flex-1 flex flex-col overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 text-slate-500 text-[9px] font-black uppercase tracking-widest sticky top-0">
                            <tr>
                                <th className="px-6 py-4">User / Source</th>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">UTR / Ref</th>
                                <th className="px-6 py-4">Tier</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-900/10">
                            {txns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-700 font-bold uppercase text-[10px] tracking-widest italic">No transactions detected in history.</td>
                                </tr>
                            ) : txns.map(t => (
                                <tr key={t.id} className="hover:bg-emerald-500/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-white text-xs lowercase">{t.userEmail}</p>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">{t.userName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-400 text-xs">{t.id.toUpperCase()}</p>
                                        <p className="text-[9px] text-slate-600 font-bold">{new Date(t.timestamp).toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-emerald-500 text-xs">{t.utr || 'NOT_SUBMITTED'}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-600">{t.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-white text-xs">₹{t.amountINR}</p>
                                        <p className="text-[9px] text-slate-600 font-bold">${t.amountUSD}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-[8px] font-black uppercase px-2 py-0.5 rounded border leading-none inline-block",
                                            t.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            t.status === 'pending_verification' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse" :
                                            "bg-slate-800 text-slate-600 border-slate-700"
                                        )}>
                                            {t.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {t.status === 'pending_verification' && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleAction(t.id, 'reject')}
                                                    className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(t.id, 'approve')}
                                                    className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        {t.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function UsersManagement({ onChat }: { onChat: (id: string) => void }) {
    const [users, setUsers] = useState<any[]>([]);
    const [apps, setApps] = useState<AppInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [managingSub, setManagingSub] = useState<any | null>(null);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch('/api/owner/users').then(r => r.json()),
            fetch('/api/owner/apps').then(r => r.json())
        ]).then(([usersData, appsData]) => {
            setUsers(usersData);
            setApps(appsData);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const modifySub = async (userId: string, action: 'unsubscribe' | 'grant', planType?: string) => {
        const res = await fetch('/api/owner/subscriptions/modify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action, planType, appId: selectedAppId })
        });
        if (res.ok) {
            setManagingSub(null);
            setSelectedAppId(null);
            fetchData();
        }
    };

    const userApps = managingSub ? apps.filter(a => a.ownerId === managingSub.id) : [];

    return (
        <div className="h-full flex flex-col">
            <div className="bg-slate-900/50 border border-emerald-900/20 rounded-3xl overflow-hidden flex flex-col flex-1 shadow-2xl">
                <div className="bg-slate-950/50 p-6 border-b border-emerald-900/10 grid grid-cols-4 lg:grid-cols-6 gap-4 items-center">
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 col-span-2 lg:col-span-1">Name / Email</span>
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 hidden lg:block">Role</span>
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 col-span-2">Subscriptions</span>
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 hidden lg:block">Expiry Status</span>
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 text-right">Actions</span>
                </div>
                
                <div className="flex-1 overflow-auto custom-scrollbar p-2 space-y-1">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-emerald-500/20 text-xs uppercase animate-pulse">Scanning matrix...</div>
                    ) : users.map(u => {
                        const hasSub = u.subscriptions?.length > 0;
                        const sub = u.subscriptions?.[0];
                        return (
                            <div key={u.id} className="grid grid-cols-4 lg:grid-cols-6 gap-4 items-center p-4 rounded-2xl hover:bg-emerald-500/5 transition-all group">
                                <div className="col-span-2 lg:col-span-1 overflow-hidden">
                                    <p className="text-white font-bold text-xs truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{u.name}</p>
                                    <p className="text-[9px] text-slate-600 truncate">{u.email}</p>
                                </div>
                                <div className="hidden lg:block">
                                    <span className="px-2 py-0.5 rounded-full text-[8px] bg-slate-950 border border-slate-800 text-slate-500 uppercase font-black tracking-tighter">{u.role}</span>
                                </div>
                                <div className="col-span-2 flex flex-wrap gap-2">
                                    {u.subscriptions?.map((s: any) => {
                                        const targetApp = apps.find(a => a.id === s.appId);
                                        return (
                                            <button 
                                                key={s.id} 
                                                onClick={() => setManagingSub(u)}
                                                className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all flex flex-col items-start"
                                            >
                                                <span>{s.type.replace(/_/g, ' ')}</span>
                                                {targetApp && <span className="text-[7px] opacity-60 normal-case font-medium">{targetApp.name}</span>}
                                            </button>
                                        );
                                    }) || <span className="text-slate-600 italic text-[9px]">No Active Plans</span>}
                                    {!hasSub && (
                                        <button 
                                            onClick={() => setManagingSub(u)}
                                            className="p-1 px-2 border border-emerald-500/10 text-emerald-500/30 hover:border-emerald-500 hover:text-emerald-400 rounded-lg text-[8px] font-black uppercase"
                                        >
                                            + Grant Access
                                        </button>
                                    )}
                                </div>
                                <div className="hidden lg:block">
                                    {sub && (
                                        <div className="flex flex-col">
                                            <p className="text-[9px] text-white font-bold">{new Date(sub.expiryDate).toLocaleDateString()}</p>
                                            <p className="text-[7px] uppercase font-black text-emerald-500/50">Expiring in {Math.ceil((new Date(sub.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => onChat(u.id)}
                                        className="w-8 h-8 rounded-lg border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {managingSub && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-emerald-500/20 p-8 rounded-3xl w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Manage Access</h3>
                            <p className="text-xs text-slate-500 mb-6">User: <span className="text-emerald-400">{managingSub.email}</span></p>
                            
                            <div className="space-y-4">
                                <section>
                                    <h4 className="text-[9px] uppercase font-black text-slate-600 mb-3 tracking-[0.2em] flex items-center gap-2">
                                        <Ban className="w-3 h-3" /> Terminate Access
                                    </h4>
                                    <button 
                                        onClick={() => modifySub(managingSub.id, 'unsubscribe')}
                                        className="w-full py-3 border border-red-500/30 text-red-500 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        Expire All Subscriptions
                                    </button>
                                </section>

                                <div className="h-px bg-slate-800 my-2" />

                                <section>
                                    <h4 className="text-[9px] uppercase font-black text-slate-600 mb-3 tracking-[0.2em] flex items-center gap-2">
                                        <PackageCheck className="w-3 h-3" /> Grant Subscription (Free)
                                    </h4>
                                    
                                    {/* App Selection for app-specific plans */}
                                    {userApps.length > 0 && (
                                        <div className="mb-4 bg-slate-950 p-4 rounded-2xl border border-emerald-500/10">
                                            <p className="text-[8px] uppercase font-black text-slate-600 mb-2 tracking-widest">Select target app (Optional)</p>
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={() => setSelectedAppId(null)}
                                                    className={cn(
                                                        "text-left p-3 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2",
                                                        selectedAppId === null ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-500 border border-slate-800"
                                                    )}
                                                >
                                                    <Shield className="w-3 h-3" /> User-wide (All Apps)
                                                </button>
                                                {userApps.map(app => (
                                                    <button 
                                                        key={app.id}
                                                        onClick={() => setSelectedAppId(app.id)}
                                                        className={cn(
                                                            "text-left p-3 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2",
                                                            selectedAppId === app.id ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-500 border border-slate-800"
                                                        )}
                                                    >
                                                        <Layout className="w-3 h-3" /> {app.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {[
                                            'master_new_app', 
                                            'audit_new_project', 
                                            'premium_access',
                                            'unlimited_entries_1m',
                                            'unlimited_entries_6m',
                                            'unlimited_entries_12m'
                                        ].map(type => (
                                            <button 
                                                key={type}
                                                onClick={() => modifySub(managingSub.id, 'grant', type)}
                                                className="w-full py-3 bg-slate-950 border border-emerald-500/10 hover:border-emerald-500 text-emerald-400 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-left px-4 flex justify-between items-center"
                                            >
                                                {type.replace(/_/g, ' ')}
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <button 
                                    onClick={() => setManagingSub(null)}
                                    className="w-full py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function OwnerChats() {
    const { user } = useAuth();
    const [summaries, setSummaries] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchSummaries = (activeId?: string) => {
        if (!user?.id) return;
        const currentActive = activeId || selectedUser || "";
        const param = currentActive ? `&activePartnerId=${currentActive}` : "";
        fetch(`/api/owner/chats/summary?ownerId=system_owner${param}`).then(r => r.json()).then(setSummaries);
    };

    const fetchMessages = (otherId: string) => {
        if (!user?.id) return;
        fetch(`/api/chats/system_owner?otherId=${otherId}`).then(r => r.json()).then(setMessages);
    };

    useEffect(() => {
        if (user?.id) {
            fetchSummaries();
            const interval = setInterval(() => fetchSummaries(), 5000);
            return () => clearInterval(interval);
        }
    }, [user, selectedUser]);

    useEffect(() => {
        const check = (window as any).selectChatUser;
        if (check) {
            setSelectedUser(check);
            fetchMessages(check);
            fetchSummaries(check);
            delete (window as any).selectChatUser;
        }
    }, [summaries]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser);
            const interval = setInterval(() => fetchMessages(selectedUser), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !inputText.trim()) return;
        
        const res = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: 'system_owner',
                receiverId: selectedUser,
                text: inputText
            })
        });
        
        if (res.ok) {
            const newMsg = await res.json();
            setMessages([...messages, newMsg]);
            setInputText("");
            fetchSummaries();
        }
    };

    return (
        <div className="h-full flex gap-6">
            {/* User List */}
            <div className="w-80 bg-slate-900/50 border border-emerald-900/20 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-emerald-900/10">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-500" /> Contacts
                    </h3>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                    {summaries.length === 0 ? (
                        <div className="p-8 text-center text-[10px] uppercase font-bold text-slate-700 italic">No communication logs found.</div>
                    ) : (
                        summaries.map(s => (
                            <button
                                key={s.userId}
                                onClick={() => setSelectedUser(s.userId)}
                                className={cn(
                                    "w-full p-6 text-left border-b border-emerald-900/5 transition-all relative group",
                                    selectedUser === s.userId ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"
                                )}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                        <p className={cn("text-xs font-black uppercase tracking-tight truncate", selectedUser === s.userId ? "text-emerald-400" : "text-white")}>{s.name}</p>
                                    </div>
                                    <span className={cn(
                                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest shrink-0 shadow-sm",
                                        s.role === 'admin' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    )}>
                                        {s.role}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 truncate font-medium group-hover:text-slate-400">{s.lastMessage}</p>
                                {s.timestamp && s.timestamp !== "1970-01-01T00:00:00.000Z" && (
                                    <p className="text-[8px] text-slate-700 mt-2 font-black uppercase tracking-widest">{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                )}
                                {selectedUser === s.userId && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-emerald-500 rounded-l-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Box */}
            <div className="flex-1 bg-slate-900/50 border border-emerald-900/20 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                {selectedUser ? (
                    <>
                        <div className="p-6 border-b border-emerald-900/10 bg-slate-950/30 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-bold uppercase tracking-widest text-xs">{summaries.find(s => s.userId === selectedUser)?.name}</p>
                                    <p className="text-[9px] text-emerald-500/50 uppercase font-black">Encrypted Channel Active</p>
                                </div>
                            </div>
                        </div>
                        
                        <div ref={scrollRef} className="flex-1 overflow-auto p-8 space-y-6 custom-scrollbar">
                            {messages.map((m, idx) => {
                                const isOwner = m.senderId === user?.id;
                                return (
                                    <div key={m.id} className={cn("flex flex-col", isOwner ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed",
                                            isOwner 
                                                ? "bg-emerald-600 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-emerald-900/10" 
                                                : "bg-slate-800 text-white rounded-tl-none border border-slate-700"
                                        )}>
                                            {m.text}
                                        </div>
                                        <span className="text-[8px] uppercase font-black text-slate-600 mt-2 tracking-widest">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={sendMessage} className="p-6 bg-slate-950/30 border-t border-emerald-900/10">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Type encrypted message..."
                                    className="w-full bg-slate-900 border border-emerald-900/20 rounded-2xl p-5 pr-20 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-700 font-medium"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <button 
                                    type="submit"
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 text-slate-950 rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center group"
                                >
                                    <Send className="w-5 h-5 group-active:scale-90 transition-transform" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 group">
                        <MessageSquare className="w-20 h-20 mb-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-emerald-500">Select channel to initiate uplink</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SystemRequestsList({ onChat }: { onChat: (id: string) => void }) {
    const [pending, setPending] = useState<any[]>([]);
    const [apps, setApps] = useState<AppInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConverterApp, setSelectedConverterApp] = useState<any | null>(null);
    const [showConverterModal, setShowConverterModal] = useState(false);

    const fetchData = async () => {
        const [pendingRes, appsRes] = await Promise.all([
            fetch('/api/admin/payments/pending'),
            fetch('/api/owner/apps')
        ]);
        setPending(await pendingRes.json());
        setApps(await appsRes.json());
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const approve = async (id: string) => {
        const res = await fetch('/api/admin/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: id })
        });
        if (res.ok) {
            fetchData();
        }
    };

    return (
        <div className="h-full flex flex-col space-y-8">
            <div className="bg-slate-900/50 border border-emerald-900/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl p-8">
                <div className="pb-6 border-b border-emerald-900/10 flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-500" /> Pending Approval Stack
                    </h3>
                </div>
                
                <div>
                    {loading ? (
                        <div className="h-32 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                    ) : pending.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-800">
                            <History className="w-12 h-12 mb-2 opacity-5" />
                            <p className="text-[10px] uppercase font-black tracking-widest">Incoming stream quiet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {pending.map(p => {
                                const app = apps.find(a => a.id === p.appId);
                                return (
                                    <div key={p.id} className="bg-slate-950/50 border border-emerald-900/10 p-6 rounded-3xl hover:border-emerald-500/50 transition-all group flex flex-col shadow-xl">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">
                                                    {p.type.replace(/_/g, ' ')}
                                                </h4>
                                                <p className="text-[9px] text-slate-600 font-bold">UTR: {p.utr}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-white">₹{p.amountINR}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-emerald-900/10 mb-6 space-y-3 text-left">
                                            {app && (
                                                <div className="flex flex-col gap-1 pb-2 border-b border-emerald-900/10">
                                                    <span className="text-[8px] uppercase font-black text-emerald-500/50">Target App:</span>
                                                    <p className="text-[10px] text-white font-bold">{app.name}</p>
                                                    <p className="text-[9px] text-blue-400 font-mono truncate">{app.link}</p>
                                                    {app.playStoreAppLink && (
                                                        <div className="mt-1 pt-1 border-t border-emerald-900/5">
                                                            <span className="text-[7px] uppercase font-black text-amber-400 block mb-0.5">App Play Store Link</span>
                                                            <p className="text-[9px] text-yellow-400 font-mono truncate">{app.playStoreAppLink}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {p.playStoreAppLink && (!app || app.playStoreAppLink !== p.playStoreAppLink) && (
                                                <div className="flex flex-col gap-1 pb-2 border-b border-emerald-900/10 text-left">
                                                    <span className="text-[8px] uppercase font-black text-amber-400">Shareable App Link:</span>
                                                    <p className="text-[10px] text-yellow-400 font-mono truncate">{p.playStoreAppLink}</p>
                                                </div>
                                            )}

                                            {(p.playStoreAppLink || app?.playStoreAppLink) && (
                                                <button
                                                    onClick={() => {
                                                        const targetLink = p.playStoreAppLink || app?.playStoreAppLink || "";
                                                        const mockAppObj = app ? { ...app, playStoreAppLink: targetLink } : {
                                                            id: p.appId || "direct_link_" + p.id,
                                                            name: "Direct Submitter App",
                                                            playStoreAppLink: targetLink,
                                                            link: targetLink
                                                        };
                                                        setSelectedConverterApp(mockAppObj);
                                                        setShowConverterModal(true);
                                                    }}
                                                    className="w-full text-center py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:border-amber-500/50 rounded-xl text-[8.5px] font-black uppercase tracking-widest transition-all mt-1 flex items-center justify-center gap-1"
                                                >
                                                    <Terminal className="w-3 h-3" /> Convert Link for Play Store
                                                </button>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] uppercase font-black text-slate-700 tracking-widest">User ID:</span>
                                                <span className="text-[9px] text-emerald-500 font-bold">{p.userId.slice(0,10)}...</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] uppercase font-black text-slate-700 tracking-widest">Timestamp:</span>
                                                <span className="text-[9px] text-slate-500 font-bold">{new Date(p.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-auto">
                                            <button 
                                                onClick={() => onChat(p.userId)}
                                                className="flex-1 py-3 border border-emerald-500/10 hover:border-emerald-500 hover:text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" /> Chat
                                            </button>
                                            <button 
                                                onClick={() => approve(p.id)}
                                                className="flex-[2] py-4 bg-emerald-600 text-slate-950 hover:bg-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve Request
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Play Store Listing Directory */}
                <div className="mt-12 border-t border-emerald-950/20 pt-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Grid3X3 className="w-4 h-4 text-emerald-500" /> Play Store Listing Registry
                    </h3>
                    {loading ? (
                        <div className="h-20 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                    ) : apps.filter(a => a.playStoreAppLink).length === 0 ? (
                        <div className="bg-slate-900/20 border border-dashed border-emerald-950/10 p-8 rounded-2xl text-center text-slate-500 text-xs">
                            No apps have set a Play Store target link yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {apps.filter(a => a.playStoreAppLink).map(app => (
                                <div key={app.id} className="bg-slate-950/30 border border-emerald-950/20 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 transition-all">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">{app.name}</h4>
                                            <span className={cn(
                                                "text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest",
                                                app.onPlayStore 
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            )}>
                                                {app.onPlayStore ? "Published" : "Pending Registry"}
                                            </span>
                                        </div>
                                        <div className="space-y-1 bg-slate-900/40 rounded-xl p-3 border border-emerald-955/10 mb-4">
                                            <span className="text-[8px] font-black uppercase text-slate-500">Target Link</span>
                                            <p className="text-[10px] text-blue-400 font-mono truncate">{app.playStoreAppLink}</p>
                                            
                                            <span className="text-[8px] font-black uppercase text-slate-500 block pt-1">Default Link</span>
                                            <p className="text-[10px] text-slate-400 font-mono truncate">{app.link}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mt-2">
                                        <button 
                                            onClick={() => {
                                                setSelectedConverterApp(app);
                                                setShowConverterModal(true);
                                            }}
                                            className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Terminal className="w-3.5 h-3.5" /> Convert / Format Link
                                        </button>
                                        
                                        <button 
                                            onClick={async () => {
                                                const newStatus = !app.onPlayStore;
                                                const res = await fetch(`/api/apps/${app.id}/approval`, {
                                                    method: "PUT",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ onPlayStore: newStatus })
                                                });
                                                if (res.ok) {
                                                    fetchData();
                                                }
                                            }}
                                            className={cn(
                                                "w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 text-slate-950",
                                                app.onPlayStore 
                                                ? "bg-amber-500 hover:bg-amber-400" 
                                                : "bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/10"
                                            )}
                                        >
                                            <PackageCheck className="w-3.5 h-3.5" /> 
                                            {app.onPlayStore ? "Mark Pending Review" : "Mark Published/Live"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showConverterModal && selectedConverterApp && (
                <LinkConverterModal 
                    app={selectedConverterApp} 
                    onClose={() => {
                        setShowConverterModal(false);
                        setSelectedConverterApp(null);
                    }} 
                />
            )}
        </div>
    );
}

function LinkConverterModal({ app, onClose }: { app: any; onClose: () => void }) {
    const [activeSubTab, setActiveSubTab] = useState<'pwa' | 'cli' | 'deeplink' | 'xml'>('pwa');
    const [copied, setCopied] = useState(false);

    const triggerCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Extract cleanest package name
    const cleanPackage = `com.audit.app_${app.id}`;
    const cleanName = app.name.replace(/[^a-zA-Z0-9 ]/g, "");
    
    // Extract simple host for assetlinks.json
    let extractedHost = "your-app-domain.com";
    try {
        if (app.playStoreAppLink) {
            const urlObj = new URL(app.playStoreAppLink);
            extractedHost = urlObj.hostname;
        }
    } catch(e) {}

    const assetLinksJSON = JSON.stringify([{
        "relation": ["delegate_permission/common.handle_all_urls"],
        "target": {
            "namespace": "android_app",
            "package_name": cleanPackage,
            "sha256_cert_fingerprints": ["FA:C6:17:45:DC:09:03:78:6C:B9:ED:E6:2A:96:2B:3F:9F:3F:D1:F4:14:1D:A2:FB:4B:CF:E2:8A:E2:01:E1:9C"]
        }
    }], null, 2);

    const bubblewrapCmd = `npx @bubblewrap/cli init --manifest=${app.playStoreAppLink || app.link}/manifest.json --package=${cleanPackage} --name="${cleanName}"`;

    const playStoreConsoleUrl = `https://play.google.com/store/apps/details?id=${cleanPackage}`;
    const deepLinkIntent = `intent://${extractedHost}/#Intent;scheme=https;package=${cleanPackage};end`;

    const cordovaXML = `<?xml version='1.0' encoding='utf-8'?>
<widget id="${cleanPackage}" version="1.0.0">
    <name>${cleanName}</name>
    <description>Auditing Web App Wrapped for Android App Store</description>
    <content src="${app.playStoreAppLink || app.link}" />
    <allow-navigation href="${app.playStoreAppLink || app.link}/*" />
    <preference name="Scheme" value="https" />
    <preference name="Orientation" value="portrait" />
</widget>`;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-emerald-500/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-slate-300">
                <div className="p-6 border-b border-emerald-900/10 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <h4 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-emerald-500" /> Google Play Conversion Studio
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">Ready-made registration formats for <span className="text-emerald-400">{app.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-1 px-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 rounded-lg text-xs font-bold uppercase transition-all">
                        Close
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="bg-slate-950/20 border-b border-emerald-900/10 flex text-[9px] uppercase font-black tracking-wider text-slate-500 overflow-x-auto">
                    <button 
                        onClick={() => setActiveSubTab('pwa')} 
                        className={cn("px-6 py-4 border-b-2 transition-all shrink-0", activeSubTab === 'pwa' ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-transparent hover:text-slate-300")}
                    >
                        TWA Assetlinks (PWA)
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('cli')} 
                        className={cn("px-6 py-4 border-b-2 transition-all shrink-0", activeSubTab === 'cli' ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-transparent hover:text-slate-300")}
                    >
                        Bubblewrap CLI
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('deeplink')} 
                        className={cn("px-6 py-4 border-b-2 transition-all shrink-0", activeSubTab === 'deeplink' ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-transparent hover:text-slate-300")}
                    >
                        Store Direct DeepLinks
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('xml')} 
                        className={cn("px-6 py-4 border-b-2 transition-all shrink-0", activeSubTab === 'xml' ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-transparent hover:text-slate-300")}
                    >
                        Capacitor / Cordova XML
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1 bg-slate-950/20 max-h-[400px] overflow-auto">
                    {activeSubTab === 'pwa' && (
                        <div className="space-y-4">
                            <div className="bg-slate-950 p-4 border border-emerald-900/5 rounded-2xl">
                                <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Target Hosting Directory</span>
                                <code className="text-xs text-blue-400 font-mono select-all">https://{extractedHost}/.well-known/assetlinks.json</code>
                            </div>
                            <div className="relative">
                                <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">assetlinks.json File Content</span>
                                <pre className="bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-2xl overflow-x-auto border border-emerald-900/5 leading-relaxed text-left">
                                    {assetLinksJSON}
                                </pre>
                                <button 
                                    onClick={() => triggerCopy(assetLinksJSON)}
                                    className="absolute top-8 right-3 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    {copied ? "Copied!" : "Copy JSON"}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-550 font-bold leading-relaxed">
                                Standard digital asset link verification. Upload the above JSON at the specified path on your server to link this PWA app to your package name <span className="bg-slate-950 font-mono text-slate-400 px-1 py-0.5 rounded">{cleanPackage}</span> so the web page opens without the Chrome browser address frame.
                            </p>
                        </div>
                    )}
                    
                    {activeSubTab === 'cli' && (
                        <div className="space-y-4">
                            <span className="text-[8px] font-black uppercase text-slate-500 block">Init Command for Native APK Compilation via Google CLI Tool</span>
                            <div className="relative">
                                <pre className="bg-slate-950 text-blue-400 font-mono text-[11px] p-5 rounded-2xl overflow-x-auto border border-emerald-900/5 leading-relaxed text-wrap text-left break-all whitespace-pre-wrap">
                                    {bubblewrapCmd}
                                </pre>
                                <button 
                                    onClick={() => triggerCopy(bubblewrapCmd)}
                                    className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    {copied ? "Copied!" : "Copy Command"}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-550 font-bold leading-relaxed">
                                Bubblewrap makes it easy to generate an Android App Bundle (AABs / APKs) directly using Node.js. Run this command inside your terminal build pipeline to output a Google Play Store compatible package.
                            </p>
                        </div>
                    )}
                    
                    {activeSubTab === 'deeplink' && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Standard Play Store Link</span>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={playStoreConsoleUrl} 
                                            className="flex-1 bg-slate-950 text-xs font-mono p-3 border border-emerald-900/5 rounded-xl outline-none text-blue-400"
                                        />
                                        <button 
                                            onClick={() => triggerCopy(playStoreConsoleUrl)}
                                            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap"
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Android App Direct Intent Link</span>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={deepLinkIntent} 
                                            className="flex-1 bg-slate-950 text-xs font-mono p-3 border border-emerald-900/5 rounded-xl outline-none text-blue-400"
                                        />
                                        <button 
                                            onClick={() => triggerCopy(deepLinkIntent)}
                                            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap"
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-550 font-bold leading-relaxed">
                                Deep links are ideal for marketing/social media platforms to open the play store download screen directly or trigger an inline redirect event.
                            </p>
                        </div>
                    )}
                    
                    {activeSubTab === 'xml' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">config.xml Configuration Block</span>
                                <pre className="bg-slate-950 text-amber-500 font-mono text-[11px] p-4 rounded-2xl overflow-x-auto border border-emerald-900/5 leading-relaxed text-left block">
                                    {cordovaXML}
                                </pre>
                                <button 
                                    onClick={() => triggerCopy(cordovaXML)}
                                    className="absolute top-8 right-3 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    {copied ? "Copied!" : "Copy XML"}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-550 font-bold leading-relaxed">
                                Paste this configuration block in your Capacitor / Apache Cordova project's `<code className="font-mono bg-slate-950 text-slate-400 px-1 py-0.5 rounded">config.xml</code>` configuration tree to automatically bundle this app into a hybrid WebView wrapper.
                            </p>
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-slate-950/50 border-t border-emerald-900/10 flex justify-between items-center text-[10px] font-bold text-slate-600">
                    <span>Generated dynamically inside Owner Matrix</span>
                    <span className="text-emerald-500 animate-pulse font-mono">● ACTIVE CONVERTER</span>
                </div>
            </div>
        </div>
    );
}
