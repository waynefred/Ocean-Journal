import { createClient } from '@supabase/supabase-js';

// It's important to use VITE_ prefix for environment variables to be exposed to the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
