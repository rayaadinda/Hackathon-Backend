import { Router } from "express"
import { register, login, logout, testAuth } from "../controllers/authController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router()

router.get('/test', testAuth) // Test endpoint
router.post('/register', register)
router.post('/login', login)
router.post('/logout', requireAuth, logout)

export default router
