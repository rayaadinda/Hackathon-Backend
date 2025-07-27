import { supabase } from "../config/supabaseClient.js"

export const register = async (req, res) => {
	try {
		const { email, password, name } = req.body

		// Validation
		if (!email || !password || !name) {
			return res
				.status(400)
				.json({ error: "Email, password, and name are required" })
		}

		// Single Supabase call for registration
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { name },
			},
		})

		if (error) {
			return res.status(400).json({ error: error.message })
		}

		// Return minimal response for faster performance
		return res.status(201).json({
			message:
				"Registration successful. Please check your email to confirm your account.",
			userId: data.user?.id,
		})
	} catch (error) {
		console.error("Registration error:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const login = async (req, res) => {
	try {
		const { email, password } = req.body

		// Validation
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" })
		}

		// Single login call
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		console.log("Supabase login response:", {
			hasData: !!data,
			hasUser: !!data?.user,
			hasSession: !!data?.session,
			hasAccessToken: !!data?.session?.access_token,
			error: error?.message,
		})

		if (error) {
			console.error("Login error:", error.message)
			return res.status(401).json({ error: error.message })
		}

		// Check if session exists
		if (!data || !data.session || !data.session.access_token) {
			console.error("No session or access token in response:", {
				hasData: !!data,
				hasSession: !!data?.session,
				sessionKeys: data?.session ? Object.keys(data.session) : "no session",
			})
			return res
				.status(401)
				.json({ error: "Login failed - no session created" })
		}

		// Optimized: Only fetch essential user data
		const { data: profile } = await supabase
			.from("profiles")
			.select("id, name, role")
			.eq("id", data.user.id)
			.single()

		// SECURITY: Set HTTP-only cookie with session token
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: data.session.expires_in * 1000, // Convert to milliseconds
			path: '/'
		}

		// Set the access token as an HTTP-only cookie
		res.cookie('sb-access-token', data.session.access_token, cookieOptions)
		res.cookie('sb-refresh-token', data.session.refresh_token, cookieOptions)

		// SECURE: Return only non-sensitive data
		const responseData = {
			message: "Login successful",
			user: {
				id: data.user.id,
				email: data.user.email,
				role: profile?.role || "volunteer",
			},
			session: {
				expires_at: data.session.expires_at,
				expires_in: data.session.expires_in,
			}
		}

		console.log("Sending secure response:", {
			hasUser: !!responseData.user,
			cookiesSet: true,
		})

		// Return secure response (no tokens in JSON)
		return res.status(200).json(responseData)
	} catch (error) {
		console.error("Login error:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

// Test endpoint for debugging
export const testAuth = async (req, res) => {
	try {
		return res.status(200).json({
			message: "Auth controller is working",
			timestamp: new Date().toISOString(),
			environment: process.env.NODE_ENV || "development",
		})
	} catch (error) {
		console.error("Test auth error:", error)
		return res.status(500).json({ error: "Test failed" })
	}
}

export const logout = async (req, res) => {
	try {
		// Get token from cookie instead of Authorization header
		const accessToken = req.cookies['sb-access-token']

		if (!accessToken) {
			return res.status(401).json({ error: "No active session found" })
		}

		// Sign out from Supabase
		const { error } = await supabase.auth.signOut()

		if (error) {
			console.error("Supabase logout error:", error.message)
		}

		// Clear authentication cookies
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/'
		}

		res.clearCookie('sb-access-token', cookieOptions)
		res.clearCookie('sb-refresh-token', cookieOptions)

		// Set cache headers for logout response
		res.set("Cache-Control", "no-cache, no-store, must-revalidate")
		return res.status(200).json({ message: "Logout successful" })
	} catch (error) {
		console.error("Logout error:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}
