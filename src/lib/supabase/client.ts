import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Force TS server reload

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Faltan variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY")
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key'
)
