import { Router } from "express"
import { register, login, logout } from "../controllers/authController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', requireAuth, logout)

export default router
