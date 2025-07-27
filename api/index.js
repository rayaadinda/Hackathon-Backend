import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import compression from "compression"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import authRoutes from "../routes/authRoutes.js"
import userRoutes from "../routes/userRoutes.js"
import projectRoutes from "../routes/projectRoutes.js"
import taskRoutes from "../routes/taskRoutes.js"
import adminRoutes from "../routes/adminRoutes.js"
import {
	performanceMonitor,
	setCacheHeaders,
	setCompressionHeaders,
} from "../middleware/performance.js"

dotenv.config()

const app = express()

// Trust proxy for production (Vercel, Heroku, etc.)
app.set("trust proxy", 1)

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: process.env.NODE_ENV === "production" ? 200 : 100, // Higher limit in production
	message: { error: "Too many requests, please try again later." },
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => {
		// Skip rate limiting for health checks
		return req.url === "/" || req.url === "/health"
	},
})

// Performance and security middleware
app.use(setCompressionHeaders)
app.use(limiter)
app.use(compression()) // Compress responses
app.use(cookieParser()) // Parse cookies securely
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "*",
		credentials: true,
	})
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Add performance monitoring last (development only)
if (process.env.NODE_ENV !== "production") {
	app.use(performanceMonitor)
}

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/projects", setCacheHeaders(300), projectRoutes)
app.use("/api/tasks", setCacheHeaders(600), taskRoutes)
app.use("/api/admin", adminRoutes)

app.get("/", (req, res) => {
	res.send("indonesia heritage society API is running!")
})

app.get("/api", (req, res) => {
	res.send("indonesia heritage society API is running!")
})

// Export the Express app as a Vercel serverless function
export default app
