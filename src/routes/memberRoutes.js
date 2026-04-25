import express from 'express';
import { MemberController } from '../controllers/memberController.js';

const router = express.Router();

// GET /api/members
router.get('/', MemberController.getAllMembers);

// POST /api/members
router.post('/', MemberController.registerMember);

// GET /api/members/:id
router.get('/:id', MemberController.getMemberById);

// PUT /api/members/:id
router.put('/:id', MemberController.updateMember);

// DELETE /api/members/:id
router.delete('/:id', MemberController.deleteMember);

export default router;
