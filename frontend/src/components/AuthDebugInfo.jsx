import { useAuth } from '@/contexts/AuthContext';

const AuthDebugInfo = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading auth debug...</div>;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug Info:</h4>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>User Email:</strong> {user?.email || 'None'}</p>
      <p><strong>Email Confirmed:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
      <p><strong>Email Confirmed At:</strong> {user?.email_confirmed_at || 'N/A'}</p>
      <p><strong>User ID:</strong> {user?.id || 'None'}</p>
      <p><strong>Current Path:</strong> {window.location.pathname}</p>
    </div>
  );
};

export default AuthDebugInfo;