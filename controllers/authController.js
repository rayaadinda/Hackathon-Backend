import { supabase } from "../config/supabaseClient.js"

// Register a new user
export async function register(req, res) {
	const { email, password, name } = req.body
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: { name },
		},
	})
	if (error) return res.status(400).json({ error: error.message })
	res.status(201).json({ user: data.user })
}

// Login user
export async function login(req, res) {
	const { email, password } = req.body
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	})
	if (error) return res.status(400).json({ error: error.message })
	res.json({ user: data.user, session: data.session })
}
