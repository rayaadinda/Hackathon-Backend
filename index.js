import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import projectRoutes from "./routes/projectRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/admin", adminRoutes)

app.get("/", (req, res) => {
	res.send("indonesia heritage society API is running!")
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
