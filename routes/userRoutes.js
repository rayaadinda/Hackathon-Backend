import { Router } from "express"
import { getUserProfile, updateUserProfile, toggleVolunteerStatus } from "../controllers/userController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router()

router.get('/profile', requireAuth, getUserProfile)
router.patch('/profile', requireAuth, updateUserProfile)
router.post('/toggle-status', requireAuth, toggleVolunteerStatus)

export default router
