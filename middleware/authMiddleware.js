import { supabase } from "../config/supabaseClient.js"

// Optimized auth middleware with caching
const tokenCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const requireAuth = async (req, res, next) => {
	try {
		// Get token from HTTP-only cookie instead of Authorization header
		const token = req.cookies['sb-access-token']

		if (!token) {
			return res
				.status(401)
				.json({ error: "Access denied. No authentication token found." })
		}

		// Check cache first
		const cached = tokenCache.get(token)
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			req.user = cached.user
			return next()
		}

		// Verify token with Supabase
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token)

		if (error || !user) {
			tokenCache.delete(token) // Remove invalid token from cache
			// Clear invalid cookies
			res.clearCookie('sb-access-token')
			res.clearCookie('sb-refresh-token')
			return res.status(401).json({ error: "Invalid or expired token." })
		}

		// Cache valid user
		tokenCache.set(token, {
			user: { id: user.id, email: user.email }, // Store minimal user data
			timestamp: Date.now(),
		})

		req.user = user
		next()
	} catch (error) {
		console.error("Auth middleware error:", error)
		return res.status(401).json({ error: "Invalid token." })
	}
}

// Role cache for admin verification
const roleCache = new Map()

export const requireAdmin = async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Authentication required." })
		}

		// Check role cache first
		const cachedRole = roleCache.get(req.user.id)
		if (cachedRole && Date.now() - cachedRole.timestamp < CACHE_TTL) {
			if (cachedRole.role !== "admin") {
				return res.status(403).json({ error: "Access denied. Admin only." })
			}
			return next()
		}

		// Fetch role from database
		const { data: profile, error } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", req.user.id)
			.single()

		if (error || !profile) {
			return res.status(404).json({ error: "User profile not found." })
		}

		// Cache the role
		roleCache.set(req.user.id, {
			role: profile.role,
			timestamp: Date.now(),
		})

		if (profile.role !== "admin") {
			return res.status(403).json({ error: "Access denied. Admin only." })
		}

		next()
	} catch (error) {
		console.error("Admin middleware error:", error)
		return res.status(500).json({ error: "Failed to verify user role." })
	}
}

// Clear caches periodically to prevent memory leaks
setInterval(() => {
	const now = Date.now()
	for (const [key, value] of tokenCache.entries()) {
		if (now - value.timestamp > CACHE_TTL) {
			tokenCache.delete(key)
		}
	}
	for (const [key, value] of roleCache.entries()) {
		if (now - value.timestamp > CACHE_TTL) {
			roleCache.delete(key)
		}
	}
}, CACHE_TTL)

export const checkAuth = requireAuth
export const checkAdmin = requireAdmin
