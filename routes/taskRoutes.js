import { Router } from "express"
import { getAllTasks, getActiveTasks, getTaskById, applyForTask, getRecommendedTasks } from "../controllers/taskController.js"
import { requireAuth } from "../middleware/authMiddleware.js"

const router = Router()

router.get('/', getAllTasks)
router.get('/active', getActiveTasks)
router.get('/:id', getTaskById)

router.post('/:id/apply', requireAuth, applyForTask)
router.get('/recommended/me', requireAuth, getRecommendedTasks)

export default router
