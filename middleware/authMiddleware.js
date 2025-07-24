import { supabase } from "../config/supabaseClient.js"

export const requireAuth = async (req, res, next) => {
	const authHeader = req.headers.authorization

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res
			.status(401)
			.json({ error: "Akses ditolak. Token tidak disediakan." })
	}

	const token = authHeader.split(" ")[1]

	try {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token)

		if (error || !user) {
			throw new Error(
				error?.message || "Token tidak valid atau sudah kedaluwarsa."
			)
		}

		req.user = user
		next()
	} catch (error) {
		return res.status(401).json({ error: "Token tidak valid." })
	}
}

export const requireAdmin = async (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: "Autentikasi diperlukan." })
	}

	try {
		const { data: profile, error } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", req.user.id)
			.single()

		if (error || !profile) {
			return res.status(404).json({ error: "Profil pengguna tidak ditemukan." })
		}

		if (profile.role !== "admin") {
			return res
				.status(403)
				.json({ error: "Akses ditolak. Hanya admin yang diizinkan." })
		}

		next()
	} catch (error) {
		return res
			.status(500)
			.json({ error: "Gagal memverifikasi peran pengguna." })
	}
}

export const checkAuth = requireAuth;
export const checkAdmin = requireAdmin;
