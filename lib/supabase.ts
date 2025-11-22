import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Creează client Supabase cu persistență automată a sesiunii
// Supabase folosește automat localStorage în browser pentru a salva sesiunea
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Nu specificăm storage - Supabase folosește automat localStorage
    // Storage key-ul este generat automat bazat pe URL-ul proiectului
  }
})

