import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    console.log('AuthContext: Initializing authentication...');
    
    // Clear any old localStorage authentication data that might interfere
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('AuthContext: Error clearing localStorage:', error);
    }
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting session:', error);
          setIsAuthenticated(false);
          setUser(null);
        } else if (session?.user && session?.access_token) {
          console.log('AuthContext: Valid session found for user:', session.user.email);
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          console.log('AuthContext: No valid session found');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, {
          hasSession: !!session,
          hasUser: !!session?.user,
          email: session?.user?.email,
          emailConfirmed: session?.user?.email_confirmed_at,
          hasAccessToken: !!session?.access_token,
          currentPath: window.location.pathname
        });
        
        // IMPORTANT: Don't automatically set authentication state during signup
        if (event === 'SIGNED_UP') {
          console.log('AuthContext: SIGNED_UP event - NOT setting auth state to prevent redirect');
          // Don't set user or isAuthenticated here during signup
          setLoading(false);
          return;
        }
        
        if (session?.user && session?.access_token) {
          console.log('AuthContext: Setting authenticated user:', session.user.email);
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          console.log('AuthContext: Clearing user authentication');
          setUser(null);
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, userData = {}) => {
    try {
      console.log('AuthContext: Starting sign up for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // Additional user metadata
        }
      });

      console.log('AuthContext: Sign up response:', {
        hasData: !!data,
        hasUser: !!data?.user,
        userEmail: data?.user?.email,
        emailConfirmed: data?.user?.email_confirmed_at,
        hasSession: !!data?.session,
        sessionAccessToken: !!data?.session?.access_token,
        error: error?.message
      });

      if (error) {
        console.error('AuthContext: Sign up error:', error);
        throw error;
      }

      // Add a small delay to ensure proper state handling
      await new Promise(resolve => setTimeout(resolve, 100));

      return { data, error: null };
    } catch (error) {
      console.error('AuthContext: Error signing up:', error);
      return { data: null, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      console.log('AuthContext: Attempting signInWithPassword for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('AuthContext: Sign in response:', {
        hasData: !!data,
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        userEmail: data?.user?.email,
        error: error?.message
      });

      if (error) {
        console.error('AuthContext: Sign in error:', error);
        throw error;
      }

      if (data?.user) {
        console.log('AuthContext: Sign in successful for:', data.user.email);
      }

      return { data, error: null };
    } catch (error) {
      console.error('AuthContext: Error signing in:', error);
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear PIN verification from session storage
      if (user?.id) {
        sessionStorage.removeItem(`pin_verified_${user.id}`);
      }
      
      setUser(null);
      setIsAuthenticated(false);
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error };
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { data: null, error };
    }
  };

  // Email verification functions
  const resendConfirmation = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      return { error };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { error: error.message };
    }
  };

  const checkEmailVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email_confirmed_at ? true : false;
    } catch (error) {
      console.error('Check email verification error:', error);
      return false;
    }
  };

  // Profile management functions
  const createUserProfile = async (profileData) => {
    try {
      console.log('Creating user profile:', profileData);
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      
      // Prepare the profile data for user_profiles table
      const profilePayload = {
        user_id: user.id,
        full_name: profileData.full_name || null,
        phone: profileData.phone || null,
        date_of_birth: profileData.date_of_birth || null,
        occupation: profileData.occupation || null,
        monthly_income: profileData.monthly_income ? parseFloat(profileData.monthly_income) : null,
        financial_goals: profileData.financial_goals || null
      };

      console.log('DEBUG: About to insert profile payload:', profilePayload);

      // Insert into user_profiles table (should work now with auth.users FK)
      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profilePayload])
        .select();

      console.log('DEBUG: Insert response:', { data: profileResult, error: profileError });

      if (profileError) {
        console.error('Create user_profiles error:', profileError);
        return { success: false, error: `Failed to create profile: ${profileError.message}` };
      }

      console.log('user_profiles record created successfully:', profileResult);
      
      // Store full_name in users table since user_profiles doesn't have this field
      if (profileData.full_name) {
        try {
          const { error: usersUpdateError } = await supabase
            .from('users')
            .upsert([{
              user_id: user.id,
              full_name: profileData.full_name,
              created_at: new Date().toISOString()
            }]);
          
          if (usersUpdateError) {
            console.warn('Could not update users table with full_name:', usersUpdateError);
          } else {
            console.log('Full name stored in users table');
          }
        } catch (err) {
          console.warn('Error updating users table:', err);
        }
      }

      // Create PIN record in user_profiles (if provided)
      if (profileData.pin) {
        try {
          const hashedPin = btoa(profileData.pin);
          const { error: pinError } = await supabase
            .from('user_profiles')
            .update({
              secret_pin: hashedPin,
              pin_created_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (pinError) {
            console.warn('Could not update secret_pin in user_profiles:', pinError.message);
          } else {
            console.log('secret_pin updated in user_profiles successfully');
          }
        } catch (pinErr) {
          console.warn('secret_pin update failed:', pinErr.message);
        }
      }

      console.log('Profile creation completed successfully');
      return { success: true, data: profileResult };
    } catch (error) {
      console.error('Create profile unexpected error:', error);
      return { success: false, error: error.message };
    }
  };

  // PIN management functions
  const createSecretPin = async (pin) => {
    try {
      console.log('Creating secret PIN');
      
      // Hash the PIN before storing (using simple base64 - use bcrypt in production)
      const hashedPin = btoa(pin);
      
      // Store PIN in user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          secret_pin: hashedPin,
          pin_created_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Create PIN in user_profiles table error:', error);
        return { success: false, error: error.message };
      }

      console.log('PIN created in user_profiles table successfully');
      return { success: true, data: userData };
    } catch (error) {
      console.error('Create PIN unexpected error:', error);
      return { success: false, error: error.message };
    }
  };

  const verifySecretPin = async (pin) => {
    try {
      console.log('Verifying secret PIN');
      
      // Check user_profiles table for secret_pin
      const { data, error } = await supabase
        .from('user_profiles')
        .select('secret_pin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Verify PIN from user_profiles table error:', error);
        return { success: false, error: error.message };
      }

      if (!data?.secret_pin) {
        return { success: false, error: 'No PIN found. Please create a PIN first.' };
      }

      // Compare with stored PIN (decode base64 - use bcrypt in production)
      const storedPin = atob(data.secret_pin);
      const isValid = storedPin === pin;

      if (isValid) {
        console.log('PIN verified successfully from user_profiles table');
        return { success: true };
      } else {
        console.log('Invalid PIN');
        return { success: false, error: 'Invalid PIN' };
      }
    } catch (error) {
      console.error('Verify PIN unexpected error:', error);
      return { success: false, error: error.message };
    }
  };

  // Check user profile and PIN status
  const checkUserStatus = async () => {
    try {
      if (!user) return { hasProfile: false, hasPin: false };
      
      console.log('Checking user status for user ID:', user.id);
      
      // Check user_profiles table for both profile data and PIN
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, phone, occupation, secret_pin')
        .eq('user_id', user.id)
        .single();
      
      console.log('user_profiles check:', { data: profileData, error: profileError });
      
      // Determine status based on data found
      const hasProfile = !!profileData && profileError?.code !== 'PGRST116';
      const hasPin = hasProfile && !!profileData?.secret_pin;
      
      console.log('Final user status:', { hasProfile, hasPin });
      
      return { hasProfile, hasPin };
    } catch (error) {
      console.error('Check user status unexpected error:', error);
      return { hasProfile: false, hasPin: false };
    }
  };

  // Legacy methods for backward compatibility
  const login = (userData) => {
    console.warn('login() is deprecated. Use signIn() instead.');
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    console.warn('logout() is deprecated. Use signOut() instead.');
    signOut();
  };

  const value = {
    // State
    isAuthenticated,
    user,
    loading,
    
    // Supabase Auth methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    
    // Email verification methods
    resendConfirmation,
    checkEmailVerification,
    
    // Profile management methods
    createUserProfile,
    createSecretPin,
    verifySecretPin,
    checkUserStatus,
    
    // Legacy methods (deprecated)
    login,
    logout,
    
    // Supabase client for direct access if needed
    supabase
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};