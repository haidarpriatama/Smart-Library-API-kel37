import { AuthorModel } from '../models/authorModel.js';

export const AuthorController = {
  // Tugas 2: Mendukung ?name= untuk pencarian
  async getAuthors(req, res) {
    try {
      const { name } = req.query;
      const authors = await AuthorModel.getAll(name);
      res.json(authors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Tugas 1: Ambil satu author berdasarkan ID
  async getAuthorById(req, res) {
    try {
      const author = await AuthorModel.getById(req.params.id);
      if (!author) {
        return res.status(404).json({ error: 'Penulis tidak ditemukan.' });
      }
      res.json(author);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async addAuthor(req, res) {
    try {
      const { name, nationality } = req.body;
      const author = await AuthorModel.create(name, nationality);
      res.status(201).json(author);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Tugas 1: Update author
  async updateAuthor(req, res) {
    try {
      const { name, nationality } = req.body;
      const updated = await AuthorModel.update(req.params.id, name, nationality);
      if (!updated) {
        return res.status(404).json({ error: 'Penulis tidak ditemukan.' });
      }
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Tugas 1: Hapus author
  async deleteAuthor(req, res) {
    try {
      const deleted = await AuthorModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Penulis tidak ditemukan.' });
      }
      res.json({ message: 'Penulis berhasil dihapus.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
