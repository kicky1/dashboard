import type {
  ApiResponse,
  CreateSessionData,
  CreateVerificationData,
  ExtendedUser,
  Profile,
  UpdatePreferencesData,
  UpdateProfileData,
  UserPreferences,
  UserSession,
  UserVerification,
  VerifyCodeData,
} from '@/types';

import { supabase } from './supabase';
import { generateUUID } from './utils';

export class UserService {
  // Profile management
  static async getProfile(userId: string): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        data: data as Profile,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  static async updateProfile(
    userId: string,
    profileData: UpdateProfileData
  ): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as Profile,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // User preferences management
  static async getPreferences(
    userId: string
  ): Promise<ApiResponse<UserPreferences>> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        data: data as UserPreferences,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  static async updatePreferences(
    userId: string,
    preferencesData: UpdatePreferencesData
  ): Promise<ApiResponse<UserPreferences>> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_preferences')
        .update(preferencesData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as UserPreferences,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // Extended user data (profile + preferences)
  static async getExtendedUser(
    userId: string
  ): Promise<ApiResponse<ExtendedUser>> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError) throw preferencesError;

      const extendedUser: ExtendedUser = {
        id: userId,
        email: (profile as Profile).email,
        profile: profile as Profile,
        preferences: preferences as UserPreferences,
      };

      return {
        data: extendedUser,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // Session management
  static async createSession(
    userId: string,
    sessionData: CreateSessionData
  ): Promise<ApiResponse<UserSession>> {
    try {
      const session = {
        user_id: userId,
        session_token: generateUUID(),
        device_info: sessionData.device_info,
        ip_address: sessionData.ip_address,
        user_agent: sessionData.user_agent,
        is_active: true,
        expires_at: sessionData.expires_at,
      };

      const { data, error } = await (supabase as any)
        .from('user_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as UserSession,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  static async getActiveSessions(
    userId: string
  ): Promise<ApiResponse<UserSession[]>> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      return {
        data: data as UserSession[],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  static async deactivateSession(
    sessionId: string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await (supabase as any)
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  static async deactivateAllSessions(
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await (supabase as any)
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // Verification management
  static async createVerification(
    userId: string,
    verificationData: CreateVerificationData
  ): Promise<ApiResponse<UserVerification>> {
    try {
      const verification = {
        user_id: userId,
        verification_type: verificationData.verification_type,
        verification_code: verificationData.verification_code,
        is_used: false,
        expires_at: verificationData.expires_at,
      };

      const { data, error } = await (supabase as any)
        .from('user_verification')
        .insert(verification)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as UserVerification,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  static async verifyCode(
    userId: string,
    verifyData: VerifyCodeData
  ): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('user_verification')
        .select('*')
        .eq('user_id', userId)
        .eq('verification_type', verifyData.verification_type)
        .eq('verification_code', verifyData.verification_code)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;

      // Mark verification code as used
      const { error: updateError } = await (supabase as any)
        .from('user_verification')
        .update({ is_used: true })
        .eq('id', (data as UserVerification).id);

      if (updateError) throw updateError;

      // Update user verification status if it's email verification
      if (verifyData.verification_type === 'email') {
        const { error: profileError } = await (supabase as any)
          .from('profiles')
          .update({ is_verified: true, status: 'active' })
          .eq('id', userId);

        if (profileError) throw profileError;
      }

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // Utility methods
  static async updateLastLogin(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  static async searchUsers(query: string): Promise<ApiResponse<Profile[]>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(
          `username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`
        )
        .limit(10);

      if (error) throw error;

      return {
        data: data as Profile[],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  static async getUserStats(userId: string): Promise<
    ApiResponse<{
      totalSessions: number;
      activeSessions: number;
      lastLogin: string | null;
      memberSince: string;
    }>
  > {
    try {
      const [profileResult, sessionsResult] = await Promise.all([
        this.getProfile(userId),
        this.getActiveSessions(userId),
      ]);

      if (!profileResult.success)
        throw new Error(profileResult.error || 'Profile error');
      if (!sessionsResult.success)
        throw new Error(sessionsResult.error || 'Sessions error');

      const stats = {
        totalSessions: sessionsResult.data?.length || 0,
        activeSessions:
          sessionsResult.data?.filter((s) => s.is_active).length || 0,
        lastLogin: profileResult.data?.last_login || null,
        memberSince: profileResult.data?.created_at || '',
      };

      return {
        data: stats,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }
}
