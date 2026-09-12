import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  // Surfaces a clear error instead of a cryptic network failure if .env is missing.
  console.warn('[supabase] EXPO_PUBLIC_SUPABASE_URL / _KEY ausentes. Confira o .env.');
}

// On web, let supabase-js use its default (sync localStorage). Passing the async
// AsyncStorage on web deadlocks against the Web Locks API used by auth. Native uses AsyncStorage.
const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(url ?? '', key ?? '', {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
