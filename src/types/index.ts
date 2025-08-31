// Database Types for Supabase
export type UserStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending_verification';
export type UserRole = 'user' | 'admin' | 'moderator';
export type ThemePreference = 'light' | 'dark' | 'system';
export type LanguagePreference = 'en' | 'pl';

// Profile table types
export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  date_of_birth?: string;
  country?: string;
  timezone?: string;
  status: UserStatus;
  role: UserRole;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// User preferences table types
export interface UserPreferences {
  id: string;
  user_id: string;
  theme: ThemePreference;
  language: LanguagePreference;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  currency: string;
  date_format: string;
  time_format: string;
  created_at: string;
  updated_at: string;
}

// User sessions table types
export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  last_activity: string;
}

// User verification table types
export interface UserVerification {
  id: string;
  user_id: string;
  verification_type: 'email' | 'phone' | '2fa';
  verification_code: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

// Expense table types
export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Income table types
export interface Income {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Database schema type - Direct mapping for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Partial<UserPreferences>;
        Update: Partial<UserPreferences>;
      };
      user_sessions: {
        Row: UserSession;
        Insert: Partial<UserSession>;
        Update: Partial<UserSession>;
      };
      user_verification: {
        Row: UserVerification;
        Insert: Partial<UserVerification>;
        Update: Partial<UserVerification>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<
          Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>
        >;
      };
      income: {
        Row: Income;
        Insert: Omit<Income, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<
          Omit<Income, 'id' | 'user_id' | 'created_at' | 'updated_at'>
        >;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      update_updated_at_column: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      cleanup_expired_sessions: {
        Args: Record<string, never>;
        Returns: void;
      };
      cleanup_expired_verification: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      user_status: UserStatus;
      user_role: UserRole;
      theme_preference: ThemePreference;
      language_preference: LanguagePreference;
    };
  };
}

// Extended user type that includes profile and preferences
export interface ExtendedUser {
  id: string;
  email: string;
  profile: Profile;
  preferences: UserPreferences;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// User management types
export interface CreateUserData {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  date_of_birth?: string;
  country?: string;
  timezone?: string;
}

export interface UpdatePreferencesData {
  theme?: ThemePreference;
  language?: LanguagePreference;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  currency?: string;
  date_format?: string;
  time_format?: string;
}

// Session management types
export interface CreateSessionData {
  device_info?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
}

// Verification types
export interface CreateVerificationData {
  verification_type: 'email' | 'phone' | '2fa';
  verification_code: string;
  expires_at: string;
}

export interface VerifyCodeData {
  verification_code: string;
  verification_type: 'email' | 'phone' | '2fa';
}

export interface DashboardSettings {
  // General settings
  showTotalBalance: boolean;
  showIncome: boolean;
  showExpenses: boolean;

  // Recent items settings
  showRecentExpenses: boolean;
  showRecentIncome: boolean;
  recentExpensesLimit: number;
  recentIncomeLimit: number;

  // Layout settings
  showUserHeader: boolean;
  showBalanceCard: boolean;

  // Additional features
  showCurrencyConverter: boolean;
  showQuickActions: boolean;
  showCharts: boolean;

  // Customization
  dashboardTitle: string;
  welcomeMessage: string;

  // Feature toggles
  enableNotifications: boolean;
  enableDarkMode: boolean;
  enableAnimations: boolean;
}
