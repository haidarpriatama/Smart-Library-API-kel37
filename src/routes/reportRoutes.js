import express from 'express';
import { ReportController } from '../controllers/reportController.js';

const router = express.Router();

// GET /api/reports/stats
router.get('/', ReportController.getStats);

export default router;
