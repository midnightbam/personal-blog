import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    console.log('🔵 ProtectedRoute mounted');
    console.log('🔵 Auth loading:', authLoading);
    console.log('🔵 User:', user);
    console.log('🔵 Require admin:', requireAdmin);
    
    setDebugInfo(`Auth loading: ${authLoading}, User: ${user?.email || 'none'}`);

    const checkRole = async () => {
      console.log('🔵 Starting role check...');
      
      if (!user) {
        console.log('🔵 No user, skipping role check');
        setRoleLoading(false);
        return;
      }

      try {
        console.log('🔵 Checking role for user:', user.id);
        setDebugInfo(`Checking role for: ${user.email}`);
        
        const timeoutId = setTimeout(() => {
          console.warn('🟡 Role check timeout');
          setIsAdmin(false);
          setRoleLoading(false);
        }, 10000);

        const { data, error: roleError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        clearTimeout(timeoutId);

        if (roleError) {
          console.warn('🟡 Error fetching role:', roleError);
          console.log('🟡 Error code:', roleError.code);
          console.log('🟡 Error message:', roleError.message);
          setDebugInfo(`Role error: ${roleError.message}`);
          setIsAdmin(false);
        } else if (data?.role === 'admin') {
          console.log('✅ User IS admin');
          setDebugInfo('User is admin ✅');
          setIsAdmin(true);
        } else {
          console.log('ℹ️ User role:', data?.role || 'not set');
          setDebugInfo(`User role: ${data?.role || 'not set'}`);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('❌ Error checking role:', err);
        setDebugInfo(`Error: ${err.message}`);
        setError(err.message);
        setIsAdmin(false);
      } finally {
        setRoleLoading(false);
      }
    };

    if (!authLoading) {
      checkRole();
    }
  }, [user, authLoading, requireAdmin]);

  console.log('🔵 Render state - authLoading:', authLoading, 'roleLoading:', roleLoading, 'isAdmin:', isAdmin);

  // Show loading screen
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
          <p className="text-gray-500 text-sm mt-4">{debugInfo}</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    console.log('❌ No user - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Requires admin but user is not admin
  if (requireAdmin && !isAdmin) {
    console.log('❌ User not admin - redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Error occurred
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-4">Error Loading User Role</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ ProtectedRoute - Access granted');
  return children;
}