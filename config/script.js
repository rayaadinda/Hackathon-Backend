// register_massal.js
import { createClient } from "@supabase/supabase-js"

// Ganti dengan kredensial Supabase kamu
const SUPABASE_URL = "https://khzylgwekmsddlmamivl.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoenlsZ3dla21zZGRsbWFtaXZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM2MDg3NywiZXhwIjoyMDY4OTM2ODc3fQ.xC4uUbwC639IiHZFCPxWI_eeAYUc82ugGCdcpHi5KKo"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Data user dummy
const projects = [
	{
		title: "Naskah Kuno Nusantara: Digitalisasi & Terjemahan",
		description:
			"Proyek penerjemahan dan digitalisasi naskah-naskah kuno dari perpustakaan nasional.",
		project_type: "publishing",
		details: {
			output: "Jurnal digital dan website arsip",
			difficulty: "Medium",
			platform: "Online/Remote",
			type_description:
				"Kolaborasi online untuk meneliti, mengetik ulang, dan menerjemahkan teks kuno.",
		},
		required_skills: ["research", "typing", "Indonesian literature"],
		required_languages: ["Indonesian", "Old Javanese", "English"],
		min_experience: "6 months - 1 year",
		start_date: "2025-08-01",
		end_date: "2025-12-31",
		duration: "5 months",
		max_volunteers: 15,
	},
	{
		title: "Festival Budaya Asia Tenggara 2026",
		description:
			"Mengorganisir festival budaya tahunan yang menampilkan seni dan kuliner dari negara-negara Asia Tenggara.",
		project_type: "event_organizing",
		details: {
			venue: "Museum Nasional Indonesia, Jakarta",
			difficulty: "Hard",
			event_scale: "500+ pengunjung",
			type_description:
				"Manajemen acara skala besar dari perencanaan, pencarian sponsor, hingga eksekusi.",
		},
		required_skills: ["event management", "sponsorship", "public relations"],
		required_languages: ["Indonesian", "English"],
		min_experience: "> 1 year",
		start_date: "2026-02-01",
		end_date: "2026-05-30",
		duration: "4 months",
		max_volunteers: 25,
	},
	{
		title: "Jelajah Kawah Putih & Situ Patenggang",
		description:
			"Ekspedisi dan studi lingkungan di kawasan wisata alam Ciwidey, Bandung.",
		project_type: "explorers",
		details: {
			meeting_point: "Stasiun Bandung",
			difficulty: "Medium",
			distance: "5km trekking",
			type_description:
				"Perjalanan grup kecil selama 3 hari untuk eksplorasi alam dan pendataan flora.",
		},
		required_skills: ["trekking", "first aid", "photography"],
		required_languages: ["Indonesian"],
		min_experience: "< 6 months",
		start_date: "2025-09-15",
		end_date: "2025-09-17",
		duration: "3 days",
		max_volunteers: 12,
	},
	{
		title: "Kelompok Studi Sejarah Maritim",
		description:
			"Diskusi dan riset mingguan mengenai sejarah jalur rempah dan kerajaan maritim di Nusantara.",
		project_type: "study_groups",
		details: {
			meeting_point: "Perpustakaan Nasional RI, Jakarta",
			difficulty: "Medium",
			focus: "Jalur Perdagangan Rempah",
			type_description:
				"Grup diskusi akademis dengan presentasi bulanan dari anggota.",
		},
		required_skills: ["academic reading", "discussion", "presentation"],
		required_languages: ["Indonesian", "English"],
		min_experience: "6 months - 1 year",
		start_date: "2025-10-01",
		end_date: "2026-01-31",
		duration: "4 months",
		max_volunteers: 20,
	},
	{
		title: "Alih Bahasa Teks Pameran Museum",
		description:
			"Menerjemahkan teks penjelasan artefak di Museum Wayang dari Bahasa Indonesia ke Bahasa Inggris dan Jepang.",
		project_type: "translation",
		details: {
			location: "Museum Wayang, Jakarta",
			difficulty: "Medium",
			word_count: "Sekitar 5000 kata",
			type_description:
				"Proyek penerjemahan akurat yang membutuhkan pemahaman konteks budaya pewayangan.",
		},
		required_skills: ["translation", "copywriting", "Javanese culture"],
		required_languages: ["Indonesian", "English", "Japanese"],
		min_experience: "> 1 year",
		start_date: "2025-08-10",
		end_date: "2025-09-30",
		duration: "7 weeks",
		max_volunteers: 5,
	},
	{
		title: "Arsip Foto Digital: Bandung Tempo Dulu",
		description:
			"Membuat arsip digital dari koleksi foto lawas kota Bandung dari berbagai sumber.",
		project_type: "publishing",
		details: {
			platform: "Website galeri online",
			difficulty: "Easy",
			task: "Memindai (scanning) dan memberikan tag metadata pada foto.",
			type_description:
				"Proyek santai yang berfokus pada pengarsipan digital untuk publik.",
		},
		required_skills: ["photo scanning", "metadata tagging", "archiving"],
		required_languages: ["Indonesian"],
		min_experience: "< 6 months",
		start_date: "2025-09-01",
		end_date: "2026-02-28",
		duration: "6 months",
		max_volunteers: 10,
	},
	{
		title: "Ekspedisi Sejarah Bahari Kepulauan Seribu",
		description:
			"Menjelajahi pulau-pulau bersejarah di Kepulauan Seribu seperti Pulau Onrust dan Pulau Kelor.",
		project_type: "explorers",
		details: {
			meeting_point: "Dermaga Marina Ancol, Jakarta",
			difficulty: "Easy",
			activity: "Island hopping dengan perahu, studi benteng",
			type_description:
				"Perjalanan akhir pekan untuk mempelajari sisa-sisa peninggalan VOC di teluk Jakarta.",
		},
		required_skills: ["swimming", "history knowledge"],
		required_languages: ["Indonesian", "English"],
		min_experience: "< 6 months",
		start_date: "2025-11-08",
		end_date: "2025-11-09",
		duration: "2 days",
		max_volunteers: 15,
	},
	{
		title: "Webinar Series: Kerajaan di Nusantara",
		description:
			"Mengadakan seri webinar bulanan dengan sejarawan untuk membahas berbagai kerajaan di Indonesia.",
		project_type: "event_organizing",
		details: {
			venue: "Zoom Webinar / YouTube Live",
			difficulty: "Easy",
			frequency: "Bulanan",
			type_description:
				"Manajemen acara virtual, mulai dari promosi media sosial hingga menjadi moderator.",
		},
		required_skills: [
			"social media marketing",
			"video conferencing",
			"moderating",
		],
		required_languages: ["Indonesian"],
		min_experience: "< 6 months",
		start_date: "2025-10-01",
		end_date: "2026-04-30",
		duration: "7 months",
		max_volunteers: 8,
	},
	{
		title: "Studi Arsitektur Kolonial Semarang",
		description:
			"Grup studi lapangan untuk mendokumentasikan dan menganalisis bangunan gaya Art Deco di Kota Lama Semarang.",
		project_type: "study_groups",
		details: {
			meeting_point: "Gereja Blenduk, Semarang",
			difficulty: "Medium",
			focus: "Konservasi Bangunan Cagar Budaya",
			type_description:
				"Kombinasi jalan-jalan, fotografi, dan diskusi mengenai arsitektur dan sejarah urban.",
		},
		required_skills: ["photography", "architectural drawing", "urban history"],
		required_languages: ["Indonesian", "Dutch"],
		min_experience: "6 months - 1 year",
		start_date: "2026-03-05",
		end_date: "2026-06-05",
		duration: "3 months",
		max_volunteers: 10,
	},
	{
		title: "Panduan Wisata Kuliner Yogyakarta",
		description:
			"Menulis dan menerbitkan e-book panduan tempat-tempat kuliner legendaris dan tradisional di Yogyakarta.",
		project_type: "publishing",
		details: {
			output: "E-book (PDF/ePub)",
			difficulty: "Medium",
			scope: "Makanan tradisional dan jajanan pasar",
			type_description:
				"Tim kecil untuk riset lapangan, menulis ulasan, fotografi, dan desain layout.",
		},
		required_skills: ["creative writing", "food photography", "layout design"],
		required_languages: ["Indonesian", "English"],
		min_experience: "6 months - 1 year",
		start_date: "2026-01-15",
		end_date: "2026-04-15",
		duration: "3 months",
		max_volunteers: 6,
	},
]

async function insertProjects() {
	for (const project of projects) {
		const { data, error } = await supabase.from("projects").insert([
			{
				...project,
				details: project.details, // Supabase akan otomatis handle jsonb
				required_skills: project.required_skills,
				required_languages: project.required_languages,
				min_experience: project.min_experience,
				start_date: project.start_date,
				end_date: project.end_date,
				duration: project.duration,
				max_volunteers: project.max_volunteers,
				current_volunteers: 0, // default
				status_project: "on_going", // default, bisa diubah
			},
		])

		if (error) {
			console.error(`Gagal insert project "${project.title}":`, error.message)
		} else {
			console.log(`Berhasil insert project: ${project.title}`)
		}
	}
}

insertProjects()
