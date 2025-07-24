import { Router } from "express"
import { 
  getAllProjects, 
  getActiveProjects,
  getProjectById, 
  applyForProject, 
  getRecommendedProjects,
  getUserProjectApplications,
  createProject,
  updateProject,
  deleteProject
} from "../controllers/projectController.js"
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js"

const router = Router()

router.get('/', getAllProjects)
router.get('/active', getActiveProjects)
router.get('/:id', getProjectById)

router.post('/:id/apply', requireAuth, applyForProject)
router.get('/recommended/me', requireAuth, getRecommendedProjects)
router.get('/applications/me', requireAuth, getUserProjectApplications)

router.post('/', requireAuth, requireAdmin, createProject)
router.put('/:id', requireAuth, requireAdmin, updateProject)
router.delete('/:id', requireAuth, requireAdmin, deleteProject)

export default router 