import { pool } from '../config/db.js';

export const CategoryModel = {
  // Tugas 2: Support pencarian via query param ?name=
  async getAll(name) {
    if (name) {
      const query = 'SELECT * FROM categories WHERE name ILIKE $1 ORDER BY name ASC';
      const result = await pool.query(query, [`%${name}%`]);
      return result.rows;
    }
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
  },

  // Tugas 1: Ambil satu category berdasarkan ID
  async getById(id) {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(name) {
    const query = 'INSERT INTO categories (name) VALUES ($1) RETURNING *';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  },

  // Tugas 1: Update category
  async update(id, name) {
    const query = `
      UPDATE categories
      SET name = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [name, id]);
    return result.rows[0] || null;
  },

  // Tugas 1: Hapus category
  async delete(id) {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }
};
