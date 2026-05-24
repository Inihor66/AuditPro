export enum UserRole {
  MASTER = 'master',
  OWNER = 'owner', // Hidden portal
  FIRM = 'firm',
  ADMIN = 'admin',
  STUDENT = 'student'
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  phone?: string;
  location?: string;
  auditLocation?: string;
  appId?: string; // App context for firms/admins/students
  createdAt: string;
}

export interface AppInstance {
  id: string;
  name: string;
  ownerId: string;
  link: string;
  createdAt: string;
  isDeleted: boolean;
  onPlayStore: boolean;
  playStoreAppLink?: string;
  playStoreState?: 'none' | 'payment_submitted' | 'pending_verification' | 'review_in_progress' | 'published';
  associatedTxn?: any;
}

export interface AuditForm {
  id: string;
  appId: string;
  firmId: string;
  firmName: string;
  firmEmail: string;
  firmPhone: string;
  auditLocation: string;
  payment: number;
  auditDate: string;
  creditPeriod: number;
  terms: string;
  status: 'pending' | 'approved_by_admin' | 'ongoing' | 'completed' | 'deleted';
  adminPayment?: number;
  adminTerms?: string;
  hiddenFields?: string[];
  customFields?: { label: string; value: string }[];
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentQualification?: string;
  submittedAt?: string;
  groupChatEnabled?: boolean;
}

export type SubscriptionType = 
  | 'master_new_app' 
  | 'master_play_store' 
  | 'firm_monthly' 
  | 'firm_6month' 
  | 'firm_12month' 
  | 'admin_monthly' 
  | 'admin_6month' 
  | 'admin_12month'
  | 'unlimited_entries_1m'
  | 'unlimited_entries_6m'
  | 'unlimited_entries_12m';

export interface Subscription {
  id: string;
  userId: string;
  appId?: string;
  type: SubscriptionType;
  price: number;
  expiryDate: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string; // Group ID or User ID
  message: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  upiId: string;
  status: 'pending' | 'completed';
  timestamp: string;
}
