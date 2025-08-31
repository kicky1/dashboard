import * as React from 'react';
import { Alert } from 'react-native';

import { Button, GoogleLoginButton, Input, Text, View } from '@/components/ui';
import { useAuth } from '@/lib/auth';

type Props = {
  onSuccess?: () => void;
};

function LoginHeader({ isSignUp }: { isSignUp: boolean }) {
  return (
    <View className="mb-8 space-y-3">
      <Text className="text-center text-3xl font-bold text-neutral-900 dark:text-white">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </Text>
      <Text className="text-center text-lg text-neutral-600 dark:text-neutral-400">
        {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
      </Text>
    </View>
  );
}

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onSubmit,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}) {
  return (
    <View className="w-full space-y-6">
      <View className="space-y-4">
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />
      </View>

      <Button
        onPress={onSubmit}
        disabled={isLoading}
        loading={isLoading}
        size="lg"
        className="w-full"
        label={isLoading ? 'Loading...' : 'Submit'}
      />
    </View>
  );
}

function LoginToggle({
  isSignUp,
  onToggle,
}: {
  isSignUp: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="mt-8 flex-row justify-center">
      <Text className="text-neutral-600 dark:text-neutral-400">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
      </Text>
      <Text
        onPress={onToggle}
        className="ml-1 text-blue-600 dark:text-blue-400"
      >
        {isSignUp ? 'Sign In' : 'Sign Up'}
      </Text>
    </View>
  );
}

export function SupabaseLoginForm({ onSuccess }: Props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        onSuccess?.();
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="w-full max-w-sm space-y-6">
      <LoginHeader isSignUp={isSignUp} />
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      {/* Divider */}
      <View className="mb-2 mt-1 flex-row items-center">
        <View className="h-px flex-1 bg-neutral-300 dark:bg-neutral-600" />
        <Text className="mx-4 text-sm text-neutral-500 dark:text-neutral-400">
          or
        </Text>
        <View className="h-px flex-1 bg-neutral-300 dark:bg-neutral-600" />
      </View>

      {/* Google Login Button */}
      <GoogleLoginButton />

      <LoginToggle
        isSignUp={isSignUp}
        onToggle={() => setIsSignUp(!isSignUp)}
      />
    </View>
  );
}
