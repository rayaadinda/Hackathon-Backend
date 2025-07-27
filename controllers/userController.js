import { supabase } from "../config/supabaseClient.js"

export const getUserProfile = async (req, res) => {
	try {
		const userId = req.user.id

		// Use Promise.all for parallel queries to improve performance
		const [profileResult, assignmentsResult] = await Promise.all([
			supabase
				.from("profiles")
				.select("id, name, phone, role, skills, availability, updated_at")
				.eq("id", userId)
				.single(),
			supabase
				.from("volunteer_assignments")
				.select(
					`
          id,
          status,
          applied_at,
          projects:project_id (id, title, status_project)
        `
				)
				.eq("volunteer_id", userId)
				.order("applied_at", { ascending: false })
				.limit(10), // Limit results for better performance
		])

		if (profileResult.error) {
			return res.status(404).json({ error: "Profile not found" })
		}

		// Set cache headers for profile data
		res.set("Cache-Control", "private, max-age=300") // 5 minutes cache

		return res.status(200).json({
			profile: profileResult.data,
			assignments: assignmentsResult.data || [],
		})
	} catch (error) {
		console.error("Get profile error:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const updateUserProfile = async (req, res) => {
	const userId = req.user.id
	const {
		name,
		phone,
		gender,
		date_of_birth,
		address,
		postal_code,
		country,
		nationalities,
		languages,
		enneagram,
		groups,
		volunteer_opportunities,
		preferred_duration,
		years_experience,
		longest_experience,
		availability,
		status_volunteer,
	} = req.body

	if (status_volunteer && !["open", "closed"].includes(status_volunteer)) {
		return res
			.status(400)
			.json({ error: 'Status volunteer must be either "open" or "closed"' })
	}

	try {
		const { data, error } = await supabase
			.from("profiles")
			.update({
				name,
				phone,
				gender,
				date_of_birth,
				address,
				postal_code,
				country,
				nationalities: Array.isArray(nationalities) ? nationalities : undefined,
				languages: Array.isArray(languages) ? languages : undefined,
				enneagram: typeof enneagram === "object" ? enneagram : undefined,
				groups: typeof groups === "object" ? groups : undefined,
				volunteer_opportunities:
					typeof volunteer_opportunities === "object"
						? volunteer_opportunities
						: undefined,
				preferred_duration,
				years_experience,
				longest_experience,
				availability,
				status_volunteer,
			})
			.eq("id", userId)
			.select()

		if (error) {
			return res.status(500).json({ error: error.message })
		}

		if (data.length === 0) {
			return res.status(404).json({ error: "Profile not found" })
		}

		return res.status(200).json({
			message: "Profile updated successfully",
			profile: data[0],
		})
	} catch (error) {
		console.error("Error updating user profile:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const toggleVolunteerStatus = async (req, res) => {
	const userId = req.user.id

	try {
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("status_volunteer")
			.eq("id", userId)
			.single()

		if (profileError || !profile) {
			return res.status(404).json({ error: "Profile not found" })
		}

		const newStatus = profile.status_volunteer === "open" ? "closed" : "open"

		const { data, error } = await supabase
			.from("profiles")
			.update({ status_volunteer: newStatus })
			.eq("id", userId)
			.select()

		if (error) {
			return res.status(500).json({ error: error.message })
		}

		return res.status(200).json({
			message: `Volunteer status toggled to ${newStatus}`,
			profile: data[0],
		})
	} catch (error) {
		console.error("Error toggling volunteer status:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

// Submit volunteer form for non-authenticated users
export const submitVolunteerForm = async (req, res) => {
	try {
		const {
			name,
			email,
			phone,
			gender,
			date_of_birth,
			address,
			postal_code,
			country,
			nationalities,
			languages,
			// Volunteer groups
			group_explorers,
			group_italian_speaking,
			group_study_groups,
			group_japanese_speaking,
			group_chinese_speaking,
			group_korean_speaking,
			group_french_speaking,
			// Society events
			event_coordinator,
			event_art_show,
			event_photography_exhibition,
			// Skills
			skill_financial,
			skill_pr,
			skill_sales,
			skill_administration,
			// Publishing
			publishing_creative_writing,
			publishing_editing,
			publishing_graphic_design,
			publishing_indesign,
			publishing_proof_reading,
			// Interest areas
			interest_travel_organizer,
			interest_translation,
			// Library
			library_front_desk,
			library_cataloguing,
			library_data_entry,
			// Museum
			museum_collection_inventory,
			museum_training,
			museum_materials_preparation,
			// Volunteer preferences
			preferred_duration,
			years_experience,
			longest_experience,
			// Other fields
			availability,
		} = req.body

		// Process nationalities and languages as arrays
		const nationalitiesArray = nationalities
			? nationalities.split(",").map((item) => item.trim())
			: []
		const languagesArray = languages
			? languages.split(",").map((item) => item.trim())
			: []

		// First create a user account
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password: Math.random().toString(36).slice(-8), // Generate random password
			options: {
				data: {
					name,
				},
			},
		})

		if (authError) throw authError

		// The trigger will automatically create a profile, but we need to update it with form data
		const { error: updateError } = await supabase
			.from("profiles")
			.update({
				name,
				phone,
				gender,
				date_of_birth,
				email,
				address,
				postal_code,
				country,
				nationalities: nationalitiesArray,
				languages: languagesArray,
				// Volunteer groups
				group_explorers: !!group_explorers,
				group_italian_speaking: !!group_italian_speaking,
				group_study_groups: !!group_study_groups,
				group_japanese_speaking: !!group_japanese_speaking,
				group_chinese_speaking: !!group_chinese_speaking,
				group_korean_speaking: !!group_korean_speaking,
				group_french_speaking: !!group_french_speaking,
				// Society events
				event_coordinator: !!event_coordinator,
				event_art_show: !!event_art_show,
				event_photography_exhibition: !!event_photography_exhibition,
				// Skills
				skill_financial: !!skill_financial,
				skill_pr: !!skill_pr,
				skill_sales: !!skill_sales,
				skill_administration: !!skill_administration,
				// Publishing
				publishing_creative_writing: !!publishing_creative_writing,
				publishing_editing: !!publishing_editing,
				publishing_graphic_design: !!publishing_graphic_design,
				publishing_indesign: !!publishing_indesign,
				publishing_proof_reading: !!publishing_proof_reading,
				// Interest areas
				interest_travel_organizer: !!interest_travel_organizer,
				interest_translation: !!interest_translation,
				// Library
				library_front_desk: !!library_front_desk,
				library_cataloguing: !!library_cataloguing,
				library_data_entry: !!library_data_entry,
				// Museum
				museum_collection_inventory: !!museum_collection_inventory,
				museum_training: !!museum_training,
				museum_materials_preparation: !!museum_materials_preparation,
				// Volunteer preferences
				preferred_duration,
				years_experience,
				longest_experience,
				// Other fields
				availability,
				updated_at: new Date(),
			})
			.eq("id", authData.user.id)

		if (updateError) throw updateError

		// After creating profile, run AI matchmaking to find suitable projects
		await findMatchingProjects(authData.user.id)

		return res.status(201).json({
			message: "Volunteer form submitted successfully",
			user_id: authData.user.id,
		})
	} catch (error) {
		console.error("Error submitting volunteer form:", error)
		return res.status(500).json({ error: error.message })
	}
}

// Helper function to find matching projects using AI matchmaking
async function findMatchingProjects(userId) {
	try {
		// Get user profile
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.single()

		if (profileError) throw profileError

		// Get all available projects
		const { data: projects, error: projectsError } = await supabase
			.from("projects")
			.select("*")
			.eq("status", "Open")

		if (projectsError) throw projectsError

		// Simple matchmaking algorithm (to be replaced with AI)
		for (const project of projects) {
			let matchScore = 0
			let matchReasons = []

			// Match based on language skills
			if (project.required_languages && project.required_languages.length > 0) {
				const languageMatch = project.required_languages.some((lang) =>
					profile.languages.includes(lang)
				)
				if (languageMatch) {
					matchScore += 20
					matchReasons.push("Language match")
				}
			}

			// Match based on project type and volunteer groups
			if (project.project_type === "explorers" && profile.group_explorers) {
				matchScore += 25
				matchReasons.push("Explorers group interest match")
			}
			if (
				project.project_type === "study_group" &&
				profile.group_study_groups
			) {
				matchScore += 25
				matchReasons.push("Study group interest match")
			}

			// Match based on skills
			if (project.required_skills && project.required_skills.length > 0) {
				// Check if user has any of the required skills
				if (
					profile.skill_financial &&
					project.required_skills.includes("financial")
				) {
					matchScore += 15
					matchReasons.push("Financial skill match")
				}
				if (profile.skill_pr && project.required_skills.includes("pr")) {
					matchScore += 15
					matchReasons.push("PR skill match")
				}
				// Add more skill matching here
			}

			// Match based on experience level
			if (project.min_experience && profile.years_experience) {
				if (
					project.min_experience === "< 6 months" ||
					(project.min_experience === "6 months - 1 year" &&
						["6 months - 1 year", "> 1 year"].includes(
							profile.years_experience
						)) ||
					(project.min_experience === "> 1 year" &&
						profile.years_experience === "> 1 year")
				) {
					matchScore += 15
					matchReasons.push("Experience level match")
				}
			}

			// Match based on duration preference
			if (project.duration && profile.preferred_duration) {
				if (project.duration === profile.preferred_duration) {
					matchScore += 15
					matchReasons.push("Duration preference match")
				}
			}

			// If good match (score > 50), create a recommendation
			if (matchScore >= 50) {
				// Check if recommendation already exists
				const { data: existingMatch } = await supabase
					.from("volunteer_assignments")
					.select("id")
					.eq("volunteer_id", userId)
					.eq("project_id", project.id)
					.single()

				if (!existingMatch) {
					// Create new recommendation
					await supabase.from("volunteer_assignments").insert({
						volunteer_id: userId,
						project_id: project.id,
						status: "recommended",
						match_score: matchScore,
						match_reason: matchReasons.join(", "),
					})
				}
			}
		}
	} catch (error) {
		console.error("Error in AI matchmaking:", error)
	}
}
