import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// For development, use hardcoded values since we can't create .env files
const supabaseUrl = 'https://sktcnsxhpzqtkyajhywe.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrdGNuc3hocHpxdGt5YWpoeXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzI4OTgsImV4cCI6MjA3MjE0ODg5OH0.hqmwhIVI7FmZdcxdad5rA1oUBUPCDf1ex8cUlxoepZE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable URL session detection
    flowType: 'pkce',
  },
});

export type Database = any;
