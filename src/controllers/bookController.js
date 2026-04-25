import { BookModel } from '../models/bookModel.js';

export const BookController = {
  // Tugas 2: Mendukung ?title= untuk pencarian
  async getAllBooks(req, res) {
    try {
      const { title } = req.query;
      const books = await BookModel.getAll(title);
      res.json(books);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Tugas 1: Ambil satu buku berdasarkan ID
  async getBookById(req, res) {
    try {
      const book = await BookModel.getById(req.params.id);
      if (!book) {
        return res.status(404).json({ error: 'Buku tidak ditemukan.' });
      }
      res.json(book);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async createBook(req, res) {
    try {
      const newBook = await BookModel.create(req.body);
      res.status(201).json(newBook);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Tugas 1: Update buku
  async updateBook(req, res) {
    try {
      const updated = await BookModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Buku tidak ditemukan.' });
      }
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Tugas 1: Hapus buku
  async deleteBook(req, res) {
    try {
      const deleted = await BookModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Buku tidak ditemukan.' });
      }
      res.json({ message: 'Buku berhasil dihapus dari sistem.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
