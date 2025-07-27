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

		if (error) {
			return res.status(401).json({ error: error.message })
		}

		// Optimized: Only fetch essential user data
		const { data: profile } = await supabase
			.from("profiles")
			.select("id, name, role")
			.eq("id", data.user.id)
			.single()

		// Return minimal response for faster performance
		return res.status(200).json({
			message: "Login successful",
			token: data.session.access_token,
			user: {
				id: data.user.id,
				email: data.user.email,
				role: profile?.role || "volunteer",
			},
		})
	} catch (error) {
		console.error("Login error:", error)
		return res.status(500).json({ error: "Internal server error" })
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
