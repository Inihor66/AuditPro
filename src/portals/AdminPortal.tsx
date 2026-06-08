import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuditForm, UserRole, Subscription, SubscriptionType } from '../types';
import { 
    Inbox, 
    Hourglass, 
    Activity, 
    User, 
    MessageCircle, 
    Printer, 
    Plus, 
    Info, 
    CheckCircle, 
    Trash2,
    FileText,
    MessageSquare,
    ArrowRight,
    ArrowLeft,
    Phone,
    Globe,
    Clock,
    ShieldCheck,
    Share2,
    ExternalLink,
    Database,
    Zap,
    QrCode,
    Monitor,
    Shield,
    Paperclip,
    Download
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function AdminPortal() {
  const { user } = useAuth();
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
    { name: 'Firm Requests', icon: Inbox, path: '/admin' },
    { name: 'Pending Audits', icon: Hourglass, path: '/admin/pending' },
    { name: 'Ongoing Audits', icon: Activity, path: '/admin/ongoing' },
    { name: 'Subscription', icon: User, path: '/admin/subscription' },
    { name: 'Chatting', icon: MessageCircle, path: '/admin/chats' },
  ];

  const currentPathName = menuItems.find(m => m.path === location.pathname)?.name || 'Control';

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 cursor-alias group select-none" onClick={handleSecretClick}>
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center font-bold text-slate-900 shadow-lg group-active:scale-95 transition-transform">A</div>
            <h1 className="text-white font-bold text-lg tracking-tight uppercase text-amber-500">Admin Panel</h1>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-amber-500 text-slate-900 shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-amber-500 transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Admin</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-900">{currentPathName}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Super Admin</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center font-bold text-amber-600 border border-amber-100">
                {user?.name?.[0].toUpperCase()}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<FirmRequests />} />
            <Route path="/pending" element={<AdminPending />} />
            <Route path="/ongoing" element={<AdminOngoing />} />
            <Route path="/subscription" element={<AdminSubscription />} />
            <Route path="/chats" element={<AdminChats />} />
          </Routes>
        </div>
        
        <footer className="bg-white border-t border-slate-200 h-10 flex items-center justify-between px-8 text-[10px] text-slate-400 uppercase tracking-widest shrink-0">
          <div>System: Online</div>
          <div className="flex gap-6">
            <span>Admin Mode</span>
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
                className={`bg-slate-900 p-8 rounded-3xl w-full max-w-sm border-2 transition-colors ${error ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-amber-500/30'}`}
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-500/20">
                        <ShieldSVG className="w-8 h-8" />
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
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-white font-mono tracking-[1em] focus:ring-2 focus:ring-amber-500 outline-none transition-all"
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
                            className="flex-1 py-3 bg-amber-500 text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-900/20"
                        >
                            Authenticate
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

const ShieldSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

function FirmRequests() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<AuditForm[]>([]);
    const [editing, setEditing] = useState<AuditForm | null>(null);
    const [newFields, setNewFields] = useState<{ label: string; value: string }[]>([]);
    const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = () => {
        if (!user?.appId) return;
        fetch(`/api/admin/forms?appId=${user.appId}`).then(r => r.json()).then(data => {
            setRequests(data.filter((f: any) => f.status === 'pending'));
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        const res = await fetch(`/api/admin/forms/${editing.id}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                adminPayment: editing.adminPayment,
                adminTerms: editing.adminTerms,
                hiddenFields: hiddenKeys,
                customFields: newFields
             })
        });
        if (res.ok) {
            setEditing(null);
            fetchRequests();
            alert("Audit approved and visible to students!");
        } else {
            const err = await res.json();
            if (err.error === 'LIMIT_EXCEEDED') {
                alert(err.message);
            }
        }
    };

    const addField = () => setNewFields([...newFields, { label: '', value: '' }]);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Audit Request Queue</h2>
                    <p className="text-slate-500 font-medium">Review and refine audits before student dispatch.</p>
                </div>
                <div className="bg-amber-100 px-4 py-2 rounded-full border border-amber-200">
                    <span className="text-[10px] uppercase font-black text-amber-700 tracking-widest">{requests.length} New Requests</span>
                </div>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="h-64 flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Scanning Uplink...</div>
                ) : requests.length === 0 ? (
                    <div className="bg-white p-24 text-center rounded-[3rem] border-4 border-dashed border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Inbox className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Quiet on the front</h3>
                        <p className="text-slate-400 mt-2">No new firm requests found at this altitude.</p>
                    </div>
                ) : (
                    requests.map(f => (
                        <div key={f.id} className="bg-white p-8 rounded-[2rem] shadow-sm flex justify-between items-center border border-slate-200 hover:border-amber-400 transition-all group hover:shadow-xl hover:shadow-amber-900/5">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shadow-lg">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">{f.auditLocation}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">{f.firmName}</p>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <p className="text-xs text-slate-400 font-medium">{formatCurrency(f.payment, 'INR')} Offered</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setEditing(f);
                                    setHiddenKeys([]);
                                    setNewFields([]);
                                }}
                                className="px-8 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/10 active:scale-95"
                            >
                                Open Review
                            </button>
                        </div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {editing && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 z-50">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white p-10 rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative"
                        >
                            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Audit Formulation</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Refining request for <span className="text-amber-500">{editing.auditLocation}</span></p>
                                </div>
                                <button onClick={() => setEditing(null)} className="w-12 h-12 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                                    <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto pr-4 custom-scrollbar">
                                <div className="grid lg:grid-cols-3 gap-12">
                                    {/* Left: Original Form */}
                                    <div className="space-y-8">
                                        <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Source Data (Hide if needed)</h4>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Firm Name', key: 'firmName', val: editing.firmName },
                                                { label: 'Email', key: 'firmEmail', val: editing.firmEmail },
                                                { label: 'Phone', key: 'firmPhone', val: editing.firmPhone },
                                                { label: 'Assignment Duration', key: 'duration', val: editing.duration || 'Not specified' },
                                                { label: 'Payment Offered', key: 'payment', val: formatCurrency(editing.payment, 'INR') },
                                                { label: 'Date', key: 'auditDate', val: editing.auditDate },
                                                { label: 'Terms', key: 'terms', val: editing.terms }
                                            ].map(item => (
                                                <div key={item.key} className={cn(
                                                    "p-4 rounded-2xl border-2 transition-all flex justify-between items-center",
                                                    hiddenKeys.includes(item.key) ? "bg-slate-50 border-slate-200 grayscale opacity-50" : "bg-white border-slate-100"
                                                )}>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-slate-400">{item.label}</p>
                                                        <p className="text-sm font-bold text-slate-800 mt-1">{item.val}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setHiddenKeys(prev => prev.includes(item.key) ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                                            hiddenKeys.includes(item.key) ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900"
                                                        )}
                                                    >
                                                        {hiddenKeys.includes(item.key) ? "Unhide" : "Hide"}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Center & Right: Admin Overrides */}
                                    <div className="lg:col-span-2">
                                        <form className="space-y-10" onSubmit={handleApprove}>
                                            <section className="space-y-6">
                                                <h4 className="text-[10px] text-amber-500 uppercase font-black tracking-[0.2em]">Student View Overrides</h4>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block px-2">Student Payout (₹ INR)</label>
                                                        <div className="relative">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                                                            <input 
                                                                type="number" 
                                                                min="0"
                                                                value={editing.adminPayment || 0} 
                                                                onChange={e => {
                                                                    const val = Math.max(0, Number(e.target.value));
                                                                    setEditing({...editing, adminPayment: val});
                                                                }} 
                                                                onKeyDown={e => {
                                                                    if (e.key === '-' || e.key === 'e' || e.key === '+') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                className="w-full p-4 pl-8 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-black text-2xl transition-all" 
                                                                required 
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block px-2">Audit Terms & Conditions</label>
                                                        <textarea 
                                                            value={editing.adminTerms || ''} 
                                                            onChange={e => setEditing({...editing, adminTerms: e.target.value})} 
                                                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl h-20 focus:border-amber-500 outline-none font-medium text-sm transition-all" 
                                                            placeholder="Custom rules for this assignment..." 
                                                        />
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="text-[10px] text-blue-500 uppercase font-black tracking-[0.2em]">Required Student Form Fields</h4>
                                                        <p className="text-[9px] text-slate-400 font-bold block mt-1">Configure custom parameters to be requested from students (e.g. GST ID, PAN Card, Prior Marks)</p>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={addField}
                                                        className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" /> Add Form Field
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {newFields.map((f, i) => (
                                                        <div key={i} className="flex gap-3">
                                                            <input 
                                                                placeholder="Form Field Label (e.g. PAN card, CGPA)"
                                                                className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs uppercase"
                                                                value={f.label}
                                                                onChange={e => {
                                                                    const next = [...newFields];
                                                                    next[i].label = e.target.value;
                                                                    setNewFields(next);
                                                                }}
                                                            />
                                                            <input 
                                                                placeholder="Instruction / Initial Value (Optional)"
                                                                className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs"
                                                                value={f.value}
                                                                onChange={e => {
                                                                    const next = [...newFields];
                                                                    next[i].value = e.target.value;
                                                                    setNewFields(next);
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                    {newFields.length === 0 && <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center py-8 border-2 border-dashed border-slate-50 rounded-2xl italic">No custom fields added</p>}
                                                </div>
                                            </section>

                                            <div className="pt-6">
                                                <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center group">
                                                    <CheckCircle className="w-6 h-6 mr-3 text-amber-500 group-hover:scale-125 transition-transform" /> 
                                                    Approve & Publish to Student Dashboard
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AdminPending() {
    const { user } = useAuth();
    const [forms, setForms] = useState<AuditForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAudit, setSelectedAudit] = useState<AuditForm | null>(null);

    const fetchForms = () => {
        if (!user?.appId) return;
        fetch(`/api/admin/forms?appId=${user.appId}`).then(r => r.json()).then(data => {
            setForms(data.filter((f: any) => f.status === 'approved_by_admin'));
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this approved audit from the marketplace?")) return;
        const res = await fetch(`/api/admin/forms/${id}`, { method: 'DELETE' });
        if (res.ok) fetchForms();
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Marketplace</h2>
                <p className="text-slate-500 font-medium">Audits approved but not yet claimed by students.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="md:col-span-2 h-64 flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Querying database...</div>
                ) : forms.length === 0 ? (
                    <div className="md:col-span-2 bg-white p-24 text-center rounded-[3rem] border-4 border-dashed border-slate-100 shadow-sm">
                        <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">Queue is Empty</h3>
                        <p className="text-slate-400 mt-2">All approved audits have been picked by students.</p>
                    </div>
                ) : (
                    forms.map(f => (
                        <div key={f.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                             <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div className="bg-slate-100 px-3 py-1 rounded-full">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Available</span>
                                </div>
                             </div>
                             <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-amber-600 transition-colors">{f.auditLocation}</h3>
                             <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Payer: {f.firmName}</span>
                                    <span className="text-slate-900">{formatCurrency(f.payment, 'INR')}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Payout: Student</span>
                                    <span className="text-emerald-500">{formatCurrency(f.adminPayment || 0, 'INR')}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Schedule</span>
                                    <span className="text-slate-900">{f.auditDate}</span>
                                </div>
                                {f.duration && (
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Duration</span>
                                        <span className="text-indigo-600">{f.duration}</span>
                                    </div>
                                )}
                             </div>
                             <div className="flex gap-3">
                                <button 
                                    onClick={() => setSelectedAudit(f)}
                                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Full View
                                </button>
                                <button 
                                    onClick={() => handleDelete(f.id)}
                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                             </div>
                        </div>
                    ))
                )}
            </div>

            <AuditDetailModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
        </div>
    );
}

function AdminOngoing() {
    const { user } = useAuth();
    const [forms, setForms] = useState<AuditForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAudit, setSelectedAudit] = useState<AuditForm | null>(null);

    const fetchForms = () => {
        if (!user?.appId) return;
        fetch(`/api/admin/forms?appId=${user.appId}`).then(r => r.json()).then(data => {
            setForms(data.filter((f: any) => f.status === 'ongoing'));
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchForms();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this ongoing audit? This action is permanent.")) return;
        const res = await fetch(`/api/admin/forms/${id}`, { method: 'DELETE' });
        if (res.ok) fetchForms();
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Operations</h2>
                <p className="text-slate-500 font-medium">Real-time status of all ongoing audits in the field.</p>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    <div className="h-64 flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tracking assets...</div>
                ) : forms.length === 0 ? (
                    <div className="bg-white p-24 text-center rounded-[3rem] border-4 border-dashed border-slate-100 shadow-sm">
                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">No Active Audits</h3>
                        <p className="text-slate-400 mt-2 text-sm">Assign audits from the queue to start tracking operations.</p>
                    </div>
                ) : (
                    forms.map(f => (
                        <div key={f.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl transition-all group flex flex-col md:flex-row justify-between items-center gap-6">
                             <div className="flex items-center gap-6 flex-1 w-full">
                                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-100 shrink-0">
                                    <Activity className="w-8 h-8" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-black text-slate-900 truncate tracking-tight">{f.auditLocation}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight truncate">Firm: <span className="text-slate-900">{f.firmName}</span></p>
                                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-tight truncate">Partner: <span className="text-blue-600">{f.studentName || 'Unknown'}</span></p>
                                        <p className="text-[9px] text-slate-400 font-medium truncate">{f.studentEmail}</p>
                                        <p className="text-[9px] text-slate-400 font-medium truncate">{f.studentPhone}</p>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                                 <button 
                                    onClick={() => setSelectedAudit(f)}
                                    className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                                 >
                                    Dashboard
                                 </button>
                                 <button 
                                    onClick={() => handleDelete(f.id)}
                                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                 >
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                             </div>
                        </div>
                    ))
                )}
            </div>

            <AuditDetailModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
        </div>
    );
}

function AuditDetailModal({ audit, onClose }: { audit: AuditForm | null, onClose: () => void }) {
    if (!audit) return null;

    const [groupChatEnabled, setGroupChatEnabled] = useState(audit.groupChatEnabled || false);

    useEffect(() => {
        setGroupChatEnabled(audit.groupChatEnabled || false);
    }, [audit]);

    const handleToggleGroupChat = async () => {
        try {
            const newStatus = !groupChatEnabled;
            const res = await fetch(`/api/forms/${audit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupChatEnabled: newStatus })
            });
            if (res.ok) {
                setGroupChatEnabled(newStatus);
                audit.groupChatEnabled = newStatus; // update locally
            }
        } catch (e) {
            console.error("Error toggling group chat:", e);
        }
    };

    const createWhatsAppGroup = () => {
        if (!audit.firmPhone || !audit.studentPhone) {
            alert("Contact numbers missing to initiate group creation.");
            return;
        }

        const sanitizePhoneForWa = (phone: string): string => {
            const cleanNumbers = phone.replace(/\D/g, '');
            if (cleanNumbers.length === 10) {
                return `91${cleanNumbers}`;
            }
            return cleanNumbers;
        };

        const firmWaLink = `https://wa.me/${sanitizePhoneForWa(audit.firmPhone)}`;
        const studentWaLink = `https://wa.me/${sanitizePhoneForWa(audit.studentPhone)}`;

        const msgText = `*Audit Connectivity Group Linkage*\n` +
            `*Location:* ${audit.auditLocation}\n\n` +
            `*1. Client Firm:* ${audit.firmName}\n` +
            `📞 Phone: ${audit.firmPhone}\n` +
            `🔗 Direct Chat/Add Link: ${firmWaLink}\n\n` +
            `*2. Student Partner:* ${audit.studentName}\n` +
            `📞 Phone: ${audit.studentPhone}\n` +
            `🔗 Direct Chat/Add Link: ${studentWaLink}\n\n` +
            `*Admin:* Verified Controller\n\n` +
            `_Click on the links above inside WhatsApp to directly open chat, add them to your contacts, or select them to add into your group chat even if their numbers are not saved._`;

        const msg = encodeURIComponent(msgText);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
        alert("WhatsApp broadcast link generated and opened. Share it to easily connect with both participants.");
    };

    const printInvoice = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const finalAmount = formatCurrency(audit.adminPayment || audit.payment || 0, 'INR');
        const formattedDate = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const html = `
            <html>
                <head>
                    <title>Bill of Supply - Ref: ${audit.id.toUpperCase()}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap');
                        
                        body { 
                            font-family: 'Inter', sans-serif; 
                            padding: 40px; 
                            color: #0f172a; 
                            background: #ffffff;
                            margin: 0;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .invoice-card { 
                            max-width: 850px; 
                            margin: 0 auto; 
                            border: 2px solid #e2e8f0; 
                            padding: 40px; 
                            border-radius: 24px;
                            position: relative;
                        }
                        
                        .bill-headers {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            border-bottom: 3px double #cbd5e1;
                            padding-bottom: 24px;
                            margin-bottom: 24px;
                        }
                        
                        .company-identity {
                            display: flex;
                            flex-direction: column;
                        }
                        .app-title {
                            font-family: 'Space Grotesk', sans-serif;
                            font-weight: 700;
                            font-size: 24px;
                            letter-spacing: -0.03em;
                            color: #1e293b;
                            text-transform: uppercase;
                        }
                        .sub-identity {
                            font-size: 10px;
                            font-weight: 800;
                            text-transform: uppercase;
                            color: #64748b;
                            letter-spacing: 0.15em;
                            margin-top: 4px;
                        }
                        .invoice-badge-container {
                            text-align: right;
                        }
                        .invoice-badge {
                            font-family: 'Space Grotesk', sans-serif;
                            font-weight: 700;
                            font-size: 28px;
                            color: #0f172a;
                            letter-spacing: -0.02em;
                            text-transform: uppercase;
                            margin: 0;
                        }
                        .invoice-ref {
                            font-size: 11px;
                            font-weight: 700;
                            color: #64748b;
                            margin-top: 4px;
                        }

                        .meta-details-grid {
                            display: grid;
                            grid-template-cols: repeat(4, 1fr);
                            gap: 16px;
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 16px;
                            padding: 16px;
                            margin-bottom: 32px;
                        }
                        .meta-item {
                            display: flex;
                            flex-direction: column;
                        }
                        .meta-lbl {
                            font-size: 9px;
                            font-weight: 800;
                            text-transform: uppercase;
                            color: #94a3b8;
                            letter-spacing: 0.05em;
                            margin-bottom: 4px;
                        }
                        .meta-val {
                            font-size: 13px;
                            font-weight: 700;
                            color: #1e293b;
                        }

                        .parties-grid {
                            display: grid;
                            grid-template-cols: 1fr 1fr;
                            gap: 40px;
                            margin-bottom: 32px;
                        }
                        .party-box {
                            border: 1px solid #e2e8f0;
                            border-radius: 16px;
                            padding: 20px;
                            background: #ffffff;
                        }
                        .party-title {
                            font-size: 10px;
                            font-weight: 800;
                            text-transform: uppercase;
                            color: #0284c7;
                            letter-spacing: 0.1em;
                            margin-bottom: 12px;
                            border-bottom: 1px solid #f1f5f9;
                            padding-bottom: 8px;
                        }
                        .party-name {
                            font-size: 15px;
                            font-weight: 700;
                            color: #0f172a;
                            margin-bottom: 4px;
                        }
                        .party-meta {
                            font-size: 12px;
                            color: #475569;
                            margin: 2px 0;
                        }

                        .items-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 32px;
                        }
                        .items-table th {
                            background: #f1f5f9;
                            font-size: 10px;
                            font-weight: 800;
                            text-transform: uppercase;
                            color: #334155;
                            letter-spacing: 0.05em;
                            padding: 12px 16px;
                            text-align: left;
                            border-bottom: 2px solid #cbd5e1;
                        }
                        .items-table td {
                            padding: 16px;
                            font-size: 13px;
                            color: #334155;
                            border-bottom: 1px solid #e2e8f0;
                        }
                        .items-table tr {
                            page-break-inside: avoid;
                        }
                        
                        .amount-summary-container {
                            display: flex;
                            justify-content: flex-end;
                            margin-top: 16px;
                            page-break-inside: avoid;
                        }
                        .amount-summary-box {
                            width: 320px;
                            border: 2px solid #0f172a;
                            border-radius: 16px;
                            overflow: hidden;
                        }
                        .summary-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 12px 16px;
                            font-size: 12px;
                            font-weight: 500;
                            color: #475569;
                            background: #ffffff;
                        }
                        .summary-row.grand-total {
                            background: #0f172a;
                            color: #ffffff;
                            font-weight: 800;
                            font-size: 15px;
                            border-top: 1px solid #475569;
                        }

                        .stamp-container {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-top: 48px;
                            padding-top: 24px;
                            border-top: 1px dashed #cbd5e1;
                            page-break-inside: avoid;
                        }
                        .declaration-text {
                            font-size: 10px;
                            color: #64748b;
                            max-width: 450px;
                            line-height: 1.5;
                        }
                        .seal-badge {
                            border: 3px double #10b981;
                            color: #10b981;
                            font-family: 'Space Grotesk', sans-serif;
                            font-weight: 700;
                            font-size: 11px;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            padding: 8px 16px;
                            border-radius: 8px;
                            transform: rotate(-3deg);
                            display: inline-block;
                        }

                        .footer { 
                            margin-top: 60px; 
                            text-align: center; 
                            font-size: 11px; 
                            color: #94a3b8; 
                            font-weight: 600; 
                            text-transform: uppercase; 
                            letter-spacing: 0.1em; 
                            border-top: 1px solid #f1f5f9;
                            padding-top: 20px;
                        }

                        @media print {
                            body { padding: 0; }
                            .invoice-card { border: none; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-card">
                        
                        <!-- Header Section -->
                        <div class="bill-headers">
                            <div class="company-identity">
                                <span class="app-title">AuditMaster Corporate</span>
                                <span class="sub-identity">Independent Compliance Registry</span>
                            </div>
                            <div class="invoice-badge-container">
                                <h1 class="invoice-badge">Bill of Supply</h1>
                                <p class="invoice-ref">INVOICE NO: <strong>${audit.id.toUpperCase()}</strong></p>
                            </div>
                        </div>

                        <!-- Meta Info bar -->
                        <div class="meta-details-grid">
                            <div class="meta-item">
                                <span class="meta-lbl">Date of Issue</span>
                                <span class="meta-val">${formattedDate}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-lbl">Scheduled Date</span>
                                <span class="meta-val">${audit.auditDate || '-'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-lbl">Service SAC Code</span>
                                <span class="meta-val">SAC 998311</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-lbl">Verification Status</span>
                                <span class="meta-val" style="color:#059669; text-transform:uppercase;">${audit.status}</span>
                            </div>
                        </div>

                        <!-- Parties section -->
                        <div class="parties-grid">
                            <div class="party-box">
                                <p class="party-title">Billed To (Client Firm)</p>
                                <p class="party-name">${audit.firmName}</p>
                                <p class="party-meta"><strong>Email:</strong> ${audit.firmEmail || '-'}</p>
                                <p class="party-meta"><strong>Phone:</strong> ${audit.firmPhone || '-'}</p>
                            </div>
                            <div class="party-box">
                                <p class="party-title">Service Provider (Student Partner)</p>
                                <p class="party-name">${audit.studentName || 'NOT ASSIGNED / PENDING'}</p>
                                <p class="party-meta"><strong>Email:</strong> ${audit.studentEmail || '-'}</p>
                                <p class="party-meta"><strong>Phone:</strong> ${audit.studentPhone || '-'}</p>
                                ${audit.studentQualification ? `<p class="party-meta"><strong>Qualification:</strong> ${audit.studentQualification}</p>` : ''}
                            </div>
                        </div>

                        <!-- Itemization details -->
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th style="width: 8%;">S.No</th>
                                    <th>Description of Service</th>
                                    <th style="width: 25%;">Audit Execution Location</th>
                                    <th style="text-align: right; width: 22%;">Total Value (INR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="font-weight: 700;">01</td>
                                    <td>
                                        <strong>Professional Verification & Compliance Audit Assignment</strong>
                                        <div style="font-size: 11px; color:#64748b; margin-top:4px;">
                                            Audit coverage code: Registry Master ${audit.id.substring(0,6).toUpperCase()}
                                        </div>
                                    </td>
                                    <td>
                                        <span style="font-weight: 700; text-transform: uppercase;">${audit.auditLocation}</span>
                                    </td>
                                    <td style="text-align: right; font-weight: 700;">
                                        ${finalAmount}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Lower Right Summary totals -->
                        <div class="amount-summary-container">
                            <div class="amount-summary-box">
                                <div class="summary-row">
                                    <span>Assessable Payout Subtotal</span>
                                    <strong>${finalAmount}</strong>
                                </div>
                                <div class="summary-row">
                                    <span>Taxes / IGST (0.00%)</span>
                                    <strong>₹0.00</strong>
                                </div>
                                <div class="summary-row grand-total">
                                    <span>Total Amount Payable</span>
                                    <span>${finalAmount}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Stamp and terms -->
                        <div class="stamp-container">
                            <div class="declaration-text">
                                <p style="font-weight:700; margin-bottom: 4px; color:#1e293b;">Declaration & System Clauses</p>
                                <span>This is a computer-generated digital billing document initialized under compliance terms. Value stated reflects authorized parameters agreed upon by both client firm and assigned partner. Subject to offline tax clearance where applicable.</span>
                            </div>
                            <div class="seal-badge">
                                Verified Digitally
                            </div>
                        </div>

                        <div class="footer">
                            <p>Thank you for partnering with AuditMaster Infrastructure</p>
                            <p style="margin-top: 8px; font-size: 10px; color:#cbd5e1;">Secured Registry Code: ${audit.id.toUpperCase()}</p>
                        </div>
                    </div>
                    <script type="text/javascript">
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-white/20"
            >
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-slate-900 font-bold shadow-xl">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase">{audit.auditLocation}</h3>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest leading-none">Job ID: {audit.id.toUpperCase()}</p>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    audit.status === 'ongoing' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                                )}>
                                    {audit.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={printInvoice}
                            className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-white/5"
                        >
                            <Printer className="w-4 h-4" /> Print Invoice
                        </button>
                        <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                            <Plus className="w-6 h-6 rotate-45" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-12 space-y-12 bg-slate-50/30 custom-scrollbar">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Section 1: Firm Submission (The Original) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                                <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Client Submission</h4>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                                <div><p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Company Name</p><p className="font-bold text-slate-900 text-lg">{audit.firmName}</p></div>
                                <div><p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Contact Point</p><p className="font-bold text-slate-800">{audit.firmEmail}</p><p className="text-xs text-slate-400 mt-0.5">{audit.firmPhone}</p></div>
                                <div><p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Budget Offered</p><p className="font-black text-slate-900 text-2xl">{formatCurrency(audit.payment, 'INR')}</p></div>
                                {audit.duration && (
                                    <div><p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Duration of Assignment</p><p className="font-bold text-slate-900 text-lg">{audit.duration}</p></div>
                                )}
                                <div><p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Original Terms</p><p className="text-sm text-slate-500 italic leading-relaxed">"{audit.terms}"</p></div>
                            </div>
                        </div>

                        {/* Section 2: Admin Directives (The Overrides) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <h4 className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Admin Overrides</h4>
                            </div>
                            <div className="bg-amber-50/30 p-8 rounded-[2.5rem] shadow-sm border border-amber-100 space-y-6">
                                <div><p className="text-[9px] font-bold text-amber-300 uppercase tracking-widest mb-1">Target Payout</p><p className="font-black text-amber-600 text-2xl">{formatCurrency(audit.adminPayment || 0, 'INR')}</p></div>
                                <div><p className="text-[9px] font-bold text-amber-300 uppercase tracking-widest mb-1">Privacy Filter</p><p className="text-xs font-bold text-amber-700">{audit.hiddenFields?.length || 0} fields masked for student</p></div>
                                <div><p className="text-[9px] font-bold text-amber-300 uppercase tracking-widest mb-1">Added Logic</p>
                                    <div className="mt-2 space-y-2">
                                        {audit.customFields?.map((cf: any, i: number) => (
                                            <div key={i} className="flex justify-between text-xs p-2 bg-white rounded-lg border border-amber-100">
                                                <span className="font-bold text-slate-400 uppercase text-[9px]">{cf.label}</span>
                                                <span className="font-black text-slate-900">{cf.value}</span>
                                            </div>
                                        )) || <p className="text-[10px] text-slate-400 italic">No extra logic attached</p>}
                                    </div>
                                </div>
                                <div><p className="text-[9px] font-bold text-amber-300 uppercase tracking-widest mb-1">Operational terms</p><p className="text-sm text-slate-600 font-medium leading-relaxed">{audit.adminTerms || "Default compliance requirements apply."}</p></div>
                            </div>
                        </div>

                        {/* Section 3: Student Intake (The Partner) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h4 className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Execution Partner</h4>
                            </div>
                            <div className={cn(
                                "p-8 rounded-[2.5rem] shadow-sm border space-y-6",
                                audit.studentId ? "bg-white border-blue-50" : "bg-slate-50 border-slate-100 opacity-50 grayscale"
                            )}>
                                {audit.studentId ? (
                                    <>
                                        <div><p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Assigned Partner</p><p className="font-bold text-slate-900 text-lg">{audit.studentName}</p></div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Credentials</p>
                                            <p className="font-bold text-slate-800">{audit.studentEmail}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{audit.studentPhone}</p>
                                            {audit.studentQualification && (
                                                <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-2 uppercase tracking-wide">
                                                    CA Qualification: {audit.studentQualification}
                                                </p>
                                            )}
                                            {audit.customFields && audit.customFields.length > 0 && (
                                                <div className="mt-4 border-t border-slate-100 pt-3 space-y-2">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Questionnaire Answers</p>
                                                    <div className="space-y-1.5">
                                                        {audit.customFields.map((cf, i) => (
                                                            <div key={i} className="flex justify-between items-center text-[11px] p-2 bg-slate-50 border border-slate-100 rounded-xl">
                                                                <span className="font-bold text-slate-500 uppercase text-[9px]">{cf.label}</span>
                                                                <span className="font-extrabold text-slate-900">{cf.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div><p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Agreed Schedule</p><p className="font-bold text-slate-900">{audit.auditDate}</p></div>
                                        <div className="pt-4 flex flex-col gap-3">
                                            <button 
                                                onClick={createWhatsAppGroup}
                                                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
                                            >
                                                <Share2 className="w-4 h-4" /> WhatsApp Connect
                                            </button>
                                            
                                            {!groupChatEnabled ? (
                                                <button 
                                                    onClick={handleToggleGroupChat}
                                                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                                                >
                                                    <MessageSquare className="w-4 h-4" /> इन-ऐप ग्रुप चैट बनाएं (Create Group Chat)
                                                </button>
                                            ) : (
                                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-left">
                                                    <p className="text-[10px] text-emerald-800 font-extrabold uppercase mb-1">✓ इन-ऐप ग्रुप चैट एक्टिव है</p>
                                                    <p className="text-[9px] text-slate-500 leading-normal font-bold mb-3">अब Admin, Student Partner और Client तीनों इस ग्रुप में बातचीत कर सकते हैं। यह आटोमेटिक क्रिएट नहीं होता है, केवल तभी एक्टिव होता है जब एडमिन इसे एनेबल करता है।</p>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={handleToggleGroupChat}
                                                            className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-650 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all"
                                                        >
                                                            ग्रुप चैट बंद करें
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                alert("चैटिंग मेनू (Communication / Chatting Tab) में जाकर इस ग्रुप में मैसेज करें।");
                                                            }}
                                                            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[9px] uppercase tracking-wider transition-all text-center"
                                                        >
                                                            Open Chat
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <button 
                                                onClick={() => {
                                                    alert("Use the 'Chatting' tab to message this partner directly.");
                                                }}
                                                className="w-full py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Direct Messages
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-64 flex flex-col items-center justify-center text-center">
                                        <Clock className="w-12 h-12 text-slate-200 mb-4" />
                                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Waiting for partner...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-10">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-amber-500">
                                <Activity className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black tracking-tight uppercase">Operational Logs</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit status: {audit.status.toUpperCase()}</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                             <div className="text-right hidden md:block">
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Last Sync</p>
                                <p className="text-sm font-bold text-white">{new Date().toLocaleTimeString()}</p>
                             </div>
                             <div className="w-1 px-4 border-l border-white/10 hidden md:block"></div>
                             <button className="px-8 py-4 bg-emerald-500/10 text-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                                View Snapshot
                             </button>
                         </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function AdminChats() {
    const { user } = useAuth();
    const [summaries, setSummaries] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [owner, setOwner] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [attachedFile, setAttachedFile] = useState<{ name: string, type: string, data: string } | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const triggerDownload = (filename: string, filedata: string) => {
        const link = document.createElement('a');
        link.href = filedata;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setAttachedFile({
                name: file.name,
                type: file.type,
                data: reader.result as string
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    useEffect(() => {
        if (!user?.id || !user?.appId) return;
        fetch(`/api/admin/${user.appId}/chats/summary?adminId=${user.id}`)
            .then(r => r.json())
            .then(data => {
                setSummaries(data);
                setLoading(false);
            });
            
        // Fetch App Owner (Master) for direct chatting as help
        fetch(`/api/admin/${user.appId}/owner`)
            .then(r => r.json())
            .then(data => {
                if (data.id) {
                    setOwner({ 
                        id: data.id, 
                        name: "System Support (Master)", 
                        role: "OWNER", 
                        email: data.email,
                        isOwner: true 
                    });
                }
            });
    }, [user]);

    useEffect(() => {
        if (!selectedUser || !user?.id) return;
        const fetchMessages = () => {
            const partnerId = selectedUser.userId || selectedUser.id;
            fetch(`/api/chats/${user.id}?otherId=${partnerId}`)
                .then(r => r.json())
                .then(setMessages);
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [selectedUser, user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!inputText.trim() && !attachedFile) || !selectedUser || !user?.id) return;
        
        // Identify by user.id for all chats
        const senderId = user.id;
        const receiverId = selectedUser.userId || selectedUser.id;

        const res = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: senderId,
                receiverId: receiverId,
                text: inputText,
                fileName: attachedFile ? attachedFile.name : null,
                fileData: attachedFile ? attachedFile.data : null,
                fileType: attachedFile ? attachedFile.type : null
            })
        });
        if (res.ok) {
            setInputText("");
            setAttachedFile(null);
            const msg = await res.json();
            setMessages([...messages, msg]);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden shrink-0">
                <div className="p-6 border-b border-slate-50 bg-slate-900 text-white">
                    <h3 className="font-black uppercase tracking-widest text-xs">Direct Messages</h3>
                    <p className="text-[10px] text-amber-500 font-bold uppercase mt-1">Partners & Clients</p>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-2">
                    {owner && (
                        <button 
                            onClick={() => setSelectedUser({ userId: owner.id, name: "System Support (Owner)", role: UserRole.MASTER, email: owner.email, phone: owner.phone })}
                            className={cn(
                                "w-full p-4 rounded-2xl flex items-center gap-3 transition-all text-left mb-6 border-2 group",
                                selectedUser?.userId === owner.id ? "bg-slate-900 border-slate-900 shadow-xl" : "bg-blue-50 border-blue-100 hover:border-blue-400"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0",
                                selectedUser?.userId === owner.id ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
                            )}>
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className={cn("font-black text-xs uppercase tracking-widest", selectedUser?.userId === owner.id ? "text-blue-400" : "text-blue-600")}>Official Support</p>
                                <p className={cn("font-bold text-sm truncate", selectedUser?.userId === owner.id ? "text-white" : "text-slate-900")}>{owner.name}</p>
                            </div>
                        </button>
                    )}

                    {loading ? (
                        <div className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest animate-pulse">Syncing Uplink...</div>
                    ) : summaries.length === 0 ? (
                        <div className="py-12 text-center text-slate-300 text-xs italic">No participants found via your link.</div>
                    ) : (
                        summaries.map(s => (
                            <button 
                                key={s.userId}
                                onClick={() => setSelectedUser(s)}
                                className={cn(
                                    "w-full p-4 rounded-2xl flex items-center gap-3 transition-all text-left group",
                                    selectedUser?.userId === s.userId ? "bg-amber-500 text-slate-900 shadow-lg" : "hover:bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0",
                                    selectedUser?.userId === s.userId ? "bg-white/20" : "bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600"
                                )}>
                                    {(s.name || 'U')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm truncate">{s.name}</p>
                                        <span className={cn(
                                            "text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter",
                                            selectedUser?.userId === s.userId ? "bg-slate-900/10 text-slate-900" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {s.role}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-[10px] uppercase font-black truncate tracking-tight transition-colors",
                                        selectedUser?.userId === s.userId ? "text-slate-900/50" : "text-slate-400"
                                    )}>
                                        {s.lastMessage}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 font-black shadow-sm">
                                    {selectedUser.name[0].toUpperCase()}
                                </div>
                                <div className="leading-tight">
                                    <h4 className="font-black text-slate-900 text-lg tracking-tight">{selectedUser.name}</h4>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{selectedUser.role} • {selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-10 space-y-6 bg-slate-50/50 custom-scrollbar">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                                    <MessageSquare className="w-12 h-12 mb-3" />
                                    <p className="text-sm font-bold uppercase tracking-widest text-[10px]">No messages yet</p>
                                    <p className="text-xs mt-1">Initialize communication below.</p>
                                </div>
                            ) : (
                                messages.map(m => (
                                    <div key={m.id} className={cn(
                                        "flex",
                                        m.senderId === user?.id ? "justify-end" : "justify-start"
                                    )}>
                                        <div className={cn(
                                            "max-w-[70%] p-4 rounded-2xl text-sm font-medium shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2",
                                            m.senderId === user?.id 
                                                ? "bg-slate-900 text-white rounded-br-none" 
                                                : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                                        )}>
                                            {selectedUser.role === 'GROUP' && m.senderId !== user?.id && (
                                                <p className="text-[8px] font-black uppercase text-amber-600 mb-1">
                                                    {m.senderName || 'Participant'}
                                                </p>
                                            )}
                                            {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                                            {m.fileName && (
                                                <div className={cn(
                                                    "mt-2 p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-black",
                                                    m.senderId === user?.id ? "bg-white/10 text-white" : "bg-slate-50 text-slate-800 border border-slate-100"
                                                )}>
                                                    <div className="flex items-center gap-2 truncate">
                                                        <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                                                        <span className="truncate pr-2">{m.fileName}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => triggerDownload(m.fileName, m.fileData)}
                                                        className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer transition-colors shadow-sm shrink-0"
                                                        title="Download File"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                            <p className={cn(
                                                "text-[9px] mt-2 opacity-50 uppercase font-bold",
                                                m.senderId === user?.id ? "text-white/50" : "text-slate-400"
                                            )}>
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {attachedFile && (
                            <div className="mx-6 p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-inner">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                                    <span className="text-xs font-black text-slate-800 truncate">{attachedFile.name}</span>
                                </div>
                                <button 
                                    onClick={() => setAttachedFile(null)}
                                    className="p-1.5 rounded-full bg-amber-100 hover:bg-rose-500 hover:text-white text-slate-700 transition-colors cursor-pointer"
                                    title="Cancel Attach"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-4 shrink-0 items-center">
                            <input 
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-14 h-14 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer"
                                title="Attach File"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input 
                                className="flex-1 bg-slate-50 p-5 rounded-2xl outline-none border-2 border-transparent focus:border-amber-500 transition-all font-medium text-sm"
                                placeholder={`Say something to ${selectedUser.name}...`}
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                            />
                            <button 
                                type="submit"
                                className="w-14 h-14 bg-amber-500 text-slate-900 rounded-2xl flex items-center justify-center hover:bg-amber-400 transition-all active:scale-90 shadow-lg shadow-amber-900/10 shrink-0"
                            >
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30 select-none grayscale">
                        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                            <MessageCircle className="w-16 h-16 text-slate-300" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Communications Hub</h4>
                        <p className="text-sm font-bold mt-2 uppercase tracking-widest text-[10px]">Select a participant from the left to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function AdminSubscription() {
    const { user } = useAuth();
    const [sub, setSub] = useState<Subscription | null>(null);
    const [formCount, setFormCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paymentSession, setPaymentSession] = useState<any>(null);
    const [pendingTxn, setPendingTxn] = useState<any>(null);

    const checkStatus = async () => {
        try {
            const res = await fetch(`/api/admin/${user?.appId}/status`);
            const data = await res.json();
            setSub(data.subscription);
            setFormCount(data.formCount);
            
            // Check for pending verification transactions
            const txRes = await fetch(`/api/master/transactions`); // Note: In a real app this would be scoped to the current user
            const txData = await txRes.json();
            const myPending = txData.find((t: any) => t.userId === user?.id && t.status === 'pending_verification');
            setPendingTxn(myPending);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.appId) checkStatus();
    }, [user]);

    const handlePayment = async (plan: { type: SubscriptionType, price: number }) => {
        try {
            const res = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amountUSD: plan.price, 
                    type: plan.type,
                    appId: user?.appId,
                    userId: user?.id
                })
            });
            const data = await res.json();
            setPaymentSession({ ...data, plan });
        } catch (e) {
            alert("Failed to start payment.");
        }
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Database className="w-12 h-12 text-slate-200 animate-bounce" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Ledger...</p>
            </div>
        </div>
    );

    const plans: { type: SubscriptionType, label: string, price: number, duration: string }[] = [
        { type: 'unlimited_entries_1m', label: 'Pro Pilot', price: 4, duration: '1 Month' },
        { type: 'unlimited_entries_6m', label: 'Business Core', price: 22, duration: '6 Months' },
        { type: 'unlimited_entries_12m', label: 'Enterprise Elite', price: 46, duration: '1 Year' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Operational Bandwidth</h2>
                    <p className="text-slate-500 font-medium">Monitoring system utilization and enterprise tier status.</p>
                </div>
                <div className="text-right w-full md:w-auto">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resource Pool</p>
                    <div className="flex items-center justify-end gap-3 bg-white px-8 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <Database className="w-6 h-6 text-amber-500" />
                        <div>
                            <span className="text-3xl font-black text-slate-900 block leading-none">{sub?.isActive ? 'UNLIMITED' : `${Math.max(0, 800 - formCount)} / 800`}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Entries Remaining</span>
                        </div>
                    </div>
                </div>
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
                    <div className="px-6 py-2 bg-amber-200 text-amber-800 rounded-full font-black text-[10px] uppercase tracking-widest leading-none shrink-0">Pending Hub Approval</div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {plans.map(p => (
                    <div key={p.type} className={cn(
                        "bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl transition-all flex flex-col group relative overflow-hidden",
                        sub?.type === p.type ? "ring-4 ring-amber-500 border-amber-500" : "hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
                    )}>
                        {sub?.type === p.type && (
                            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 px-8 py-3 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest animate-pulse">Active Instance</div>
                        )}
                        {p.type === 'unlimited_entries_12m' && !sub?.isActive && (
                            <div className="absolute top-0 right-0 bg-slate-900 text-white px-8 py-3 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">Recommended</div>
                        )}
                        
                        <div className="mb-10">
                            <h3 className="text-2xl font-black text-slate-900 mb-1">{p.label}</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{p.duration} Unlimited Matrix</p>
                        </div>
                        
                        <div className="flex items-baseline gap-2 mb-10">
                            <span className="text-6xl font-black text-slate-900 tracking-tighter">${p.price}</span>
                            <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Global Payout</span>
                        </div>

                        <ul className="space-y-5 mb-12 flex-1">
                            {[
                                'Full Field Access',
                                'Priority Network Dispatch',
                                'Encryption Layer Enabled',
                                'Advanced Dashboard Suite',
                                'Zero Data Decay'
                            ].map(feat => (
                                <li key={feat} className="flex items-center gap-4 text-sm font-bold text-slate-600">
                                    <div className="w-6 h-6 rounded-2xl bg-slate-50 flex items-center justify-center text-amber-500 shrink-0 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                    {feat}
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => handlePayment(p)}
                            disabled={sub?.isActive && sub?.type === p.type}
                            className={cn(
                                "w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center shadow-2xl active:scale-95",
                                sub?.isActive && sub?.type === p.type 
                                    ? "bg-emerald-50 text-emerald-600 shadow-none cursor-default" 
                                    : "bg-slate-900 text-white hover:bg-slate-800"
                            )}
                        >
                            {sub?.isActive && sub?.type === p.type ? (
                                <><CheckCircle className="w-4 h-4 mr-2" /> Tier Active</>
                            ) : (
                                <><Zap className="w-4 h-4 mr-2" /> Initialize Uplink</>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/20 transition-all duration-1000"></div>
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-amber-500 border border-white/10 shadow-inner shrink-0 rotate-3 group-hover:rotate-12 transition-transform duration-500">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h4 className="text-2xl font-black text-white uppercase tracking-tight">Security Protocol Enforcement</h4>
                        <p className="text-slate-400 font-medium max-w-2xl">Financial packets are routed via deep-encrypted UPI channels. This infrastructure operates on a Zero-Trust architecture to safeguard your firm's operational intelligence.</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-8">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-6 opacity-30 invert hover:opacity-100 transition-opacity" alt="UPI" />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {paymentSession && (
                    <PaymentModal 
                        session={paymentSession} 
                        onClose={() => setPaymentSession(null)} 
                        onSuccess={() => {
                            setPaymentSession(null);
                            checkStatus();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function PaymentModal({ session, onClose, onSuccess }: { session: any, onClose: () => void, onSuccess: () => void }) {
    const [utr, setUtr] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [step, setStep] = useState<'scan' | 'verify'>('scan');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        try {
            const res = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId: session.transaction.id,
                    utr
                })
            });
            const data = await res.json();
            if (res.ok) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#F59E0B', '#10B981', '#3B82F6']
                });
                onSuccess();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert("Verification uplink failed.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 uppercase tracking-widest font-black text-[10px]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20 flex flex-col"
            >
                <div className="p-10 bg-slate-900 flex justify-between items-center text-white">
                    <div>
                        <h3 className="text-3xl tracking-tighter leading-none">SECURE UPLINK</h3>
                        <p className="text-amber-500 mt-2">TRANS_ID: {session.transaction.id.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                        <Plus className="w-6 h-6 rotate-45" />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="flex justify-center gap-1">
                        <div className={cn("px-6 py-2 rounded-full transition-all", step === 'scan' ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20" : "bg-slate-100 text-slate-400 grayscale")}>01. SCAN</div>
                        <div className="w-8 h-[2px] bg-slate-100 self-center"></div>
                        <div className={cn("px-6 py-2 rounded-full transition-all", step === 'verify' ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20" : "bg-slate-100 text-slate-400")}>02. VERIFY</div>
                    </div>

                    {step === 'scan' ? (
                        <div className="space-y-8 text-center">
                            <div className="bg-slate-50 p-10 rounded-[2.5rem] inline-block border-4 border-white shadow-xl">
                                <QRCodeCanvas value={session.upiLink} size={250} level="H" />
                            </div>
                            <div className="space-y-4">
                                <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl">
                                    <p className="text-2xl tracking-tighter mb-1">₹{session.transaction.amountINR.toLocaleString()}</p>
                                    <p className="text-amber-500 text-[8px] opacity-60">PLAN: {session.plan.label.toUpperCase()}</p>
                                </div>
                                <p className="text-slate-400 font-bold max-w-[250px] mx-auto leading-relaxed">Scan QR code with any UPI app to initiate transaction.</p>
                            </div>
                            <button 
                                onClick={() => setStep('verify')}
                                className="w-full py-6 bg-amber-500 text-slate-900 rounded-[2rem] hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/20 flex items-center justify-center group"
                            >
                                I HAVE PAID <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-8">
                            <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl relative overflow-hidden group/warn">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/warn:scale-150 transition-transform">
                                    <Shield className="w-12 h-12 text-red-600" />
                                </div>
                                <h4 className="text-red-600 flex items-center gap-2 mb-2 font-black">
                                    <Shield className="w-4 h-4" /> ANTI-FRAUD WARNING
                                </h4>
                                <p className="text-red-400 font-bold leading-tight normal-case italic"> Every UTR is checked against live bank statements. Submitting a fake or used UTR will result in <span className="text-red-600 underline">Permanent Portal Termination</span> without refund.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-slate-400 flex items-center gap-2 px-2">
                                    <Zap className="w-3.5 h-3.5 text-amber-500" /> 12-DIGIT TRANSACTION UTR / REF ID
                                </label>
                                <input 
                                    className="w-full bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 focus:border-amber-500 outline-none text-2xl tracking-[0.2em] font-mono text-center transition-all shadow-inner"
                                    placeholder="XXXXXXXXXXXX"
                                    required
                                    value={utr}
                                    onChange={e => setUtr(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                                    autoFocus
                                />
                                <p className="text-slate-400 font-bold leading-relaxed text-center px-4">Found in your Google Pay / PhonePe history after payment.</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button 
                                    type="submit"
                                    disabled={verifying || utr.length < 8}
                                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center disabled:opacity-50 disabled:grayscale"
                                >
                                    {verifying ? (
                                        <><Monitor className="w-4 h-4 mr-3 animate-pulse" /> SCANNING NETWORK...</>
                                    ) : (
                                        <><Shield className="w-4 h-4 mr-3" /> VERIFY UPLINK</>
                                    )}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setStep('scan')}
                                    className="py-4 text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    RETURN TO QR CODE
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
