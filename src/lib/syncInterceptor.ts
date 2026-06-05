// Local backups and Synchronization Interceptor for Vercel Serverless Stateless DB
// Ensures created data (apps, forms, chats, transactions, etc.) is persistent in user's browser localStorage

function getActiveUserId(): string | undefined {
  try {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      const u = JSON.parse(saved);
      return u?.id;
    }
  } catch (_) {}
  return undefined;
}

function getLocalList(key: string): any[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (_) {}
  return [];
}

function setLocalList(key: string, list: any[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (_) {}
}

function upsertItems(key: string, incoming: any[]) {
  if (!Array.isArray(incoming) || incoming.length === 0) return;
  const existing = getLocalList(key);
  const map = new Map();
  existing.forEach(item => {
    if (item && item.id) map.set(item.id, item);
  });
  incoming.forEach(item => {
    if (item && item.id) map.set(item.id, item);
  });
  setLocalList(key, Array.from(map.values()));
}

function upsertSingleItem(key: string, item: any) {
  if (!item || !item.id) return;
  const existing = getLocalList(key);
  const map = new Map();
  existing.forEach(x => {
    if (x && x.id) map.set(x.id, x);
  });
  map.set(item.id, item);
  setLocalList(key, Array.from(map.values()));
}

function deleteFormItem(userId: string, formId: string) {
  const existing = getLocalList(`backup_forms_${userId}`);
  const updated = existing.map(item => {
    if (item && item.id === formId) {
      return { ...item, status: 'deleted' };
    }
    return item;
  });
  setLocalList(`backup_forms_${userId}`, updated);
}

// Global fetch Interceptor setup
const originalFetch = window.fetch;

try {
  const interceptorFetch = async function(input: any, init: any) {
    const response = await originalFetch(input, init);
    
    if (response.ok) {
      const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
      const method = init?.method?.toUpperCase() || 'GET';
      const userId = getActiveUserId();

      if (url.includes('/api/')) {
        const cloned = response.clone();
        cloned.json().then(data => {
          if (!data) return;

          // 1. Users backup
          if (url.includes('/api/auth/signup') || url.includes('/api/auth/login') || url.includes('/api/auth/profile')) {
            upsertSingleItem('backup_users', data);
          }
          else if (url.includes('/api/owner/users') || (url.includes('/api/admin/') && url.includes('/users'))) {
            if (Array.isArray(data)) {
              upsertItems('backup_users', data);
            }
          }

          // Check if user is active for namespace-specific backups
          if (!userId) return;

          // 2. Apps Backup
          if (url.includes('/api/apps')) {
            if (method === 'GET') {
              if (Array.isArray(data)) {
                upsertItems(`backup_apps_${userId}`, data);
              } else if (data && data.id) {
                upsertSingleItem(`backup_apps_${userId}`, data);
              }
            } else if (method === 'POST' || method === 'PUT') {
              upsertSingleItem(`backup_apps_${userId}`, data);
            }
          }

          // 3. Forms Backup
          else if (url.includes('/api/forms') || url.includes('/api/admin/forms')) {
            if (method === 'GET') {
              if (Array.isArray(data)) {
                upsertItems(`backup_forms_${userId}`, data);
              } else if (data && data.id) {
                upsertSingleItem(`backup_forms_${userId}`, data);
              }
            } else if (method === 'POST' || method === 'PUT') {
              upsertSingleItem(`backup_forms_${userId}`, data);
            } else if (method === 'DELETE') {
              const parts = url.split('/');
              const formId = parts[parts.length - 1]?.split('?')[0];
              if (formId) {
                deleteFormItem(userId, formId);
              }
            }
          }

          // 4. Subscriptions Backup
          else if (url.includes('/api/subscriptions/status')) {
            if (Array.isArray(data)) {
              upsertItems(`backup_subscriptions_${userId}`, data);
            }
          }

          // 5. Chats Backup
          else if (url.includes('/api/chats')) {
            if (Array.isArray(data)) {
              upsertItems(`backup_chats_${userId}`, data);
            } else if (data && data.id) {
              upsertSingleItem(`backup_chats_${userId}`, data);
            }
          }

          // 6. Transactions Backup
          else if (url.includes('/api/master/transactions') || url.includes('/api/admin/payments/pending')) {
            if (Array.isArray(data)) {
              upsertItems(`backup_transactions_${userId}`, data);
            }
          }
          else if (url.includes('/api/payments/create')) {
            if (data && data.transaction) {
              upsertSingleItem(`backup_transactions_${userId}`, data.transaction);
            }
          }

        }).catch(() => {
          // Suppress parsed error
        });
      }
    }

    return response;
  };

  Object.defineProperty(window, 'fetch', {
    value: interceptorFetch,
    configurable: true,
    writable: true,
    enumerable: true
  });
} catch (err) {
  console.error('[SYNC INTERCEPTOR] Failed to safely patch window.fetch:', err);
}

// Formulates the full backups payload for syncing with the cloud
export function getSyncPayload(user: any) {
  if (!user || !user.id) return { user };
  const userId = user.id;
  return {
    user,
    backupUsers: getLocalList('backup_users'),
    backupApps: getLocalList(`backup_apps_${userId}`),
    backupForms: getLocalList(`backup_forms_${userId}`),
    backupSubscriptions: getLocalList(`backup_subscriptions_${userId}`),
    backupChats: getLocalList(`backup_chats_${userId}`),
    backupTransactions: getLocalList(`backup_transactions_${userId}`)
  };
}
