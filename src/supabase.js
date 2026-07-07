import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bmqqkyakyrbirldatvqm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcXFreWFreXJiaXJsZGF0dnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMTE2NTAsImV4cCI6MjA5Njg4NzY1MH0.YXHSUKdv6MzlIaKo0MK41SJQsTPwh3iKM8NwNeL93uw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function loadPlayer(playerId) {
  const { data, error } = await supabase
    .from('predictions')
    .select('data')
    .eq('player', playerId)
    .single()
  if (error || !data) return {}
  try { return JSON.parse(data.data) } catch { return {} }
}

export async function savePlayer(playerId, payload) {
  const { error } = await supabase
    .from('predictions')
    .upsert({ player: playerId, data: JSON.stringify(payload) }, { onConflict: 'player' })
  return !error
}
