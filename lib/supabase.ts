import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type ExpenseReport = {
  id: string
  user_id: string
  date: string
  amount: number
  category: 'transport' | 'repas' | 'hebergement' | 'materiel' | 'autre'
  description: string
  receipt_path: string | null
  receipt_name: string | null
  created_at: string
}

export const CATEGORIES = {
  transport: { label: 'Transport', emoji: '🚗' },
  repas: { label: 'Repas', emoji: '🍽️' },
  hebergement: { label: 'Hébergement', emoji: '🏨' },
  materiel: { label: 'Matériel', emoji: '🖥️' },
  autre: { label: 'Autre', emoji: '📎' },
} as const
