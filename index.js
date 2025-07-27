import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import compression from "compression"
import rateLimit from "express-rate-limit"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import projectRoutes from "./routes/projectRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import { performanceMonitor, setCacheHeaders, setCompressionHeaders } from "./middleware/performance.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: { error: "Too many requests, please try again later." },
	standardHeaders: true,
	legacyHeaders: false,
})

// Performance and security middleware
app.use(performanceMonitor)
app.use(setCompressionHeaders)
app.use(limiter)
app.use(compression()) // Compress responses
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "*",
		credentials: true,
	})
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/projects", setCacheHeaders(300), projectRoutes) // Cache projects for 5 minutes
app.use("/api/tasks", setCacheHeaders(600), taskRoutes) // Cache tasks for 10 minutes
app.use("/api/admin", adminRoutes)

app.get("/", (req, res) => {
	res.send("indonesia heritage society API is running!")
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
