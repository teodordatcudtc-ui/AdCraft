import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Creează client Supabase cu persistență automată a sesiunii
// IMPORTANT: localStorage funcționează doar în browser, nu pe server
// Supabase gestionează automat acest lucru, dar trebuie să ne asigurăm că funcționează corect
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Supabase folosește automat localStorage în browser
    // Pe server (SSR), va returna null pentru sesiune, dar va funcționa corect pe client
  }
})

