import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthTest = () => {
  const { signUp, signIn, signOut, isAuthenticated, user, loading } = useAuth();
  const [email, setEmail] = useState('user@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [result, setResult] = useState('');

  const handleSignUp = async () => {
    setResult('Creating account...');
    const { data, error } = await signUp(email, password, { full_name: 'Test User' });
    setResult(error ? `Error: ${error.message}` : `Success: ${JSON.stringify(data)}`);
  };

  const handleSignIn = async () => {
    setResult('Signing in...');
    const { data, error } = await signIn(email, password);
    setResult(error ? `Error: ${error.message}` : `Success: ${JSON.stringify(data)}`);
  };

  const handleSignOut = async () => {
    setResult('Signing out...');
    const { error } = await signOut();
    setResult(error ? `Error: ${error.message}` : 'Signed out successfully');
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Status:</strong> {loading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </div>
        <div>
          <strong>User:</strong> {user ? user.email : 'None'}
        </div>
        
        <div className="space-y-2">
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <div className="space-y-2">
          <Button onClick={handleSignUp} className="w-full">Sign Up</Button>
          <Button onClick={handleSignIn} className="w-full" variant="outline">Sign In</Button>
          <Button onClick={handleSignOut} className="w-full" variant="destructive">Sign Out</Button>
        </div>

        {result && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
            <strong>Result:</strong> {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthTest;