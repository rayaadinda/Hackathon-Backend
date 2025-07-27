import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// Log configuration status (without exposing keys)
console.log('Supabase config:', {
	hasUrl: !!supabaseUrl,
	hasKey: !!supabaseAnonKey,
	urlLength: supabaseUrl?.length || 0,
	keyLength: supabaseAnonKey?.length || 0
});

// Optimized Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: false, // Disable persistence for serverless
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
