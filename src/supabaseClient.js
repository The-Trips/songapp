import { createClient } from '@supabase/supabase-js'

// You will replace these with your own keys from the Supabase Dashboard later
const supabaseUrl = 'https://iptncodjrbbmhpnjjbty.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdG5jb2RqcmJibWhwbmpqYnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTA1MzcsImV4cCI6MjA4MTM4NjUzN30.kE76TY0J13k7IGil7iMPp6lnv2lYUCcCxv7fpveHkzU'

export const supabase = createClient(supabaseUrl, supabaseKey)