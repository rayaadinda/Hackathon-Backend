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

		// Prepare response with multiple fallbacks
		const accessToken = data.session.access_token || data.session.token || null
		const responseData = {
			message: "Login successful",
			access_token: accessToken,
			token: accessToken, // Keep both for compatibility
			session: {
				access_token: accessToken,
				refresh_token: data.session.refresh_token,
				expires_in: data.session.expires_in,
				expires_at: data.session.expires_at,
				token_type: data.session.token_type || "bearer",
			},
			user: {
				id: data.user.id,
				email: data.user.email,
				role: profile?.role || "volunteer",
			},
		}

		console.log("Sending response:", {
			hasAccessToken: !!responseData.access_token,
			hasSession: !!responseData.session,
			hasUser: !!responseData.user,
		})

		// Return minimal response for faster performance
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
		const authHeader = req.headers.authorization

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Token not provided" })
		}

		// Fast logout - just invalidate token
		const { error } = await supabase.auth.signOut()

		if (error) {
			return res.status(500).json({ error: error.message })
		}

		// Set cache headers for logout response
		res.set("Cache-Control", "no-cache, no-store, must-revalidate")
		return res.status(200).json({ message: "Logout successful" })
	} catch (error) {
		console.error("Logout error:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}
