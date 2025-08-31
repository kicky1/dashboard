import { type Session, type User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';

import { supabase } from '../supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  clearAllData: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const handleOAuthResult = (result: any) => {
  if (result.type === 'success' && result.url) {
    console.log('OAuth flow completed successfully');
    console.log('Final URL:', result.url);

    // Check if the URL contains an error
    if (result.url.includes('error=')) {
      const urlParams = new URLSearchParams(result.url.split('?')[1]);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (error) {
        console.error('OAuth error in URL:', error, errorDescription);
        return {
          error: {
            message: errorDescription || error || 'OAuth authentication failed',
          },
        };
      }
    }

    // Check if we have a code in the URL
    if (result.url.includes('code=')) {
      console.log('OAuth code found in URL, session should be established');
      return { error: null };
    }

    return { error: null };
  } else if (result.type === 'cancel') {
    return { error: { message: 'OAuth flow was cancelled' } };
  } else {
    return { error: { message: 'OAuth flow failed' } };
  }
};

const exchangeCodeForSession = async (code: string) => {
  console.log('Code extracted, exchanging for session...');

  // Exchange the code for a session
  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    console.error('Error exchanging code for session:', sessionError);
    return { error: sessionError };
  }

  if (sessionData.session) {
    console.log('Session established successfully');
    return { error: null };
  } else {
    console.log('No session established after code exchange');
    return { error: { message: 'No session established' } };
  }
};

const performGoogleOAuth = async () => {
  console.log('Starting OAuth flow with provider: google');

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'dashboard-app://auth-callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    console.log('Supabase OAuth result:', { data, error });

    if (error) {
      console.error('OAuth error from Supabase:', error);
      return { error };
    }

    if (data.url) {
      console.log('Opening OAuth URL in browser:', data.url);

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        'dashboard-app://auth-callback'
      );

      console.log('WebBrowser result:', result);

      // After OAuth completion, we need to manually exchange the code for a session
      if (result.type === 'success' && result.url) {
        console.log(
          'OAuth completed successfully, need to navigate to callback'
        );

        // Extract the code from the URL
        if (result.url.includes('code=')) {
          const urlParams = new URLSearchParams(result.url.split('?')[1]);
          const code = urlParams.get('code');

          if (code) {
            return await exchangeCodeForSession(code);
          }
        }

        return { error: null };
      }

      return handleOAuthResult(result);
    }

    console.log('No OAuth URL generated');
    return { error: { message: 'No OAuth URL generated' } };
  } catch (err) {
    console.error('Error in performGoogleOAuth:', err);
    return { error: err };
  }
};

function useAuthFunctions() {
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    console.log('signInWithGoogle called');
    try {
      return await performGoogleOAuth();
    } catch (err) {
      console.error('Error in signInWithGoogle:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const clearAllData = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear AsyncStorage manually
      const AsyncStorage = await import(
        '@react-native-async-storage/async-storage'
      );
      await AsyncStorage.default.clear();

      // Clear MMKV storage if available
      try {
        const { MMKV } = await import('react-native-mmkv');
        const storage = new MMKV();
        storage.clearAll();
      } catch (mmkvError) {
        console.log('MMKV not available or error clearing:', mmkvError);
      }

      console.log('All authentication data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearAllData,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const authFunctions = useAuthFunctions();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    isLoading,
    ...authFunctions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
