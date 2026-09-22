import express from 'express';
import { getPoll, votePoll } from '../controllers/pollController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPoll);
router.post('/vote', protect, votePoll);

export default router;
