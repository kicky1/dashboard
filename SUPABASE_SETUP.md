# Supabase Authentication Setup

This guide will help you set up Supabase authentication for your React Native/Expo app.

## Prerequisites

1. A Supabase account and project
2. Your Supabase project URL and anon key

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Create a new project
3. Note down your project URL and anon key from the project settings

### 2. Configure Environment Variables

Update your environment files with your Supabase credentials:

```bash
# .env.development
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# .env.staging
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# .env.production
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Configure Supabase Authentication

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Configure your site URL (for development: `exp://localhost:8081`)
3. Add redirect URLs for your app
4. Configure email templates if needed

### 4. Enable Email Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email settings

### 5. Test the Setup

1. Run your app: `pnpm start`
2. Navigate to the login screen
3. Try creating an account and signing in

## Features Included

- ✅ User registration and login
- ✅ Session management
- ✅ Protected routes
- ✅ Automatic redirects
- ✅ Sign out functionality
- ✅ Password reset (email-based)

## Usage

### Authentication Hook

```tsx
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { user, signIn, signOut, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      {user ? <Text>Welcome, {user.email}!</Text> : <Text>Please sign in</Text>}
    </View>
  );
}
```

### Protected Routes

```tsx
import { useAuthGuard } from '@/lib/auth';

function ProtectedScreen() {
  const { user, isLoading } = useAuthGuard();

  if (isLoading) return <LoadingSpinner />;

  return <Text>Protected content for {user.email}</Text>;
}
```

### Redirect if Authenticated

```tsx
import { useRedirectIfAuthenticated } from '@/lib/auth';

function LoginScreen() {
  const { isLoading } = useRedirectIfAuthenticated();

  if (isLoading) return <LoadingSpinner />;

  return <LoginForm />;
}
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure to restart your development server after updating environment files
2. **Authentication not working**: Check that your Supabase URL and anon key are correct
3. **Redirect issues**: Verify your redirect URLs in Supabase dashboard

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Expo Documentation](https://docs.expo.dev)

## Security Notes

- Never expose your Supabase service role key in client-side code
- Use Row Level Security (RLS) policies in Supabase for data protection
- Implement proper error handling for authentication failures
- Consider adding additional security measures like 2FA for production apps
