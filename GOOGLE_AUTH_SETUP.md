# Google Authentication Setup with Supabase

This guide explains how to set up Google authentication in your React Native/Expo app using Supabase.

## Prerequisites

1. A Supabase project with authentication enabled
2. Google Cloud Console project with OAuth 2.0 credentials
3. React Native/Expo app with Supabase integration

## Step 1: Configure Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add authorized redirect URIs:
   - For development: `https://sktcnsxhpzqtkyajhywe.supabase.co/auth/v1/callback`
   - For production: `https://your-project.supabase.co/auth/v1/callback`
7. Note down your Client ID and Client Secret

## Step 2: Configure Supabase Authentication

1. In your Supabase dashboard, go to Authentication → Providers
2. Find Google in the list and click "Enable"
3. Enter your Google OAuth credentials:
   - Client ID: Your Google OAuth client ID
   - Client Secret: Your Google OAuth client secret
4. Save the configuration

## Step 3: Update Your App Configuration

### Environment Variables

Add your Google OAuth client ID to your environment files:

```bash
# .env.development
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# .env.staging
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# .env.production
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Supabase Configuration

Update your Supabase client configuration to include the Google client ID:

```typescript
// src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
```

## Step 4: Install Required Packages

```bash
npx expo install expo-auth-session expo-crypto
```

## Step 5: Update Auth Context

Your auth context should include the Google sign-in method:

```typescript
// src/lib/auth/auth-context.tsx
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'exp://localhost:8081', // Update for your app
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { error };
};
```

## Step 6: Create Google Login Button

```typescript
// src/components/ui/google-login-button.tsx
import { GoogleIcon } from '@/components/ui/icons';
import { useAuth } from '@/lib/auth';

export function GoogleLoginButton({ onSuccess, onError }: Props) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithGoogle();

      if (error) {
        onError?.(error);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleGoogleLogin}
      disabled={isLoading}
      className="w-full bg-white border border-neutral-300 rounded-lg py-3 px-4 flex-row items-center justify-center"
    >
      <GoogleIcon size={20} />
      <Text className="text-neutral-800 font-medium ml-3">
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Text>
    </TouchableOpacity>
  );
}
```

## Step 7: Add to Login Form

```typescript
// src/components/login-form.tsx
import { GoogleLoginButton } from '@/components/ui';

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  // ... existing form code ...

  return (
    <View>
      {/* ... existing form fields ... */}

      <Button
        label="Login"
        onPress={handleSubmit(onSubmit)}
        size="lg"
        className="w-full mb-4"
      />

      <View className="flex-row items-center mb-4">
        <View className="flex-1 h-[1px] bg-neutral-300" />
        <Text className="mx-4 text-neutral-500">or</Text>
        <View className="flex-1 h-[1px] bg-neutral-300" />
      </View>

      <GoogleLoginButton
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />
    </View>
  );
};
```

## Step 8: Handle Deep Linking

For Expo apps, you need to handle deep linking when users return from Google authentication:

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url.includes('access_token') || url.includes('error')) {
        // Handle the OAuth callback
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN') {
            // User successfully signed in
          }
        });
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, []);

  // ... rest of your layout
}
```

## Testing

1. Run your app: `pnpm start`
2. Navigate to the login screen
3. Tap the "Continue with Google" button
4. You should be redirected to Google's OAuth consent screen
5. After authentication, you should be redirected back to your app

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**: Make sure your redirect URI in Google Cloud Console matches exactly with what Supabase expects
2. **"Client ID not found" error**: Verify your Google OAuth credentials are correctly configured in Supabase
3. **Deep linking not working**: Ensure your app is properly configured to handle deep links

### Debug Tips

- Check the browser console for OAuth errors
- Verify your Supabase project settings
- Test with a simple redirect URI first
- Use Expo's development build for testing OAuth flows

## Security Considerations

- Never expose your Google OAuth client secret in client-side code
- Use environment variables for sensitive configuration
- Implement proper error handling for authentication failures
- Consider adding additional security measures like 2FA for production apps

## Next Steps

After implementing Google authentication:

1. Add user profile management
2. Implement role-based access control
3. Add additional OAuth providers (GitHub, Apple, etc.)
4. Set up user data synchronization
5. Add logout functionality
6. Implement session persistence

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [React Native Deep Linking](https://reactnative.dev/docs/linking)
