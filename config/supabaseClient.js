import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// Optimized Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
	realtime: {
		params: {
			eventsPerSecond: 10,
		},
	},
	global: {
		headers: {
			"Cache-Control": "max-age=300", // 5 minutes cache
		},
	},
})
