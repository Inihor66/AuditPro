import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Building2, 
    GraduationCap, 
    ShieldCheck, 
    Download, 
    ArrowDownToLine, 
    Smartphone, 
    Info, 
    ExternalLink, 
    HelpCircle,
    CheckCircle,
    Mail,
    Lock,
    User as UserIcon,
    Phone,
    MapPin,
    ArrowRight,
    ChevronRight,
    Sparkles,
    LogIn,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const downloadAppLauncher = (name: string, url: string) => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
        }
        .container {
            max-width: 480px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 32px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(20px);
        }
        .logo {
            width: 72px;
            height: 72px;
            background: #f59e0b;
            color: #0f172a;
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 24px;
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
        }
        h1 {
            font-size: 28px;
            font-weight: 900;
            margin: 0 0 12px 0;
            letter-spacing: -0.025em;
        }
        p {
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 32px 0;
        }
        .btn {
            display: block;
            background: #ffffff;
            color: #0f172a;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 16px;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.2s;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        .btn:hover {
            transform: translateY(-2px);
            background: #f8fafc;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }
        .footer {
            margin-top: 32px;
            font-size: 10px;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">${name[0].toUpperCase()}</div>
        <h1>Loading ${name}</h1>
        <p>Connecting to secure digital audit network. If you are not redirected automatically, please click the button below.</p>
        <a href="${url}" class="btn">Launch Application</a>
        <div class="footer">Secure Uplink Verified</div>
    </div>
    <script>
        setTimeout(function() {
            window.location.href = "${url}";
        }, 1200);
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const fileUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `${name.replace(/[^a-z0-9]/gi, '_')}_launcher.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileUrl);
};

const downloadWindowsShortcut = (name: string, url: string) => {
    const fileContent = `[InternetShortcut]\nURL=${url}\nIconIndex=0\n`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const fileUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `${name.replace(/[^a-z0-9]/gi, '_')}_app.url`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileUrl);
};


export function JoinRedirect() {
    const { appId } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    
    // Auth Form State
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [selectedRole, setSelectedRole] = useState<'firm' | 'student'>('firm');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [auditLocation, setAuditLocation] = useState('');
    const [authError, setAuthError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [appDetails, setAppDetails] = useState<{ id: string; name: string } | null>(null);
    const [downloadStatus, setDownloadStatus] = useState<string>('idle');
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [showInstallGuide, setShowInstallGuide] = useState(false);
    const [isInsideIframe, setIsInsideIframe] = useState(false);

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setIsSubmitting(true);
        try {
            if (authMode === 'signup') {
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email, 
                        password, 
                        name, 
                        phone, 
                        location, 
                        auditLocation: selectedRole === 'student' ? auditLocation : undefined, 
                        role: selectedRole === 'firm' ? UserRole.FIRM : UserRole.STUDENT, 
                        appId 
                    })
                });
                if (!res.ok) {
                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await res.json();
                        throw new Error(data.error || `Signup failed with status ${res.status}`);
                    } else {
                        const rawText = await res.text();
                        throw new Error(rawText.substring(0, 100) || `Server error during signup (status: ${res.status})`);
                    }
                }
                const user = await res.json();
                login(user);
                navigate('/');
            } else {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, appId })
                });
                if (!res.ok) {
                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await res.json();
                        throw new Error(data?.error || `Login failed with status ${res.status}`);
                    } else {
                        const rawText = await res.text();
                        throw new Error(rawText.substring(0, 100) || `Server error during login (status: ${res.status})`);
                    }
                }
                const user = await res.json();
                login(user);
                navigate('/');
            }
        } catch (err: any) {
            setAuthError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        // Detect if loaded inside an iframe (like AI Studio preview)
        try {
            setIsInsideIframe(window.self !== window.top);
        } catch (e) {
            setIsInsideIframe(true);
        }

        // Intercept native browser installation prompt (triggers standard WebAPK packaging on Android)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
            console.log("'beforeinstallprompt' event caught! App is ready for direct APK/PWA installation.");
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if the application is already running in standalone mode (installed as an App/APK)
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            console.log('App is currently running as an installed standalone Mobile App/APK!');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleNativeInstall = async () => {
        if (!deferredPrompt) {
            // If no native prompt exists, show manual instructions
            setShowInstallGuide(true);
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User responsive to installation request: ${outcome}`);
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    useEffect(() => {
        if (!appId) return;
        setDownloadStatus('fetching');
        fetch(`/api/apps/${appId}`)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Failed to load app metadata");
            })
            .then(data => {
                setAppDetails(data);
                setDownloadStatus('downloading');
                // Trigger auto-download default launcher
                setTimeout(() => {
                    downloadAppLauncher(data.name, window.location.href);
                    setDownloadStatus('completed');
                }, 800);
            })
            .catch(err => {
                console.error("Error loading app details:", err);
                setDownloadStatus('failed');
            });
    }, [appId]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-white p-6 sm:p-12 rounded-[40px] shadow-2xl border border-slate-200 text-center relative z-10"
            >
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200 relative">
                    <ShieldCheck className="w-10 h-10 text-amber-500" />
                    {downloadStatus === 'downloading' && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full text-white animate-bounce shadow">
                            <ArrowDownToLine className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {appDetails && (
                    <div className="flex flex-col gap-4 mb-8">
                        {/* Native App / APK Installation Panel */}
                        <div className="p-6 bg-gradient-to-br from-amber-500/10 via-slate-50 to-slate-100/50 rounded-3xl border border-amber-500/20 text-left">
                            {isInsideIframe && (
                                <div className="mb-6 p-4 bg-red-500/15 border border-red-500/25 rounded-2xl text-xs text-red-900 leading-relaxed font-semibold">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="w-5 h-5 text-red-600 shrink-0 animate-bounce" />
                                        <span className="font-extrabold text-red-700 uppercase tracking-wider text-[11px]">Iframe Sandbox Block Detected</span>
                                    </div>
                                    <p className="mb-3 text-slate-600">
                                        आप अभी Google AI Studio के Preview iframe के अंदर हैं। ब्राउज़र सुरक्षा नियमों के कारण, **Home Screen पर App/APK डाउनलोड और इंस्टॉल करना Preview के अंदर से ब्लॉक रहता है।**
                                    </p>
                                    <p className="mb-4 text-slate-600">
                                        इसको **बिल्कुल अपने मोबाइल की Home Screen पर Real APK की तरह** इंस्टॉल करने के लिए, नीचे दिए हुए बटन पर क्लिक करके इसे नए स्टैंडअलोन ब्राउज़र टैब में खोलें।
                                    </p>
                                    <button 
                                        onClick={() => window.open(window.location.href, '_blank')}
                                        className="px-4 py-2.5 bg-red-600 text-white font-black hover:bg-red-700 transition-all rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-500/10 active:scale-95"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" /> Standalone Window में खोलें (Install Now)
                                    </button>
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/10 shrink-0">
                                    <Smartphone className="w-6 h-6 animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <span className="bg-amber-500/20 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-500/30 inline-block mb-1">
                                        Mobile Installation Engine (PWA / APK)
                                    </span>
                                    <h4 className="font-black text-slate-900 text-base tracking-tight">Download & Install Mobile App</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Installs directly to your device screen as a standalone application. It behaves exactly like an APK—allowing launching instantly with zero browser address bars and maximum performance.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <button
                                    onClick={handleNativeInstall}
                                    className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95"
                                >
                                    <Download className="w-4 h-4" /> Install App Natively (APK)
                                </button>
                                
                                <button
                                    onClick={() => setShowInstallGuide(!showInstallGuide)}
                                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
                                >
                                    <HelpCircle className="w-4 h-4 text-slate-500" /> Manual Install Guide
                                </button>
                            </div>

                            {/* Manual Install Tutorial Accordion */}
                            <AnimatePresence>
                                {showInstallGuide && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 pt-4 border-t border-slate-200/50 overflow-hidden"
                                    >
                                        <div className="space-y-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                Easy step to install on your home screen:
                                            </p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 text-xs font-medium text-slate-600">
                                                {/* Android Instructions */}
                                                <div className="p-4 bg-white/70 rounded-2xl border border-slate-100 space-y-2">
                                                    <div className="flex items-center gap-2 font-black text-slate-900 text-[11px] uppercase tracking-wider">
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black">Android</span> Chrome, Brave, Opera
                                                    </div>
                                                    <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-[11px]">
                                                        <li>Open this link in <strong className="text-slate-900 font-extrabold">Chrome Mobile</strong> Browser.</li>
                                                        <li>Tap the <strong className="text-slate-950 font-extrabold">Menu (3 dot ⋮ icon)</strong> next to the address bar.</li>
                                                        <li>Select <strong className="text-amber-600 font-extrabold">"Install App"</strong> or <strong className="text-amber-600 font-extrabold">"Add to Home screen"</strong>.</li>
                                                        <li>Click add. Chrome will instantly create a high-performance, fullscreen application shortcut!</li>
                                                    </ol>
                                                </div>

                                                {/* iOS Instructions */}
                                                <div className="p-4 bg-white/70 rounded-2xl border border-slate-100 space-y-2">
                                                    <div className="flex items-center gap-2 font-black text-slate-900 text-[11px] uppercase tracking-wider">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-black">iOS</span> Safari Browser
                                                    </div>
                                                    <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-[11px]">
                                                        <li>Open this join link in <strong className="text-slate-900 font-extrabold">Safari</strong> on iPhone.</li>
                                                        <li>Tap the <strong className="text-slate-950 font-extrabold">Share button (⎋ icon)</strong> at the bottom tab.</li>
                                                        <li>Scroll down and select <strong className="text-blue-600 font-extrabold">"Add to Home Screen"</strong>.</li>
                                                        <li>Tap <strong className="text-slate-950 font-extrabold">Add</strong> in the top-right. It installs physically on your screen!</li>
                                                    </ol>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2 leading-relaxed">
                                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span>Once installed, you can launch the app directly from your phone's home screen. All links, student portals, firm tools, chats, and audits will run fluidly in fullscreen.</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Classic Desktop Launcher App links */}
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/65 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-950 text-amber-500 font-black rounded-2xl flex items-center justify-center shadow-lg text-lg shrink-0">
                                    {appDetails.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Device Launcher Shortcuts</h3>
                                    <p className="font-black text-slate-950 text-base leading-tight">{appDetails.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                        {downloadStatus === 'downloading' ? '⚡ Compiling Launcher...' : '✓ System Launcher Ready'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                                <button 
                                    onClick={() => downloadAppLauncher(appDetails.name, window.location.href)}
                                    className="px-4 py-2.5 bg-slate-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" /> HTML App
                                </button>
                                <button 
                                    onClick={() => downloadWindowsShortcut(appDetails.name, window.location.href)}
                                    className="px-4 py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" /> Win App
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-12 mb-6 border-b border-slate-150 pb-6 text-center">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {authMode === 'signin' ? 'Sign In / लॉगिन करें' : 'Create Account / रजिस्टर करें'}
                    </h2>
                    <p className="mt-1 text-slate-500 text-xs font-semibold leading-relaxed">
                        {authMode === 'signin' 
                          ? 'Enter your credentials to access the secure portal' 
                          : 'Register as an approved firm or student partner'}
                    </p>
                </div>

                {/* Mode Selector and Role Selector */}
                <div className="flex flex-col gap-4 mb-8">
                    {/* Toggle: Sign In vs Sign Up */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-xs mx-auto w-full">
                        <button
                            type="button"
                            onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${authMode === 'signin' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${authMode === 'signup' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Toggle: Firm vs Student */}
                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
                        <button
                            type="button"
                            onClick={() => { setSelectedRole('firm'); setAuthError(''); }}
                            className={`p-4 rounded-2xl border-2 transition-all text-center flex items-center justify-center gap-2 ${selectedRole === 'firm' ? 'border-slate-900 bg-slate-900/5 text-slate-900 font-extrabold' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                        >
                            <Building2 className="w-5 h-5 text-slate-700" />
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-black tracking-wider leading-none">Firm / Company</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setSelectedRole('student'); setAuthError(''); }}
                            className={`p-4 rounded-2xl border-2 transition-all text-center flex items-center justify-center gap-2 ${selectedRole === 'student' ? 'border-emerald-600 bg-emerald-500/5 text-emerald-800 font-extrabold' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                        >
                            <GraduationCap className="w-5 h-5 text-slate-700" />
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-black tracking-wider leading-none">Student Auditor</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Secure Inline Form */}
                <form onSubmit={handleAuthSubmit} className="max-w-md mx-auto space-y-5 text-left bg-slate-50/50 p-6 sm:p-8 rounded-[32px] border border-slate-100">
                    {authError && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-xs font-black uppercase tracking-wider text-center">
                            {authError}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Fields displayed ONLY for Sign Up */}
                        {authMode === 'signup' && (
                            <>
                                {/* Name Input */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="Full Name (पूरा नाम)"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                {/* Phone Input */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="Phone Number (मोबाइल नंबर)"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                {/* Location Input */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all text-sm"
                                        placeholder="Location (शहर/स्थान)"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>

                                {/* Student specific Audit Location Input */}
                                {selectedRole === 'student' && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-emerald-500">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full pl-12 pr-4 py-3.5 bg-emerald-50/20 border border-emerald-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-sm"
                                            placeholder="Audit Location Covered (उदा. Delhi, Mumbai)"
                                            value={auditLocation}
                                            onChange={(e) => setAuditLocation(e.target.value)}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Common Fields for Sign In and Sign Up */}
                        {/* Email Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all text-sm"
                                placeholder="Email Address (ईमेल)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all text-sm"
                                placeholder="Password (पासवर्ड)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2`}
                    >
                        {isSubmitting ? (
                            <span>Please wait...</span>
                        ) : (
                            <>
                                {authMode === 'signin' ? (
                                    <>
                                        <LogIn className="w-4 h-4 text-white" /> Sign In {selectedRole === 'firm' ? 'as Firm' : 'as Student'}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 text-white" /> Create Account
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </form>
                
                <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
                  <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] max-w-xs leading-relaxed">By joining, you agree to our terms and conditions.</p>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
            </motion.div>
        </div>
    );
}
