import { useRouter } from 'expo-router';
import * as React from 'react';

import { useAuth } from './auth-context';

export function useAuthGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

export function useRedirectIfAuthenticated() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(app)');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}
