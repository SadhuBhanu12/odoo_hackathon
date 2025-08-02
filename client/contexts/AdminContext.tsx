import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

// Admin email addresses - you can add more admin emails here
const ADMIN_EMAILS = [
  'admin@civictrack.com',
  'admin@example.com',
  'superadmin@civictrack.com'
];

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  adminEmails: string[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

interface AdminProviderProps {
  children: React.ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }
  }, [user, authLoading]);

  const value = {
    isAdmin,
    loading,
    adminEmails: ADMIN_EMAILS,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
