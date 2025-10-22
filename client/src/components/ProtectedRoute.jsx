import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionValid, setSessionValid] = useState(true);

  useEffect(() => {
    console.log('🔵 ProtectedRoute mounted');
    console.log('🔵 Auth loading:', authLoading);
    console.log('🔵 User:', user);
    console.log('🔵 Require admin:', requireAdmin);

    // Validate session before proceeding
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.warn('⚠️ Session invalid, attempting recovery...');
          
          // Try to recover with refresh token
          const { data: { session: recoveredSession }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !recoveredSession) {
            console.error('❌ Session recovery failed');
            setSessionValid(false);
            return false;
          }
          console.log('✅ Session recovered');
        }
        setSessionValid(true);
        return true;
      } catch (err) {
        console.error('❌ Session validation error:', err);
        setSessionValid(false);
        return false;
      }
    };

    const checkRole = async () => {
      console.log('🔵 Starting role check...');
      
      if (!user) {
        console.log('🔵 No user, skipping role check');
        setRoleLoading(false);
        return;
      }

      try {
        console.log('🔵 Checking role for user:', user.id);
        
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
          setIsAdmin(false);
        } else if (data?.role === 'admin') {
          console.log('✅ User IS admin');
          setIsAdmin(true);
        } else {
          console.log('ℹ️ User role:', data?.role || 'not set');
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('❌ Error checking role:', err);
        setError(err.message);
        setIsAdmin(false);
      } finally {
        setRoleLoading(false);
      }
    };

    if (!authLoading) {
      validateSession().then(isValid => {
        if (isValid) {
          checkRole();
        } else {
          setRoleLoading(false);
        }
      });
    }
  }, [user, authLoading, requireAdmin]);

  console.log('🔵 Render state - authLoading:', authLoading, 'roleLoading:', roleLoading, 'isAdmin:', isAdmin, 'sessionValid:', sessionValid);

  // Session not valid - try to recover
  if (!sessionValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-4">Session expired. Please log in again.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading screen
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
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