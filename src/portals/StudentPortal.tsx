import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuditForm } from '../types';
import { 
    LayoutDashboard, 
    History, 
    MessageCircle, 
    MapPin, 
    DollarSign, 
    ArrowRight,
    Inbox,
    Calendar,
    MessageSquare,
    FileText,
    User as UserIcon,
    Paperclip,
    Download,
    Trash2
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function StudentPortal() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Assignments', icon: Inbox, path: '/student' },
    { name: 'My Projects', icon: History, path: '/student/history' },
    { name: 'Chatting', icon: MessageCircle, path: '/student/chats' },
  ];

  const currentPathName = menuItems.find(m => m.path === location.pathname)?.name || 'Delegate';

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center font-bold text-white shadow-lg">S</div>
            <h1 className="text-white font-bold text-lg tracking-tight uppercase text-emerald-400">Student Portal</h1>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-emerald-600 text-white shadow-md' 
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
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-emerald-500 transition-colors text-sm font-bold uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Student Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-900">{currentPathName}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Verified Student</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 border border-emerald-100">
                {user?.name?.[0].toUpperCase()}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/history" element={<StudentHistory />} />
            <Route path="/chats" element={<StudentChats />} />
          </Routes>
        </div>
        
        <footer className="bg-white border-t border-slate-200 h-10 flex items-center justify-between px-8 text-[10px] text-slate-400 uppercase tracking-widest shrink-0">
          <div>System: Online</div>
          <div className="flex gap-6">
            <span>Student Mode</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function StudentDashboard() {
    const { user } = useAuth();
    const [availableAudits, setAvailableAudits] = useState<AuditForm[]>([]);
    const [selected, setSelected] = useState<AuditForm | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [matchMyLocation, setMatchMyLocation] = useState(false);
    
    // Application Form state
    const [applyForm, setApplyForm] = useState({
        name: '',
        email: '',
        phone: '',
        qualification: ''
    });
    const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchAvailable = () => {
        if (!user?.appId) return;
        fetch(`/api/admin/forms?appId=${user.appId}`).then(r => r.json()).then(data => {
            setAvailableAudits(data.filter((f: any) => f.status === 'approved_by_admin'));
        });
    };

    useEffect(() => {
        fetchAvailable();
    }, [user]);

    // Autofill when a form is opened
    useEffect(() => {
        if (selected && user) {
            setApplyForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                qualification: ''
            });
            const intAnswers: Record<string, string> = {};
            if (selected.customFields) {
                selected.customFields.forEach(cf => {
                    intAnswers[cf.label] = cf.value || '';
                });
            }
            setCustomAnswers(intAnswers);
            setSuccessMessage(null);
        }
    }, [selected, user]);

    const filteredAudits = availableAudits.filter(f => {
        const matchesSearch = f.auditLocation.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             f.firmName.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (matchMyLocation && user?.location) {
            return matchesSearch && f.auditLocation.toLowerCase().includes(user.location.toLowerCase());
        }
        return matchesSearch;
    });

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected || !user) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/forms/${selected.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'ongoing',
                    studentId: user.id,
                    studentName: applyForm.name,
                    studentEmail: applyForm.email,
                    studentPhone: applyForm.phone,
                    studentQualification: applyForm.qualification,
                    customFields: selected.customFields?.map(cf => ({
                        label: cf.label,
                        value: customAnswers[cf.label] ?? ''
                    })) || [],
                    submittedAt: new Date().toISOString()
                 })
            });
            if (res.ok) {
                setSuccessMessage("Application submitted successfully! Your assignment is now active.");
                setTimeout(() => {
                    setSelected(null);
                    fetchAvailable();
                }, 2000);
            } else {
                alert("Could not apply for audit. Please try again.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to check if a field is hidden by admin
    const isHidden = (field: string) => selected?.hiddenFields?.includes(field);

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Audit Marketplace</h2>
                    <p className="text-slate-500 font-medium">Browse verify audits and claim assignments instantly.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                         <input 
                            placeholder="Search by location..."
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                         />
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                             <Inbox className="w-4 h-4" />
                         </div>
                    </div>
                    <button 
                        onClick={() => setMatchMyLocation(!matchMyLocation)}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-md",
                            matchMyLocation ? "bg-emerald-600 text-white shadow-emerald-950/10" : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-500"
                        )}
                    >
                        <MapPin className="w-4 h-4" /> {matchMyLocation ? 'Matching My Area' : 'Match My Location'}
                    </button>
                </div>
            </div>

            {/* Grid of approved audits */}
            <div className="grid md:grid-cols-2 gap-6">
                {filteredAudits.length === 0 ? (
                    <div className="col-span-full bg-white p-24 text-center rounded-[3rem] border-4 border-dashed border-slate-100">
                        <Inbox className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-900">No Audits Available</h3>
                        <p className="text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">Adjust your filters or location search to find open assignments in the system.</p>
                    </div>
                ) : (
                    filteredAudits.map(f => (
                        <div key={f.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col border-t-4 border-t-emerald-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-slate-900 text-xl tracking-tight group-hover:text-emerald-600 transition-colors uppercase">{f.auditLocation}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Available Audit Work</p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 ring-4 ring-emerald-50">
                                    <MapPin className="w-6 h-6" />
                                </div>
                            </div>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>Target Date: <span className="font-bold text-slate-900">{f.auditDate}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                    <span>Base Allocation: <span className="font-bold text-emerald-600">{formatCurrency(f.adminPayment || 0, 'INR')}</span></span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelected(f)}
                                className="mt-auto w-full py-4 bg-slate-905 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                            >
                                VIEW DETAILS / APPLY
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Detailed Form accepting / viewing Modal */}
            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden relative"
                        >
                            <div className="absolute top-6 right-6">
                                <button 
                                    onClick={() => setSelected(null)} 
                                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    ✕
                                </button>
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase italic text-center md:text-left">
                                Audit Details Form
                            </h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed text-center md:text-left">
                                Complete your applications with verified profile parameters for <span className="text-emerald-500 font-bold">{selected.auditLocation}</span>.
                            </p>

                            {successMessage ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-3xl text-center space-y-4 my-10"
                                >
                                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto shadow-lg">✓</div>
                                    <h4 className="text-xl font-black uppercase">Finalized!</h4>
                                    <p className="text-sm font-medium">{successMessage}</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleApply} className="space-y-8">
                                    {/* Core Information Section - displays unhidden firm data */}
                                    <div className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-3xl space-y-6">
                                        <h4 className="text-[10px] text-emerald-600 font-black uppercase tracking-widest border-b border-emerald-100 pb-2">Unhidden Client Specifications</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {!isHidden('firmName') && (
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Contact Point Name</p>
                                                    <p className="text-sm font-bold text-slate-800">{selected.firmName}</p>
                                                </div>
                                            )}
                                            {!isHidden('firmEmail') && (
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Contact Email Address</p>
                                                    <p className="text-sm font-bold text-slate-800 truncate">{selected.firmEmail}</p>
                                                </div>
                                            )}
                                            {!isHidden('firmPhone') && (
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Contact Phone</p>
                                                    <p className="text-sm font-bold text-slate-800">{selected.firmPhone}</p>
                                                </div>
                                            )}
                                            {!isHidden('payment') && (
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Estimated Client Budget</p>
                                                    <p className="text-sm font-bold text-slate-800 italic">{formatCurrency(selected.payment, 'INR')}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Audit Target Location</p>
                                                <p className="text-sm font-bold text-slate-800 uppercase">{selected.auditLocation}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Execution Scheduled Date</p>
                                                <p className="text-sm font-bold text-slate-800">{selected.auditDate}</p>
                                            </div>
                                            {!isHidden('creditPeriod') && (
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Settlement Window</p>
                                                    <p className="text-sm font-bold text-slate-800">{selected.creditPeriod} Days</p>
                                                </div>
                                            )}
                                        </div>

                                        {!isHidden('terms') && selected.terms && (
                                            <div className="pt-4 border-t border-slate-250">
                                                <p className="text-[9px] text-slate-400 font-black uppercase block mb-1">Company Guidelines / Terms</p>
                                                <p className="text-xs text-slate-500 italic bg-white p-4 rounded-2xl border border-slate-100 leading-relaxed">"{selected.terms}"</p>
                                            </div>
                                        )}

                                        {selected.customFields && selected.customFields.length > 0 && (
                                            <div className="pt-4 border-t border-slate-200 space-y-2">
                                                <p className="text-[9px] text-slate-400 font-black uppercase block mb-2">Requirement Specifications</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {selected.customFields.map((cf, idx) => (
                                                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-150/50">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase">{cf.label}</p>
                                                            <p className="text-xs font-bold text-slate-700 mt-0.5">{cf.value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin additions (Target Payout and added guidelines) */}
                                    <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h4 className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Administrative Assignment Provision</h4>
                                            <span className="bg-emerald-500/15 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/20">Official Allocator</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-black uppercase">Guaranteed Student Payout</p>
                                                <p className="text-3xl font-black text-emerald-400 italic mt-0.5">{formatCurrency(selected.adminPayment || 0, 'INR')}</p>
                                            </div>
                                            {selected.adminTerms && (
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Controller Instructions</p>
                                                    <p className="text-xs text-slate-350 italic leading-relaxed">"{selected.adminTerms}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Editable Student Application Space (autofilled but editable) */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            <h4 className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Your Credentials (Autofilled & Editable)</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pl-1 block">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                                                    value={applyForm.name} 
                                                    onChange={e => setApplyForm({...applyForm, name: e.target.value})} 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pl-1 block">Email Address</label>
                                                <input 
                                                    type="email" 
                                                    required 
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                                                    value={applyForm.email} 
                                                    onChange={e => setApplyForm({...applyForm, email: e.target.value})} 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pl-1 block">Phone Number</label>
                                                <input 
                                                    type="tel" 
                                                    required 
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                                                    value={applyForm.phone} 
                                                    onChange={e => setApplyForm({...applyForm, phone: e.target.value})} 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pl-1 block">Audit Qualification</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    placeholder="e.g. CA Inter, B.Com, MBA Auditor"
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm placeholder-slate-400"
                                                    value={applyForm.qualification} 
                                                    onChange={e => setApplyForm({...applyForm, qualification: e.target.value})} 
                                                />
                                            </div>

                                            {selected.customFields && selected.customFields.map((cf) => (
                                                <div className="space-y-2" key={cf.label}>
                                                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pl-1 block">
                                                        {cf.label}
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        required 
                                                        placeholder={cf.value || `Your response for ${cf.label}...`}
                                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm placeholder-slate-405 placeholder-slate-400 text-slate-900 font-black"
                                                        value={customAnswers[cf.label] ?? ''} 
                                                        onChange={e => setCustomAnswers({...customAnswers, [cf.label]: e.target.value})} 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Footers */}
                                    <div className="flex gap-4 pt-4 uppercase text-[10px] font-black tracking-widest">
                                        <button 
                                            type="button" 
                                            onClick={() => setSelected(null)} 
                                            className="flex-1 py-4 text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                        >
                                            Discard Close
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={submitting}
                                            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all active:scale-95"
                                        >
                                            {submitting ? "SUBMITTING..." : "SUBMIT & SECURE CODE"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StudentHistory() {
    const { user } = useAuth();
    const [forms, setForms] = useState<AuditForm[]>([]);
    const [selectedHistoryForm, setSelectedHistoryForm] = useState<AuditForm | null>(null);

    const fetchHistory = () => {
        if (!user?.id || !user?.appId || !user?.email) return;
        fetch(`/api/forms?studentId=${user.id}&studentEmail=${encodeURIComponent(user.email)}&appId=${user.appId}`).then(r => r.json()).then(setForms);
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const isHidden = (field: string) => selectedHistoryForm?.hiddenFields?.includes(field);

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight uppercase">Assigned Projects History</h2>
            <div className="grid gap-6">
                {forms.length === 0 ? (
                    <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-slate-350">
                         <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                         <h3 className="text-slate-900 font-bold">No Audits Claimed</h3>
                         <p className="text-slate-400 text-sm mt-2">Active or completed audit cycles will show up here.</p>
                    </div>
                ) : (
                    forms.map(f => (
                        <div 
                            key={f.id} 
                            onClick={() => setSelectedHistoryForm(f)}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="w-14 min-w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{f.auditLocation}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Registry Code: {f.id.toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between md:justify-end gap-10 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Scheduled</p>
                                    <p className="font-bold text-slate-900">{f.auditDate}</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Payout Allocation</p>
                                    <p className="font-black text-emerald-600">{formatCurrency(f.adminPayment || 0, 'INR')}</p>
                                </div>
                                <span className={cn(
                                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest",
                                    f.status === 'completed' ? "bg-slate-900 text-emerald-400" : "bg-emerald-600 text-white shadow"
                                )}>
                                    {f.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Read-only History Detail Modal */}
            <AnimatePresence>
                {selectedHistoryForm && (
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden relative text-left"
                        >
                            <div className="absolute top-6 right-6">
                                <button 
                                    onClick={() => setSelectedHistoryForm(null)} 
                                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    ✕
                                </button>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">
                                Registry Audit Record
                            </h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
                                JOB ID: {selectedHistoryForm.id.toUpperCase()} • STATUS: <span className="text-emerald-500 font-extrabold">{selectedHistoryForm.status.toUpperCase()}</span>
                            </p>

                            <div className="space-y-6">
                                {/* Core Firm Info */}
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1 pb-1 border-b border-slate-200">Company Assignment Metrics</p>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                                        {!isHidden('firmName') && (
                                            <div>
                                                <p className="text-[9px] text-slate-400 uppercase font-black">Company Name</p>
                                                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedHistoryForm.firmName}</p>
                                            </div>
                                        )}
                                        {!isHidden('firmEmail') && (
                                            <div>
                                                <p className="text-[9px] text-slate-400 uppercase font-black">Contact Email</p>
                                                <p className="font-bold text-slate-900 mt-0.5 truncate">{selectedHistoryForm.firmEmail}</p>
                                            </div>
                                        )}
                                        {!isHidden('firmPhone') && (
                                            <div>
                                                <p className="text-[9px] text-slate-400 uppercase font-black">Contact Phone</p>
                                                <p className="font-bold text-slate-900 mt-0.5">{selectedHistoryForm.firmPhone}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[9px] text-slate-400 uppercase font-black">Audit Location</p>
                                            <p className="font-bold text-slate-950 uppercase mt-0.5">{selectedHistoryForm.auditLocation}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 uppercase font-black">Scheduled Date</p>
                                            <p className="font-bold text-slate-900 mt-0.5">{selectedHistoryForm.auditDate}</p>
                                        </div>
                                        {!isHidden('creditPeriod') && (
                                            <div>
                                                <p className="text-[9px] text-slate-400 uppercase font-black">Credit Period</p>
                                                <p className="font-bold text-slate-900 mt-0.5">{selectedHistoryForm.creditPeriod} Days</p>
                                            </div>
                                        )}
                                    </div>
                                    {!isHidden('terms') && selectedHistoryForm.terms && (
                                        <div className="pt-2">
                                            <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Company Provisions</p>
                                            <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border leading-relaxed border-slate-100 font-medium italic">"{selectedHistoryForm.terms}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Controller Addition */}
                                <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-2">
                                    <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-1">Administrative Additions</p>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-medium">Claimed Payout (INR)</p>
                                            <p className="text-2xl font-black text-emerald-400 italic">{formatCurrency(selectedHistoryForm.adminPayment || 0, 'INR')}</p>
                                        </div>
                                        {selectedHistoryForm.adminTerms && (
                                            <div className="text-right max-w-xs">
                                                <p className="text-[10px] text-slate-450 font-medium">Directives</p>
                                                <p className="text-xs text-slate-300 italic">"{selectedHistoryForm.adminTerms}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Student Submitted parameters */}
                                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl space-y-4">
                                    <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest border-b border-emerald-100 pb-1">Your Submitted Credentials</p>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                                        <div>
                                            <p className="text-[9px] text-emerald-600/70 uppercase font-black">Your Name</p>
                                            <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedHistoryForm.studentName || 'Not Captured'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-emerald-600/70 uppercase font-black">Your Email</p>
                                            <p className="font-bold text-slate-900 mt-0.5">{selectedHistoryForm.studentEmail || 'Not Captured'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-emerald-600/70 uppercase font-black">Your Contact</p>
                                            <p className="font-bold text-slate-900 mt-0.5">{selectedHistoryForm.studentPhone || 'Not Captured'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-emerald-600/70 uppercase font-black">Qualification Submitted</p>
                                            <p className="font-black text-emerald-700 text-sm mt-0.5">{selectedHistoryForm.studentQualification || 'Not Captured'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setSelectedHistoryForm(null)} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors">
                                Close Record
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StudentChats() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [admin, setAdmin] = useState<any>(null);
    const [channels, setChannels] = useState<any[]>([]);
    const [activeChannel, setActiveChannel] = useState<any>(null); // { id: string, name: string, type: 'dm' | 'group' }
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

    // Load available channels (Direct DM with App Creator/Admin and Group Chats for claimed audits)
    useEffect(() => {
        if (!user) return;

        const loadModules = async () => {
            try {
                let adminData: any = null;
                let claimedForms: any[] = [];

                if (user.appId) {
                    try {
                        // 1. Fetch App Admin User
                        const adminRes = await fetch(`/api/admin/details?appId=${user.appId}`);
                        if (adminRes.ok) {
                            adminData = await adminRes.json();
                            setAdmin(adminData);
                        }
                    } catch (e) {
                        console.error("Error fetching admin details", e);
                    }

                    try {
                        // 2. Fetch Claimed Audits (ongoing) to populate group channels only if the Admin has explicitly created/enabled them
                        const formsRes = await fetch(`/api/forms?studentId=${user.id}&studentEmail=${encodeURIComponent(user.email)}&appId=${user.appId}`);
                        if (formsRes.ok) {
                            const data = await formsRes.json();
                            claimedForms = data.filter((f: any) => f.status === 'ongoing' && f.groupChatEnabled === true);
                        }
                    } catch (e) {
                        console.error("Error fetching claimed forms", e);
                    }
                }

                // Compile channels list
                const list: any[] = [];
                
                // Direct DM with Admin is ALWAYS added as a default/fallback channel!
                const finalAdminId = adminData?.id || "admin";
                const finalAdminName = adminData?.name ? `${adminData.name} (Admin)` : "System Admin";
                list.push({
                    id: finalAdminId,
                    name: finalAdminName,
                    desc: "Direct message with sub-app controller",
                    type: 'dm'
                });

                claimedForms.forEach((f: any) => {
                    list.push({
                        id: `group_${f.id}`,
                        name: `${f.auditLocation} Group`,
                        desc: "Multi-user coordination group",
                        type: 'group'
                    });
                });

                setChannels(list);

                // Set default channel as Admin DM if not set
                setActiveChannel(current => {
                    if (!current && list.length > 0) {
                        return list[0];
                    }
                    return current;
                });
            } catch (err) {
                console.error("Error loading chat context: ", err);
            } finally {
                setLoading(false);
            }
        };

        loadModules();
        const mainInterval = setInterval(loadModules, 7000);
        return () => clearInterval(mainInterval);
    }, [user]);

    // Fetch messages for active channel
    useEffect(() => {
        if (!user?.id || !activeChannel) return;

        const fetchMessages = () => {
            fetch(`/api/chats/${user.id}?otherId=${activeChannel.id}`)
                .then(r => r.json())
                .then(data => {
                    setMessages(data);
                })
                .catch(err => console.error("Error fetching chats: ", err));
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [activeChannel, user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!inputText.trim() && !attachedFile) || !activeChannel || !user?.id) return;
        
        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user.id,
                    receiverId: activeChannel.id,
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
                setMessages(prev => [...prev, msg].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
            }
        } catch (err) {
            console.error("Failed to send message: ", err);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest animate-pulse">
                Establishing direct security channels...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col md:flex-row gap-6">
            {/* Chats Sidebar */}
            <div className="w-full md:w-80 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col shrink-0 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-2">Security Channels</h3>
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {channels.length === 0 ? (
                        <p className="text-xs text-slate-350 italic text-center py-10">No channels found</p>
                    ) : (
                        channels.map(chan => {
                            const isActive = activeChannel?.id === chan.id;
                            return (
                                <button
                                    key={chan.id}
                                    onClick={() => setActiveChannel(chan)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-2xl transition-all duration-200 flex flex-col gap-1 border",
                                        isActive 
                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                                            : "bg-slate-50 border-slate-100 hover:bg-slate-100/50 text-slate-800"
                                    )}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-black text-xs uppercase tracking-tight truncate max-w-[85%]">
                                            {chan.name}
                                        </span>
                                        <span className={cn(
                                            "text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-tighter",
                                            chan.type === 'group' 
                                                ? (isActive ? "bg-emerald-500 text-slate-950" : "bg-emerald-100 text-emerald-800")
                                                : (isActive ? "bg-indigo-400 text-slate-950" : "bg-indigo-50 text-indigo-700")
                                        )}>
                                            {chan.type}
                                        </span>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] truncate w-full",
                                        isActive ? "text-slate-400" : "text-slate-400"
                                    )}>
                                        {chan.desc}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Conversation window */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col min-w-0">
                {activeChannel ? (
                    <>
                        {/* Conversation Header */}
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                                    activeChannel.type === 'group' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                                )}>
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-slate-900 text-md uppercase tracking-tight">{activeChannel.name}</h4>
                                    </div>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none mt-1">
                                        {activeChannel.type === 'group' ? "Firm + Controller coordinate space" : `Sub-app Controller • ${admin?.name}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Message Stream */}
                        <div className="flex-1 overflow-auto p-8 space-y-6 bg-slate-50/50 custom-scrollbar">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-305 opacity-60 text-slate-300 py-12">
                                    <MessageSquare className="w-12 h-12 mb-3" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure pipeline open</p>
                                    <p className="text-[10px] mt-1 text-slate-400">Initialize conversation.</p>
                                </div>
                            ) : (
                                messages.map(m => {
                                    const isMe = m.senderId === user?.id;
                                    return (
                                        <div key={m.id} className={cn(
                                            "flex w-full",
                                            isMe ? "justify-end" : "justify-start"
                                        )}>
                                            <div className={cn(
                                                "max-w-[75%] p-4 rounded-2xl text-sm shadow-sm transition-all",
                                                isMe 
                                                    ? "bg-slate-900 text-white rounded-br-none font-bold" 
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-bl-none font-medium"
                                            )}>
                                                {activeChannel.type === 'group' && !isMe && (
                                                    <p className="text-[8px] font-black uppercase text-emerald-600 mb-1">
                                                        {m.senderName || (m.senderId === admin?.id ? 'Admin/Controller' : 'Firm/Company')}
                                                    </p>
                                                )}
                                                {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                                                {m.fileName && (
                                                    <div className={cn(
                                                        "mt-2 p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-black",
                                                        isMe ? "bg-white/10 text-white" : "bg-slate-50 text-slate-800 border border-slate-100"
                                                    )}>
                                                        <div className="flex items-center gap-2 truncate">
                                                            <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                                                            <span className="truncate pr-2">{m.fileName}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => triggerDownload(m.fileName, m.fileData)}
                                                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shadow-sm shrink-0"
                                                            title="Download File"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                                <p className={cn(
                                                    "text-[8px] mt-1.5 opacity-50 font-bold",
                                                    isMe ? "text-slate-300" : "text-slate-400"
                                                )}>
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {attachedFile && (
                            <div className="mx-6 p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-inner">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="w-5 h-5 text-emerald-600 shrink-0 animate-pulse" />
                                    <span className="text-xs font-black text-slate-800 truncate">{attachedFile.name}</span>
                                </div>
                                <button 
                                    onClick={() => setAttachedFile(null)}
                                    className="p-1.5 rounded-full bg-emerald-100 hover:bg-rose-500 hover:text-white text-slate-700 transition-colors cursor-pointer"
                                    title="Cancel Attach"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Input Footer */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-4 shrink-0 items-center">
                            <input 
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer"
                                title="Attach File"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input 
                                className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all font-bold text-sm text-slate-900"
                                placeholder={`Type message to ${activeChannel.name}...`}
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                            />
                            <button 
                                type="submit"
                                className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all active:scale-90 shadow-lg shrink-0"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-350 italic p-8 text-center">
                        <MessageSquare className="w-16 h-16 text-slate-205 mb-4 text-slate-200" />
                        <h4 className="font-black text-slate-400 uppercase text-xs">No active channels selected</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">Select a channel from the sidebar or verify assignments inside the marketplace to activate a group.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
