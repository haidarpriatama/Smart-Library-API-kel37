import { pool } from '../config/db.js';

export const AuthorModel = {
  // Tugas 2: Support pencarian via query param ?name=
  async getAll(name) {
    if (name) {
      const query = 'SELECT * FROM authors WHERE name ILIKE $1 ORDER BY name ASC';
      const result = await pool.query(query, [`%${name}%`]);
      return result.rows;
    }
    const result = await pool.query('SELECT * FROM authors ORDER BY name ASC');
    return result.rows;
  },

  // Tugas 1: Ambil satu author berdasarkan ID
  async getById(id) {
    const result = await pool.query('SELECT * FROM authors WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(name, nationality) {
    const query = 'INSERT INTO authors (name, nationality) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [name, nationality]);
    return result.rows[0];
  },

  // Tugas 1: Update author
  async update(id, name, nationality) {
    const query = `
      UPDATE authors
      SET name = $1, nationality = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [name, nationality, id]);
    return result.rows[0] || null;
  },

  // Tugas 1: Hapus author
  async delete(id) {
    const result = await pool.query('DELETE FROM authors WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }
};
