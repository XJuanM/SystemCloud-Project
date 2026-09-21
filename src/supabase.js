

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eoxagutzeoisqfzmwisr.supabase.co'
const supabaseKey = 'sb_publishable_4dwmz8BtLxsvHpPbYcyddA_my-sH1Ni'

export const supabase = createClient(supabaseUrl, supabaseKey)