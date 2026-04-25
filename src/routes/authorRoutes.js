import express from 'express';
import { AuthorController } from '../controllers/authorController.js';

const router = express.Router();

router.get('/', AuthorController.getAuthors);
router.post('/', AuthorController.addAuthor);
router.get('/:id', AuthorController.getAuthorById);
router.put('/:id', AuthorController.updateAuthor);
router.delete('/:id', AuthorController.deleteAuthor);

export default router;
