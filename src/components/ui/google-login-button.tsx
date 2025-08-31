import * as React from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/lib/auth';

import { Button } from './button';
import { GoogleIcon } from './icons';
import { Text } from './text';

type Props = {
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

export function GoogleLoginButton({ onSuccess, onError }: Props) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    console.log('Google login button pressed');

    try {
      setIsLoading(true);
      console.log('Calling signInWithGoogle...');

      const { error } = await signInWithGoogle();
      console.log('signInWithGoogle result:', { error });

      if (error) {
        console.error('Google login error:', error);
        Alert.alert(
          'Google Login Error',
          error.message || 'Failed to sign in with Google'
        );
        onError?.(error);
      } else {
        console.log('Google login successful');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Google login exception:', error);
      Alert.alert('Google Login Error', 'An unexpected error occurred');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onPress={handleGoogleLogin}
      disabled={isLoading}
      variant="outline"
      className="w-full flex-row items-center justify-center border-0"
    >
      <GoogleIcon size={20} />
      <Text className="ml-3 font-medium text-neutral-800">
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Text>
    </Button>
  );
}
