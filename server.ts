import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json());

// Simple persistence
let db = {
  users: [],
  apps: [],
  forms: [],
  subscriptions: [],
  chats: [],
  transactions: []
};

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch (e) {
      console.error("Error loading DB", e);
    }
  }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function getActiveSubscriptions(userId: string) {
  const now = new Date();
  let changed = false;
  
  db.subscriptions = db.subscriptions.map(sub => {
    if (sub.userId === userId && sub.isActive && new Date(sub.expiryDate) < now) {
      changed = true;
      return { ...sub, isActive: false };
    }
    return sub;
  });

  if (changed) saveDB();
  return db.subscriptions.filter(s => s.userId === userId && s.isActive);
}

loadDB();

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth
app.post("/api/auth/signup", (req, res) => {
  try {
    const { email, password, name, role, appId, ...other } = req.body || {};
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!db.users) {
      db.users = [];
    }
    
    const existing = db.users.find(u => 
      u && typeof u === 'object' && u.email &&
      u.email.toLowerCase() === email.toLowerCase() && 
      (appId ? u.appId === appId : !u.appId)
    );
    if (existing) {
      return res.status(400).json({ error: "Email already exists in this app" });
    }
    
    const newUser = { 
      id: Math.random().toString(36).substr(2, 9), 
      email, 
      password, 
      name, 
      role, 
      appId: appId || undefined, 
      createdAt: new Date().toISOString(), 
      ...other 
    };
    db.users.push(newUser);
    saveDB();
    res.json(newUser);
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message || "Internal server error during registration" });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password, appId } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!db.users) {
      db.users = [];
    }

    const user = db.users.find(u => 
      u && typeof u === 'object' && u.email &&
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password &&
      (appId ? u.appId === appId : !u.appId)
    );
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json(user);
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message || "Internal server error during login" });
  }
});

app.put("/api/auth/profile", (req, res) => {
  const { id, name, location, phone } = req.body;
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  
  db.users[idx] = { ...db.users[idx], name, location, phone };
  saveDB();
  res.json(db.users[idx]);
});

// App Management
function enrichApp(app: any) {
  const playStoreTxns = db.transactions.filter(t => t.appId === app.id && t.type === 'master_play_store');
  
  let playStoreState = 'none';
  let associatedTxn = null;
  
  if (app.onPlayStore) {
    playStoreState = 'published';
  } else {
    const completedTx = playStoreTxns.find(t => t.status === 'completed');
    const pendingVerifyTx = playStoreTxns.find(t => t.status === 'pending_verification');
    const submittedTx = playStoreTxns.find(t => t.status === 'submitted');
    
    if (completedTx) {
      playStoreState = 'review_in_progress';
      associatedTxn = completedTx;
    } else if (pendingVerifyTx) {
      playStoreState = 'pending_verification';
      associatedTxn = pendingVerifyTx;
    } else if (submittedTx) {
      playStoreState = 'payment_submitted';
      associatedTxn = submittedTx;
    }
  }
  
  return {
    ...app,
    playStoreState,
    associatedTxn
  };
}

app.get("/api/apps", (req, res) => {
  const { ownerId } = req.query;
  // Trigger expiry check
  getActiveSubscriptions(ownerId as string);
  const apps = db.apps.filter(a => a.ownerId === ownerId && !a.isDeleted);
  res.json(apps.map(enrichApp));
});

app.post("/api/apps", (req, res) => {
  const { name, ownerId } = req.body;
  const ownerApps = db.apps.filter(a => a.ownerId === ownerId);
  if (ownerApps.length >= 2) {
    const activeSubs = getActiveSubscriptions(ownerId);
    const sub = activeSubs.find(s => s.type === 'master_new_app');
    if (!sub) return res.status(403).json({ error: "App limit reached. Please subscribe." });
  }
  
  const id = Math.random().toString(36).substr(2, 9);
  const newApp = { 
    id, 
    name, 
    ownerId, 
    link: `${req.headers.origin}/join/${id}`,
    createdAt: new Date().toISOString(),
    isDeleted: false,
    onPlayStore: false
  };
  db.apps.push(newApp);
  saveDB();
  res.json(enrichApp(newApp));
});

app.get("/api/apps/:id", (req, res) => {
  const { id } = req.params;
  const foundApp = db.apps.find(a => a.id === id);
  if (!foundApp) return res.status(404).json({ error: "App not found" });
  res.json(enrichApp(foundApp));
});

// Forms
app.get("/api/forms", (req, res) => {
  const { appId, firmId, adminId, studentId, studentEmail } = req.query;
  let filtered = db.forms;
  if (appId) filtered = filtered.filter(f => f.appId === appId);
  if (firmId) filtered = filtered.filter(f => f.firmId === firmId);
  
  if (studentId || studentEmail) {
    filtered = filtered.filter(f => 
      (studentId && f.studentId === studentId) || 
      (studentEmail && f.studentEmail && f.studentEmail.toLowerCase() === (studentEmail as string).toLowerCase())
    );
  }
  
  res.json(filtered);
});

app.post("/api/forms", (req, res) => {
  const { firmId } = req.body;
  if (firmId) {
    const firmFormsCount = db.forms.filter(f => f.firmId === firmId && f.status !== 'deleted').length;
    const activeSubs = getActiveSubscriptions(firmId);
    const hasUnlimited = activeSubs.some(s => ['unlimited_entries_1m', 'unlimited_entries_6m', 'unlimited_entries_12m'].includes(s.type));
    
    if (!hasUnlimited && firmFormsCount >= 600) {
      return res.status(403).json({ error: "LIMIT_EXCEEDED", message: "You have reached your 600-form limit. Please subscribe to continue." });
    }
  }

  const form = { 
    ...req.body, 
    id: Math.random().toString(36).substr(2, 9), 
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  db.forms.push(form);
  saveDB();
  res.json(form);
});

app.put("/api/forms/:id", (req, res) => {
  const idx = db.forms.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).send("Not found");
  
  // Guard for editing: Allow if status is pending/rejected OR if updating from approved_by_admin to ongoing by the student
  const currentStatus = db.forms[idx].status;
  const isStudentApplying = (currentStatus === 'approved_by_admin' && req.body.status === 'ongoing');
  
  if (currentStatus !== 'pending' && currentStatus !== 'rejected' && !isStudentApplying) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Cannot edit form after approval." });
  }

  db.forms[idx] = { ...db.forms[idx], ...req.body };
  saveDB();
  res.json(db.forms[idx]);
});

app.delete("/api/forms/:id", (req, res) => {
  const idx = db.forms.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).send("Not found");
  
  // Firms/Students can only delete, editing is locked post-approval
  db.forms[idx].status = 'deleted';
  saveDB();
  res.json({ success: true });
});

app.get("/api/firm/:id/status", (req, res) => {
  const firmId = req.params.id;
  const firmFormsCount = db.forms.filter(f => f.firmId === firmId && f.status !== 'deleted').length;
  const activeSubs = getActiveSubscriptions(firmId);
  const unlimitedSub = activeSubs.find(s => ['unlimited_entries_1m', 'unlimited_entries_6m', 'unlimited_entries_12m'].includes(s.type));
  
  res.json({
    formCount: firmFormsCount,
    subscription: unlimitedSub || null,
    limit: 600
  });
});

// Subscriptions
app.get("/api/subscriptions/status", (req, res) => {
  const { userId } = req.query;
  const activeSubs = getActiveSubscriptions(userId as string);
  res.json(activeSubs);
});

app.post("/api/payments/create", (req, res) => {
  const { userId, type, amountUSD, appId, playStoreAppLink } = req.body;
  const exchangeRate = 83; // 1 USD = 83 INR (approx)
  const amountINR = Math.round(amountUSD * exchangeRate);
  
  const transactionId = Math.random().toString(36).substr(2, 9);
  const upiId = "9422332475@ibl";
  const name = "AuditMaster";
  
  // Generate UPI deep link
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amountINR}&cu=INR&tn=${encodeURIComponent(`Payment for ${type} - ${transactionId}`)}`;
  
  const newTransaction = {
    id: transactionId,
    userId,
    appId, // Optional appId link
    playStoreAppLink, // Store custom link directly on transaction
    type,
    amountUSD,
    amountINR,
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  
  db.transactions.push(newTransaction);
  saveDB();
  
  res.json({ transaction: newTransaction, upiLink });
});

app.post("/api/payments/verify", (req, res) => {
  const { transactionId, utr } = req.body;
  const idx = db.transactions.findIndex(t => t.id === transactionId);
  
  if (idx === -1) return res.status(404).json({ error: "Transaction not found" });
  if (!utr || utr.length < 10) return res.status(400).json({ error: "Please enter a valid 12-digit UTR from your bank app." });
  
  // Mark as pending manual verification
  db.transactions[idx].status = 'pending_verification';
  db.transactions[idx].utr = utr;
  saveDB();
  
  res.json({ success: true, message: "Transaction submitted for deep verification. Our finance team will review it within 15-30 minutes." });
});

// Master endpoint to see all pending transactions
app.get("/api/master/transactions", (req, res) => {
  res.json(db.transactions.filter(t => t.status === 'pending_verification' || t.status === 'completed'));
});

// Master endpoint to approve a transaction
app.post("/api/master/transactions/:id/approve", (req, res) => {
    const transactionId = req.params.id;
    const idx = db.transactions.findIndex(t => t.id === transactionId);
    if (idx === -1) return res.status(404).json({ error: "Transaction not found" });

    db.transactions[idx].status = 'completed';
    const { userId, type, amountUSD, appId } = db.transactions[idx];

    // Create the subscription
    const expiryDate = new Date();
    if (type.endsWith('_6m')) expiryDate.setMonth(expiryDate.getMonth() + 6);
    else if (type.endsWith('_12m')) expiryDate.setMonth(expiryDate.getMonth() + 12);
    else expiryDate.setMonth(expiryDate.getMonth() + 1);

    const newSub = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        appId,
        type,
        price: amountUSD,
        expiryDate: expiryDate.toISOString(),
        isActive: true
    };

    db.subscriptions.push(newSub);
    saveDB();
    res.json({ success: true, subscription: newSub });
});

app.post("/api/master/transactions/:id/reject", (req, res) => {
    const transactionId = req.params.id;
    const idx = db.transactions.findIndex(t => t.id === transactionId);
    if (idx === -1) return res.status(404).json({ error: "Transaction not found" });
    db.transactions[idx].status = 'rejected';
    saveDB();
    res.json({ success: true });
});
app.post("/api/admin/payments/approve", (req, res) => {
  const { transactionId } = req.body;
  const idx = db.transactions.findIndex(t => t.id === transactionId);
  
  if (idx === -1) return res.status(404).json({ error: "Transaction not found" });
  
  db.transactions[idx].status = 'completed';
  const { userId, type, amountUSD, appId, playStoreAppLink } = db.transactions[idx];
  
  // Create subscription
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  
  const newSub = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    appId,
    type,
    price: amountUSD,
    expiryDate: expiryDate.toISOString(),
    isActive: true
  };
  
  db.subscriptions.push(newSub);

  // Sync playStoreAppLink to application if available
  if (appId && playStoreAppLink) {
    const appIdx = db.apps.findIndex(a => a.id === appId);
    if (appIdx !== -1) {
      db.apps[appIdx].playStoreAppLink = playStoreAppLink;
    }
  }
  
  saveDB();
  
  res.json({ success: true });
});

app.get("/api/admin/payments/pending", (req, res) => {
  const pending = db.transactions.filter(t => t.status === 'submitted' || t.status === 'pending_verification');
  res.json(pending);
});

// Owner Management Endpoints
app.get("/api/owner/users", (req, res) => {
  const usersWithSubs = db.users.map(u => {
    const activeSubs = getActiveSubscriptions(u.id);
    return { ...u, subscriptions: activeSubs };
  });
  res.json(usersWithSubs);
});

app.post("/api/owner/subscriptions/modify", (req, res) => {
  const { userId, action, planType, appId } = req.body;
  if (action === 'unsubscribe') {
    db.subscriptions = db.subscriptions.map(s => 
      s.userId === userId ? { ...s, isActive: false } : s
    );
  } else if (action === 'grant') {
    const expiryDate = new Date();
    if (planType.endsWith('_6m')) {
        expiryDate.setMonth(expiryDate.getMonth() + 6);
    } else if (planType.endsWith('_12m')) {
        expiryDate.setMonth(expiryDate.getMonth() + 12);
    } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    db.subscriptions.push({
      id: Math.random().toString(36).substr(2, 9),
      userId,
      appId, // Link to specific app if provided
      type: planType,
      price: 0,
      expiryDate: expiryDate.toISOString(),
      isActive: true
    });
  }
  saveDB();
  res.json({ success: true });
});

// Chat Endpoints
app.get("/api/chats/:userId", (req, res) => {
  const { userId } = req.params;
  const { otherId } = req.query;
  let rawChats = [];
  if (otherId && typeof otherId === 'string' && otherId.startsWith("group_")) {
    rawChats = db.chats.filter(c => c.receiverId === otherId);
  } else {
    rawChats = db.chats.filter(c => 
      (c.senderId === userId && c.receiverId === otherId) ||
      (c.senderId === otherId && c.receiverId === userId)
    );
  }
  
  const chatsWithNames = rawChats.map(c => {
    const sender = db.users.find(u => u.id === c.senderId);
    return {
      ...c,
      senderName: sender ? sender.name : (c.senderId === 'owner' ? 'System Support' : 'Anonymous User')
    };
  });
  
  res.json(chatsWithNames);
});

// Get details of the admin who created the app (using appId)
app.get("/api/admin/details", (req, res) => {
    const { appId } = req.query;
    const appInfo = db.apps.find(a => a.id === appId);
    if (!appInfo) return res.status(404).json({ error: "App not found" });
    
    let admin = db.users.find(u => u.id === appInfo.ownerId);
    if (!admin) {
        // Fallback: try finding any user with master, owner, or admin role
        admin = db.users.find(u => u.role === 'master' || u.role === 'owner' || (u.role === 'admin' && u.appId === appId));
    }
    
    if (!admin) {
        // Safe fallback object so chat channel gets successfully created instead of failing with 404
        return res.json({ 
            id: appInfo.ownerId || "app_admin", 
            name: "App Admin", 
            email: "admin@system.com" 
        });
    }
    
    res.json({ id: admin.id, name: admin.name, email: admin.email });
});

// Helper to get or dynamically create the system owner account
function getOrCreateSystemOwner() {
    let owner = db.users.find(u => u.role === 'owner' || u.role === 'master');
    if (!owner) {
        const firstApp = db.apps[0];
        const defaultOwnerId = firstApp?.ownerId || "puxrdizs5";
        owner = {
            id: defaultOwnerId,
            email: "support@system.com",
            password: "admin",
            name: "System Support (Owner)",
            role: "master" as any,
            createdAt: new Date().toISOString()
        };
        db.users.push(owner);
        saveDB();
    }
    return owner;
}

// Get global system owner details
app.get("/api/admin/owner-details", (req, res) => {
    const owner = getOrCreateSystemOwner();
    res.json({ id: "system_owner", name: owner.name, email: owner.email });
});

app.get("/api/owner/chats/summary", (req, res) => {
  const { ownerId, activePartnerId } = req.query;
  if (!ownerId) return res.json([]);
  
  const uniquePartners = new Set<string>();
  
  // 1. Only populate existing partners who have sent or received messages to/from the owner
  db.chats.forEach(c => {
    if (c.senderId === ownerId) uniquePartners.add(c.receiverId);
    if (c.receiverId === ownerId) uniquePartners.add(c.senderId);
  });
  
  // 2. If there is a specific transition partner selected from the active users list, include them as well
  if (activePartnerId && typeof activePartnerId === 'string') {
    uniquePartners.add(activePartnerId);
  }
  
  // Make sure the owner doesn't end up in the partner list
  uniquePartners.delete(ownerId as string);
  
  const summaries = Array.from(uniquePartners).map(id => {
    const u = db.users.find(userObj => userObj.id === id);
    const lastMsg = db.chats.filter(c => (c.senderId === ownerId && c.receiverId === id) || (c.senderId === id && c.receiverId === ownerId)).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return { 
      userId: id, 
      name: u?.name || "Unknown", 
      role: u?.role || "user",
      appId: u?.appId || null,
      lastMessage: lastMsg?.text || "No messages yet", 
      timestamp: lastMsg?.timestamp || "1970-01-01T00:00:00.000Z" // older default timestamp so active ones bubble up
    };
  }).sort((a, b) => {
    // Put "No messages yet" active chats below chats with messages
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return bTime - aTime;
  }); // newest text on top
  
  res.json(summaries);
});

// Helper to get system owner (Master) details for an admin to chat with
app.get("/api/admin/:appId/owner", (req, res) => {
    const systemOwner = getOrCreateSystemOwner();
    res.json({ id: "system_owner", name: systemOwner.name, email: systemOwner.email, phone: systemOwner.phone });
});

app.post("/api/chats", (req, res) => {
  const { senderId, receiverId, text } = req.body;
  const newMsg = {
    id: Math.random().toString(36).substr(2, 9),
    senderId,
    receiverId,
    text,
    timestamp: new Date().toISOString()
  };
  db.chats.push(newMsg);
  saveDB();
  res.json(newMsg);
});

// Chat Summaries for Admin (Sub-app Admin)
app.get("/api/admin/:appId/chats/summary", (req, res) => {
    const { appId } = req.params;
    const { adminId } = req.query; // The actual user ID of the admin
    
    // Find all users (Firms/Students) who are members of this app
    const appUsers = db.users.filter(u => u.appId === appId && u.id !== adminId);
    
    const userSummaries = appUsers.map(u => {
        const lastMsg = db.chats.filter(c => 
            (c.senderId === adminId && c.receiverId === u.id) || 
            (c.senderId === u.id && c.receiverId === adminId)
        ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        return {
            userId: u.id,
            name: u.name,
            role: u.role,
            lastMessage: lastMsg?.text || "No messages yet",
            timestamp: lastMsg?.timestamp || null,
            email: u.email,
            phone: u.phone
        };
    });

    // Find all active group chats enabled for this appId
    const groupChats = db.forms.filter(f => f.appId === appId && f.status === 'ongoing' && f.groupChatEnabled === true);
    
    const groupSummaries = groupChats.map(f => {
        const lastMsg = db.chats.filter(c => c.receiverId === `group_${f.id}`).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        return {
            userId: `group_${f.id}`,
            name: `${f.auditLocation} (Group)`,
            role: "GROUP",
            lastMessage: lastMsg?.text || "No group messages yet",
            timestamp: lastMsg?.timestamp || null,
            email: `Group with ${f.firmName} & ${f.studentName || 'Student'}`,
            phone: ""
        };
    });
    
    res.json([...groupSummaries, ...userSummaries]);
});

app.get("/api/owner/stats", (req, res) => {
    const revenue = db.transactions.filter(t => t.status === 'completed').reduce((acc, t) => acc + (t.amountUSD || 0), 0);
    res.json({
        users: db.users.length,
        apps: db.apps.filter(a => !a.isDeleted).length,
        revenue: Math.round(revenue * 83) // INR
    });
});

app.get("/api/owner/apps", (req, res) => {
    res.json(db.apps.filter(a => !a.isDeleted));
});

app.put("/api/apps/:id/approval", (req, res) => {
    const idx = db.apps.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).send("Not found");
    db.apps[idx].onPlayStore = req.body.onPlayStore;
    saveDB();
    res.json(db.apps[idx]);
});

app.put("/api/apps/:id/play-store-link", (req, res) => {
    const idx = db.apps.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "App not found" });
    db.apps[idx].playStoreAppLink = req.body.playStoreAppLink;
    saveDB();
    res.json(db.apps[idx]);
});

// Admin Portal Logic
app.get("/api/admin/forms", (req, res) => {
    const { appId } = req.query;
    if (!appId) return res.json([]);
    res.json(db.forms.filter(f => f.appId === appId && f.status !== 'deleted'));
});

app.get("/api/admin/:appId/status", (req, res) => {
    const { appId } = req.params;
    // Count all forms that were EVER moved out of pending status for this appId
    // Including ongoing, approved, or deleted forms that were once processed
    const processedFormsCount = db.forms.filter(f => f.appId === appId && f.status !== 'pending').length;
    const activeSubs = db.subscriptions.filter(s => s.appId === appId && s.isActive);
    
    const sub = activeSubs.find(s => ['unlimited_entries_1m', 'unlimited_entries_6m', 'unlimited_entries_12m'].includes(s.type));
    
    res.json({
        formCount: processedFormsCount,
        subscription: sub || null
    });
});

app.post("/api/admin/forms/:id/process", (req, res) => {
    const { id } = req.params;
    const { adminPayment, adminTerms, hiddenFields, customFields } = req.body;
    
    const form = db.forms.find(f => f.id === id);
    if (!form) return res.status(404).send("Form not found");

    const adminId = form.appId;
    const adminForms = db.forms.filter(f => f.appId === adminId);
    const approvedCount = adminForms.filter(f => f.status !== 'pending' && f.status !== 'deleted').length;

    const hasUnlimited = db.subscriptions.some(s => 
        s.appId === adminId && 
        s.isActive && 
        ['unlimited_entries_1m', 'unlimited_entries_6m', 'unlimited_entries_12m'].includes(s.type)
    );

    if (!hasUnlimited && approvedCount >= 800) {
        return res.status(403).json({ error: "LIMIT_EXCEEDED", message: "You have reached your 800-form limit. Please subscribe to continue." });
    }

    form.adminPayment = adminPayment;
    form.adminTerms = adminTerms;
    form.hiddenFields = hiddenFields;
    form.customFields = customFields;
    form.status = 'approved_by_admin';
    
    saveDB();
    res.json(form);
});

app.delete("/api/admin/forms/:id", (req, res) => {
    const idx = db.forms.findIndex(f => f.id === req.params.id);
    if (idx !== -1) {
        db.forms[idx].status = 'deleted';
        saveDB();
    }
    res.json({ success: true });
});

app.get("/api/admin/:appId/users", (req, res) => {
    const { appId } = req.params;
    const forms = db.forms.filter(f => f.appId === appId);
    const userIds = new Set();
    forms.forEach(f => {
        userIds.add(f.firmId);
        if (f.studentId) userIds.add(f.studentId);
    });
    
    const users = db.users.filter(u => userIds.has(u.id));
    res.json(users);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
