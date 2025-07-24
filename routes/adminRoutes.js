import { Router } from "express"
import { 
  getAllUsers, 
  getAllTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  updateUserRole,
  getAllApplications,
  updateApplicationStatus,
  runMatchmaking,
  assignVolunteers,
  updateVolunteerStatus,
  updateProjectStatus
} from "../controllers/adminController.js"
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js"

const router = Router()

router.use(requireAuth, requireAdmin)

router.get('/users', getAllUsers)
router.patch('/users/role', updateUserRole)
router.patch('/users/:userId/status', updateVolunteerStatus)

router.get('/tasks', getAllTasks)
router.post('/tasks', createTask)
router.put('/tasks/:id', updateTask)
router.delete('/tasks/:id', deleteTask)

router.get('/applications', getAllApplications)
router.patch('/applications/:id/status', updateApplicationStatus)

router.post('/projects/:projectId/matchmaking', runMatchmaking)
router.post('/projects/:projectId/assign', assignVolunteers)
router.patch('/projects/:projectId/status', updateProjectStatus)

export default router
