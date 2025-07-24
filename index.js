import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
	res.send(
		"API Server untuk Heritage Jakarta Volunteer Management sedang berjalan!"
	)
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/admin", adminRoutes)

app.listen(port, () => {
	console.log(`Server berjalan di http://localhost:${port}`)
})
