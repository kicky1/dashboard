import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

const handleCodeCallback = async (code: string, router: any) => {
  console.log('=== HANDLING CODE CALLBACK ===');
  console.log('Auth callback received code:', code);

  try {
    console.log('Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      router.replace('/login');
      return;
    }

    if (data.session) {
      console.log('Session established successfully:', data.session);
      console.log('User:', data.user);
      console.log('Navigating to (app)...');
      router.replace('/(app)');
    } else {
      console.log('No session found after code exchange');
      console.log('Data received:', data);
      router.replace('/login');
    }
  } catch (err) {
    console.error('Unexpected error in code callback:', err);
    router.replace('/login');
  }
};

const handleAccessTokenCallback = async (router: any) => {
  console.log('=== HANDLING ACCESS TOKEN CALLBACK ===');
  console.log('Auth callback received access token');
  // Wait a moment for the session to be processed
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('Checking for session...');
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    console.log('Session established successfully');
    console.log('User:', session.user);
    console.log('Navigating to (app)...');
    router.replace('/(app)');
  } else {
    console.log('No session found after callback');
    router.replace('/login');
  }
};

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== AUTH CALLBACK STARTED ===');
        console.log('Auth callback params:', params);

        if (params.code) {
          console.log('Processing code callback...');
          await handleCodeCallback(params.code as string, router);
        } else if (params.access_token) {
          console.log('Processing access token callback...');
          await handleAccessTokenCallback(router);
        } else if (params.error) {
          console.error('Auth callback error:', params.error);
          console.error('Error description:', params.error_description);
          router.replace('/login');
        } else if (params.error_description) {
          console.error(
            'Auth callback error description:',
            params.error_description
          );
          router.replace('/login');
        } else {
          console.log('No auth parameters found');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        router.replace('/login');
      }
    };

    handleAuthCallback();
  }, [params, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2E3C4B" />
      <Text className="mt-4 text-lg text-neutral-800">
        Completing sign in...
      </Text>
    </View>
  );
}
