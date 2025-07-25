import { useAuth } from './AuthProvider';
import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AdminRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAdminRole = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.role === 'admin');
      }
      setLoading(false);
    };

    checkAdminRole();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return <div>Verificando permissões...</div>; // Ou um spinner/skeleton
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
