import { pool } from '../config/db.js';

export const BookModel = {
  // Tugas 2: Support pencarian via query param ?title=
  async getAll(title) {
    let query;
    let params = [];

    if (title) {
      query = `
        SELECT
          b.*,
          a.name as author_name,
          c.name as category_name,
          COUNT(l.id)::int as loan_count
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN loans l ON l.book_id = b.id
        WHERE b.title ILIKE $1
        GROUP BY
          b.id,
          b.isbn,
          b.title,
          b.author_id,
          b.category_id,
          b.total_copies,
          b.available_copies,
          a.name,
          c.name
        ORDER BY loan_count DESC, b.title ASC
      `;
      params = [`%${title}%`];
    } else {
      query = `
        SELECT
          b.*,
          a.name as author_name,
          c.name as category_name,
          COUNT(l.id)::int as loan_count
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN loans l ON l.book_id = b.id
        GROUP BY
          b.id,
          b.isbn,
          b.title,
          b.author_id,
          b.category_id,
          b.total_copies,
          b.available_copies,
          a.name,
          c.name
        ORDER BY loan_count DESC, b.title ASC
      `;
    }

    const result = await pool.query(query, params);
    return result.rows;
  },

  // Tugas 1: Ambil satu buku berdasarkan ID (dengan JOIN)
  async getById(id) {
    const query = `
      SELECT
        b.*,
        a.name as author_name,
        c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const { isbn, title, author_id, category_id, total_copies } = data;
    const query = `
      INSERT INTO books (isbn, title, author_id, category_id, total_copies, available_copies)
      VALUES ($1, $2, $3, $4, $5, $5) RETURNING *
    `;
    const result = await pool.query(query, [isbn, title, author_id, category_id, total_copies]);
    return result.rows[0];
  },

  // Tugas 1: Update buku
  async update(id, data) {
    const { isbn, title, author_id, category_id, total_copies, available_copies } = data;
    const query = `
      UPDATE books
      SET isbn = $1,
          title = $2,
          author_id = $3,
          category_id = $4,
          total_copies = $5,
          available_copies = $6
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [isbn, title, author_id, category_id, total_copies, available_copies, id]);
    return result.rows[0] || null;
  },

  // Tugas 1: Hapus buku
  async delete(id) {
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }
};
