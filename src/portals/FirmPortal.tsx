import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuditForm, UserRole, Subscription } from '../types';
import { 
  ClipboardList, 
  Loader, 
  Calendar, 
  User as UserIcon, 
  Plus, 
  FileText, 
  Trash2, 
  ArrowRight,
  DollarSign,
  CheckCircle,
  MessageCircle,
  Edit,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Mail,
  MapPin
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function FirmPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Ongoing Projects', icon: ClipboardList, path: '/firm' },
    { name: 'Pending Approval', icon: Loader, path: '/firm/pending' },
    { name: 'Due Date', icon: Calendar, path: '/firm/due-dates' },
    { name: 'Profile & Subscription', icon: UserIcon, path: '/firm/profile' },
    { name: 'Secure Chats', icon: MessageCircle, path: '/firm/chats' },
  ];

  const currentPathName = menuItems.find(m => m.path === location.pathname)?.name || 'Projects';

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white flex flex-col border-r border-slate-200">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-xl shadow-indigo-100 italic">A</div>
            <h1 className="text-slate-900 font-black text-xl tracking-tighter uppercase italic">Audit<span className="text-indigo-600">Pro</span></h1>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-2' 
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-widest">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Session Protocol</p>
              <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-4 text-slate-400 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Terminal Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <span className="text-indigo-600">Firm Interface</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">{currentPathName}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-10">
          <Routes>
            <Route path="/" element={<OngoingProjects />} />
            <Route path="/pending" element={<PendingApproval />} />
            <Route path="/due-dates" element={<DueDates />} />
            <Route path="/profile" element={<ProfileAndSubscription />} />
            <Route path="/chats" element={<FirmChats />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// Ongoing Projects Page
function OngoingProjects() {
    const { user } = useAuth();
    const [forms, setForms] = useState<AuditForm[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedProject, setSelectedProject] = useState<AuditForm | null>(null);

    const fetchForms = () => {
        if (!user?.id) return;
        fetch(`/api/forms?firmId=${user.id}`).then(r => r.json()).then(data => {
            // Approved by admin models the "Ongoing" state
            setForms(data.filter((f: any) => f.status === 'approved_by_admin' || f.status === 'ongoing' || f.status === 'completed'));
        });
    };

    useEffect(() => {
        fetchForms();
    }, [user]);

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Ongoing <span className="text-indigo-600">Stream</span></h2>
                    <p className="text-slate-500 font-medium text-sm">Active audit cycles verified by administrative protocol.</p>
                </div>
                <button 
                  onClick={() => setShowCreate(true)}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center hover:bg-slate-800 shadow-2xl shadow-slate-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-3" /> Create Audit Form
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {forms.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No active audits detected</p>
                    </div>
                ) : (
                    forms.map(f => (
                        <motion.div 
                            key={f.id} 
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedProject(f)}
                            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 cursor-pointer overflow-hidden group relative"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{f.auditLocation}</h3>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{f.auditDate}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Student Partner</p>
                                        <p className="font-bold text-xs truncate">{f.studentEmail || "NOT_ASSIGNED"}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Contact Link</p>
                                        <p className="font-bold text-xs truncate">{f.studentPhone || "NA"}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" /> Approved
                                    </span>
                                    <p className="text-xl font-black text-slate-900">{formatCurrency(f.payment, 'INR')}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {showCreate && <CreateAuditModal onClose={() => setShowCreate(false)} onCreated={fetchForms} />}
                {selectedProject && <AuditDetailModal audit={selectedProject} onClose={() => setSelectedProject(null)} />}
            </AnimatePresence>
        </div>
    );
}

// Pending Approval Page
function PendingApproval() {
    const { user } = useAuth();
    const [forms, setForms] = useState<AuditForm[]>([]);
    const [selected, setSelected] = useState<AuditForm | null>(null);
    const [editing, setEditing] = useState<AuditForm | null>(null);

    const fetchForms = () => {
        if (!user?.id) return;
        fetch(`/api/forms?firmId=${user.id}`).then(r => r.json()).then(data => {
            setForms(data.filter((f: any) => f.status === 'pending' || f.status === 'rejected'));
        });
    };

    useEffect(() => {
        fetchForms();
    }, [user]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this frame?")) return;
        const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
        if (res.ok) fetchForms();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Pending <span className="text-amber-500">Waitlist</span></h2>
                <p className="text-slate-500 font-medium text-sm">Forms awaiting administrative verification and student routing.</p>
            </div>

            <div className="space-y-4">
                {forms.length === 0 ? (
                    <div className="py-20 text-center bg-white border border-slate-200 rounded-[2.5rem]">
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No pending frames detected</p>
                    </div>
                ) : (
                    forms.map(f => (
                        <div 
                            key={f.id} 
                            onClick={() => setSelected(f)}
                            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer flex justify-between items-center group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="grid grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Location</p>
                                        <p className="font-black text-slate-900 uppercase">{f.auditLocation}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Date</p>
                                        <p className="font-bold text-slate-600">{f.auditDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Payment</p>
                                        <p className="font-black text-indigo-600 uppercase italic">{formatCurrency(f.payment, 'INR')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setEditing(f); }}
                                    className="p-3 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(e, f.id)}
                                    className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <ChevronRight className="w-5 h-5 text-slate-300 ml-4" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {selected && <AuditDetailModal audit={selected} onClose={() => setSelected(null)} />}
                {editing && <EditAuditModal audit={editing} onClose={() => setEditing(null)} onUpdated={fetchForms} />}
            </AnimatePresence>
        </div>
    );
}

// Due Date Page
function DueDates() {
    const { user } = useAuth();
    const [forms, setForms] = useState<AuditForm[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');

    useEffect(() => {
        if (!user?.id) return;
        fetch(`/api/forms?firmId=${user.id}`).then(r => r.json()).then(data => {
            // Only show audits student has filled/interacted with (we assume studentId presence means they filled it)
            setForms(data.filter((f: any) => f.studentId));
        });
    }, [user]);

    const calculateDueDate = (dateStr: string, creditDays: number) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + (creditDays || 30));
        return date.toLocaleDateString();
    };

    const filteredForms = selectedDate 
        ? forms.filter(f => calculateDueDate(f.auditDate, f.creditPeriod) === new Date(selectedDate).toLocaleDateString())
        : forms;

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Payment <span className="text-rose-500">Maturity</span></h2>
                    <p className="text-slate-500 font-medium text-sm">Tracking settlement windows based on credit period logic.</p>
                </div>
                <div>
                     <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-white p-4 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-rose-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-6">Audit Location</th>
                            <th className="px-8 py-6">Student Info</th>
                            <th className="px-8 py-6">Audit Date</th>
                            <th className="px-8 py-6">Credit</th>
                            <th className="px-8 py-6">Due Date</th>
                            <th className="px-8 py-6 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 italic">
                        {filteredForms.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching maturity dates found</td>
                            </tr>
                        ) : (
                            filteredForms.map(f => (
                                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6 font-black text-slate-900 uppercase tracking-tight">{f.auditLocation}</td>
                                    <td className="px-8 py-6 uppercase font-bold text-[10px]">
                                        <p>{f.studentName || 'Not Available'}</p>
                                        <p className="text-slate-400">{f.studentEmail}</p>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-slate-600">{f.auditDate}</td>
                                    <td className="px-8 py-6 font-bold text-indigo-500">{f.creditPeriod} Days</td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg font-black text-xs">
                                            {calculateDueDate(f.auditDate, f.creditPeriod)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-slate-900">{formatCurrency(f.payment, 'INR')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Profile & Subscription Page
function ProfileAndSubscription() {
    const { user, login } = useAuth();
    const [firmStatus, setFirmStatus] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [paying, setPaying] = useState<any>(null);
    const [verifying, setVerifying] = useState(false);
    const [utr, setUtr] = useState("");

    const [profile, setProfile] = useState({
        name: user?.name || '',
        location: user?.location || '',
        phone: user?.phone || '',
        email: user?.email || ''
    });

    const fetchStatus = () => {
        if (!user?.id) return;
        fetch(`/api/firm/${user.id}/status`).then(r => r.json()).then(setFirmStatus);
    };

    useEffect(() => {
        fetchStatus();
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await fetch(`/api/auth/profile`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...profile, id: user?.id})
        });
        if (res.ok) {
            const updated = await res.json();
            login(updated);
            alert("Profile synchronized successfully");
        }
        setSubmitting(false);
    };

    const startUpgrade = async (plan: any) => {
        const res = await fetch('/api/payments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id, type: plan.type, amountUSD: plan.price })
        });
        const data = await res.json();
        setPaying(data);
    };

    const verifyUpgrade = async () => {
        if (!utr) return alert("Please enter 12-digit UTR");
        setVerifying(true);
        const res = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: paying.transaction.id, utr })
        });
        if (res.ok) {
            alert("Payment submitted for verification. Limits will upgrade automatically upon approval.");
            setPaying(null);
            setUtr("");
            fetchStatus();
        }
        setVerifying(false);
    };

    const plans = [
        { type: 'unlimited_entries_1m', name: 'Lite Monthly', price: 3, duration: '1 Month', desc: 'Unlimited audit frames' },
        { type: 'unlimited_entries_6m', name: 'Pro Semester', price: 16, duration: '6 Months', desc: 'Unlimited audit frames + Priority Support' },
        { type: 'unlimited_entries_12m', name: 'Enterprise Annual', price: 34, duration: '12 Months', desc: 'Full unlimited suite + Advanced tracking' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-16">
            <div className="grid md:grid-cols-3 gap-12">
                {/* Profile Form */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Identity <span className="text-indigo-600">Overlay</span></h2>
                        <p className="text-slate-500 font-medium text-sm">Editable firm credentials and communication protocols.</p>
                    </div>

                    <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Corporate Title</label>
                                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Sync Location</label>
                                <input type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Uplink Phone</label>
                                <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                            </div>
                            <div className="space-y-2 opacity-50 cursor-not-allowed">
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Auth Primary Email</label>
                                <input type="email" value={profile.email} readOnly className="w-full p-4 bg-slate-100 border border-slate-100 rounded-2xl font-bold outline-none" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button disabled={submitting} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                {submitting ? "Synchronizing..." : "Update Firmware"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Status Sidebar */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Registry <span className="text-indigo-600">Status</span></h2>
                    </div>
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 space-y-6 italic transition-transform hover:scale-105">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Audit Usage</p>
                            <p className="text-4xl font-black tracking-tighter">{firmStatus?.formCount || 0} / {firmStatus?.subscription ? '∞' : firmStatus?.limit}</p>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Bit</p>
                            <p className="font-bold flex items-center gap-2">
                                {firmStatus?.subscription ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
                                {firmStatus?.subscription ? "Unlimited Access Valid" : "Limited Access Mode"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscriptions */}
            <div className="space-y-10">
                <div className="text-center">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic"><span className="text-indigo-600">Upgrade</span> Plan</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Unlock unrestricted auditing capabilities for your organization.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map(p => (
                        <div key={p.type} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl hover:border-indigo-600 transition-all group flex flex-col">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-1">{p.name}</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">{p.duration}</p>
                            
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">${p.price}</span>
                                <span className="text-slate-400 text-xs font-bold uppercase">USD</span>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                <p className="text-xs font-bold text-slate-600 flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {p.desc}
                                </p>
                                <p className="text-xs font-bold text-slate-600 flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Administrative Verification
                                </p>
                            </div>

                            <button 
                                onClick={() => startUpgrade(p)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] group-hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                            >
                                Secure Upgrade
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {paying && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div initial={{scale:0.9, y: 20}} animate={{scale:1, y: 0}} className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20 text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                                    <Smartphone className="w-8 h-8" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">UPI Payment Uplink</h3>
                            <p className="text-slate-500 text-xs font-bold mb-8 italic">9422332475@ibl • AuditMaster Registry</p>
                            
                            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 mb-8 flex flex-col items-center gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Maturity Amount</p>
                                    <p className="text-3xl font-black text-slate-900 italic">₹{paying.transaction.amountINR}</p>
                                    <p className="text-[10px] text-indigo-400 font-bold mt-1 uppercase">Converted from ${paying.transaction.amountUSD} USD</p>
                                </div>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paying.upiLink)}`} alt="QR" className="w-40 h-40" />
                            </div>

                            <div className="space-y-4">
                                <div className="text-left space-y-1.5">
                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-2">Bank Reference UTR</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter 12-digit UTR"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-center text-slate-900 placeholder-slate-300 outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                        value={utr}
                                        onChange={(e) => setUtr(e.target.value)}
                                    />
                                </div>
                                <button onClick={verifyUpgrade} disabled={verifying} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all">
                                    {verifying ? "Syncing..." : "I Have Processed Payment"}
                                </button>
                                <button onClick={() => setPaying(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Abort Transaction</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Subcomponents
function CreateAuditModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        firmName: user?.name || '',
        firmEmail: user?.email || '',
        firmPhone: user?.phone || '',
        auditLocation: '',
        payment: 0,
        auditDate: '',
        creditPeriod: 30,
        terms: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await fetch('/api/forms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, firmId: user?.id, appId: user?.appId, status: 'pending' })
        });
        if (res.ok) {
            onCreated();
            onClose();
        } else {
            const data = await res.json();
            alert(data.message || "Failed to initialize audit");
        }
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-auto">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8">
                <div className="p-10 border-b bg-slate-900 text-white">
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Audit <span className="text-indigo-400">Blueprint</span></h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Submit operational specs for administrative routing</p>
                </div>
                
                <form className="p-10 space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Designation</label>
                            <input type="text" value={formData.firmName} onChange={e => setFormData({...formData, firmName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold italic outline-none focus:ring-2 focus:ring-indigo-600" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">System Email</label>
                            <input type="email" value={formData.firmEmail} onChange={e => setFormData({...formData, firmEmail: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Phone Link</label>
                            <input type="text" value={formData.firmPhone} onChange={e => setFormData({...formData, firmPhone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Audit Site</label>
                            <input type="text" value={formData.auditLocation} onChange={e => setFormData({...formData, auditLocation: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black uppercase outline-none focus:ring-2 focus:ring-indigo-600" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Fee (₹ INR)</label>
                            <input type="number" value={formData.payment} onChange={e => setFormData({...formData, payment: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl italic" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Audit Date</label>
                            <input type="date" value={formData.auditDate} onChange={e => setFormData({...formData, auditDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Credit (Days)</label>
                            <input type="number" value={formData.creditPeriod} onChange={e => setFormData({...formData, creditPeriod: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Other Provisions</label>
                        <textarea value={formData.terms} onChange={e => setFormData({...formData, terms: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl h-32 italic text-sm outline-none focus:ring-2 focus:ring-indigo-600 resize-none" />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 uppercase text-[10px] font-black tracking-widest">
                        <button type="button" onClick={onClose} className="px-8 py-4 text-slate-400 hover:text-rose-500 transition-colors">Cancel Blueprint</button>
                        <button disabled={submitting} type="submit" className="px-10 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-2xl active:scale-95">Establish Registry</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function EditAuditModal({ audit, onClose, onUpdated }: { audit: AuditForm, onClose: () => void, onUpdated: () => void }) {
    const [formData, setFormData] = useState({...audit});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await fetch(`/api/forms/${audit.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            onUpdated();
            onClose();
        }
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-auto">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8">
                <div className="p-10 border-b bg-indigo-600 text-white">
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Edit <span className="text-slate-900">Blueprint</span></h3>
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Modify pending operational specs</p>
                </div>
                
                <form className="p-10 space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Audit Site</label>
                            <input type="text" value={formData.auditLocation} onChange={e => setFormData({...formData, auditLocation: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black uppercase outline-none focus:ring-2 focus:ring-indigo-600" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Audit Date</label>
                            <input type="date" value={formData.auditDate} onChange={e => setFormData({...formData, auditDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Fee (₹ INR)</label>
                            <input type="number" value={formData.payment} onChange={e => setFormData({...formData, payment: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl italic" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Credit (Days)</label>
                            <input type="number" value={formData.creditPeriod} onChange={e => setFormData({...formData, creditPeriod: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2">Other Provisions</label>
                        <textarea value={formData.terms} onChange={e => setFormData({...formData, terms: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl h-32 italic text-sm outline-none focus:ring-2 focus:ring-indigo-600 resize-none" />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 uppercase text-[10px] font-black tracking-widest">
                        <button type="button" onClick={onClose} className="px-8 py-4 text-slate-400 hover:text-rose-500 transition-colors">Discard Changes</button>
                        <button disabled={submitting} type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl active:scale-95">Update Frame</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function AuditDetailModal({ audit, onClose }: { audit: AuditForm, onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-205 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">{audit.auditLocation}</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Registry Code: {audit.id.toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all">
                        ✕
                    </button>
                </div>

                {/* Submodal scroll body */}
                <div className="p-8 space-y-8 overflow-y-auto bg-slate-50 flex-1">
                    
                    {/* Part 1: Firm's Original Submitted Audit Details */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-205 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b border-indigo-50 pb-3">
                            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                            <h4 className="text-xs text-indigo-900 font-black uppercase tracking-widest">1. Your Original Submitted Audit Request</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Company Name</p>
                                <p className="text-sm font-bold text-slate-800">{audit.firmName}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Budget Offered</p>
                                <p className="text-sm font-black text-slate-900 italic">{formatCurrency(audit.payment, 'INR')}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Audit Target Location</p>
                                <p className="text-sm font-bold text-slate-800 uppercase">{audit.auditLocation}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Scheduled Execution Date</p>
                                <p className="text-sm font-bold text-slate-800">{audit.auditDate}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Your Contact Email</p>
                                <p className="text-sm font-bold text-slate-800">{audit.firmEmail}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Contact Phone</p>
                                <p className="text-sm font-bold text-slate-800">{audit.firmPhone}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Settlement (Credit Period)</p>
                                <p className="text-sm font-bold text-slate-800">{audit.creditPeriod} Days</p>
                            </div>
                        </div>

                        {audit.terms && (
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Involved Directives & Terms</p>
                                <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl leading-relaxed">"{audit.terms}"</p>
                            </div>
                        )}

                        {audit.customFields && audit.customFields.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">Requirement Specifications</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {audit.customFields.map((cf, idx) => (
                                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{cf.label}</p>
                                            <p className="text-xs font-bold text-slate-700 mt-0.5">{cf.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Part 2: Assigned Student Details styled strictly like a premium Google Form response block */}
                    {audit.studentId ? (
                        <div className="bg-white border-t-8 border-t-purple-600 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm border border-slate-200">
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
                                <span className="text-[10px] bg-purple-100 text-purple-700 font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md self-start">
                                    Google Forms Response
                                </span>
                                <h4 className="text-lg font-black text-slate-950 mt-2 uppercase tracking-tight">Claimed Student Auditor Registry Form</h4>
                                <p className="text-xs text-slate-400 font-medium">Verified response captured upon assignment security</p>
                            </div>

                            <div className="space-y-6 text-left">
                                {/* Google Form Questionnaire representation */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-800 block">
                                        1. Student Partner Name: <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="bg-purple-50/20 p-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800">
                                        {audit.studentName || 'Not Entered'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-800 block">
                                        2. Student Phone Number: <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="bg-purple-50/20 p-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800">
                                        {audit.studentPhone || 'Not Entered'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-800 block">
                                        3. Student Email Address: <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="bg-purple-50/20 p-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800">
                                        {audit.studentEmail || 'Not Entered'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-800 block">
                                        4. Audit Role Qualification: <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="bg-purple-50/20 p-4 rounded-2xl border border-purple-200 text-sm font-black text-purple-700">
                                        {audit.studentQualification || 'Not Specified'}
                                    </div>
                                </div>

                                {audit.customFields && audit.customFields.map((cf, index) => (
                                    <div className="space-y-2" key={index}>
                                        <label className="text-xs font-black text-slate-800 block">
                                            {5 + index}. Student response: {cf.label} <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="bg-purple-50/20 p-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800">
                                            {cf.value || 'Not Answered'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
                            <p className="text-xs text-slate-400 uppercase font-black tracking-widest">No Student Claimed Yet</p>
                            <p className="text-sm font-medium text-slate-600">This audit has not been accepted by any student partner yet. Once picked, the Google forms credential will reflect here instantly.</p>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-slate-100 border-t border-slate-200/50 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        Close Registry Detail
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function FirmChats() {
    const { user } = useAuth();
    const [chats, setChats] = useState<{id: string, name: string, type: 'admin' | 'owner'}[]>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user?.id) return;
        
        const loadChats = async () => {
            const available: any[] = [];
            
            // 1. Connection to the Admin who created their portal
            if (user.appId) {
                try {
                    const res = await fetch(`/api/admin/details?appId=${user.appId}`);
                    if (res.ok) {
                        const admin = await res.json();
                        available.push({ id: admin.id, name: `${admin.name} (Admin)`, type: 'admin' });
                    }
                } catch (e) { console.error(e); }
            }

            // 2. Connection to the System Owner (Support)
            try {
                const res = await fetch('/api/admin/owner-details');
                if (res.ok) {
                    const owner = await res.json();
                    available.push({ id: owner.id, name: 'System Support (Owner)', type: 'owner' });
                }
            } catch (e) { console.error(e); }

            // 3. Connection to Group Chats enabled for this firm (Audit Team coordination)
            if (user.appId) {
                try {
                    const res = await fetch(`/api/forms?appId=${user.appId}`);
                    if (res.ok) {
                        const formsData = await res.json();
                        const activeGroups = formsData.filter((f: any) => f.firmId === user.id && f.status === 'ongoing' && f.groupChatEnabled === true);
                        activeGroups.forEach((f: any) => {
                            available.push({
                                id: `group_${f.id}`,
                                name: `${f.auditLocation} (Group Chat)`,
                                type: 'group'
                            });
                        });
                    }
                } catch (e) { console.error(e); }
            }

            setChats(available);
            if (available.length > 0) setSelectedChat(available[0]);
        };

        loadChats();
    }, [user]);

    const fetchMessages = async () => {
        if (!selectedChat || !user?.id) return;
        const res = await fetch(`/api/chats/${user.id}?otherId=${selectedChat.id}`);
        if (res.ok) setMessages(await res.json());
    };

    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedChat, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedChat || !user?.id) return;

        const res = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: user.id,
                receiverId: selectedChat.id,
                text: inputText
            })
        });

        if (res.ok) {
            setInputText('');
            fetchMessages();
        }
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Secure <span className="text-indigo-600">Communication</span></h2>
                <p className="text-slate-500 font-medium text-sm">Encrypted uplink to administrative and support protocols.</p>
            </div>

            <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex overflow-hidden">
                {/* Chat Sidebar */}
                <div className="w-80 border-r border-slate-100 flex flex-col">
                    <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-2">Active Channels</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {chats.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedChat(c)}
                                className={cn(
                                    "w-full p-5 rounded-2xl text-left transition-all group",
                                    selectedChat?.id === c.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        selectedChat?.id === c.id ? "bg-white/20" : "bg-indigo-50 text-indigo-600"
                                    )}>
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs uppercase tracking-tight">{c.name}</p>
                                        <p className={cn("text-[9px] font-bold uppercase opacity-60", selectedChat?.id === c.id ? "text-white" : "text-slate-400")}>
                                            {c.type === 'admin' ? "Audit Control" : "System Core"}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-slate-50/30">
                    {selectedChat ? (
                        <>
                            <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white italic font-black">
                                        {selectedChat.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{selectedChat.name}</h4>
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Secure Connection Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {messages.map((m, idx) => (
                                    <div key={idx} className={cn("flex", m.senderId === user?.id ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[70%] p-5 rounded-[2rem]",
                                            m.senderId === user?.id 
                                                ? "bg-slate-900 text-white rounded-tr-none shadow-xl shadow-slate-200" 
                                                : "bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm"
                                        )}>
                                            {selectedChat?.type === 'group' && m.senderId !== user?.id && (
                                                <p className="text-[8px] font-black uppercase text-indigo-600 mb-1">
                                                    {m.senderName || 'Participant'}
                                                </p>
                                            )}
                                            <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                                            <p className={cn("text-[8px] font-black uppercase tracking-widest mt-2 opacity-40", m.senderId === user?.id ? "text-white" : "text-slate-400")}>
                                                {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>

                            <div className="p-6 bg-white border-t border-slate-100">
                                <form onSubmit={handleSend} className="relative">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Transmit message..."
                                        className="w-full pl-6 pr-24 py-4 bg-slate-50 border border-slate-200 rounded-2xl italic font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all border-none shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-2 bottom-2 px-6 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                                    >
                                        Send <ArrowRight className="w-3 h-3" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                                <MessageCircle className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-black uppercase tracking-tighter text-xl italic">Uplink <span className="text-indigo-600">Idle</span></p>
                                <p className="text-slate-400 font-medium text-sm">Select an administrative channel to initiate communication.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
