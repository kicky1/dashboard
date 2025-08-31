import { useRouter } from 'expo-router';
import React from 'react';

import { SupabaseLoginForm } from '@/components/supabase-login-form';
import { FocusAwareStatusBar, SafeAreaView, View } from '@/components/ui';
import { useRedirectIfAuthenticated } from '@/lib/auth';

export default function Login() {
  const router = useRouter();
  const { isLoading } = useRedirectIfAuthenticated();

  const handleSuccess = () => {
    router.replace('/(app)');
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <View className="flex h-full bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <View className="flex-1 items-center justify-center px-6">
        <SupabaseLoginForm onSuccess={handleSuccess} />
      </View>
      <SafeAreaView />
    </View>
  );
}
