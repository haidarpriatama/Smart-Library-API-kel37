import { pool } from '../config/db.js';

export const ReportModel = {
  async getStats() {
    // Jalankan semua query secara paralel untuk efisiensi
    const [totalBooks, totalAuthors, totalCategories, activeLoans] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM books'),
      pool.query('SELECT COUNT(*)::int AS count FROM authors'),
      pool.query('SELECT COUNT(*)::int AS count FROM categories'),
      pool.query("SELECT COUNT(*)::int AS count FROM loans WHERE status = 'BORROWED'")
    ]);

    return {
      total_books: totalBooks.rows[0].count,
      total_authors: totalAuthors.rows[0].count,
      total_categories: totalCategories.rows[0].count,
      active_loans: activeLoans.rows[0].count
    };
  }
};
