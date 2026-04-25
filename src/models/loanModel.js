import { pool } from '../config/db.js';

const DEFAULT_LOAN_DAYS = 7;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getDefaultDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + DEFAULT_LOAN_DAYS);
  return dueDate.toISOString().split('T')[0];
}

function normalizeAndValidateIds(book_id, member_id) {
  const normalizedBookId = String(book_id || '').trim();
  const normalizedMemberId = String(member_id || '').trim();

  if (!UUID_REGEX.test(normalizedBookId) || !UUID_REGEX.test(normalizedMemberId)) {
    throw new Error('ID buku dan ID member harus berupa UUID yang valid.');
  }

  return { normalizedBookId, normalizedMemberId };
}

export const LoanModel = {
  async createLoan(book_id, member_id, due_date) {
    const client = await pool.connect(); // Menggunakan client untuk transaksi
    let transactionStarted = false;

    try {
      const { normalizedBookId, normalizedMemberId } = normalizeAndValidateIds(book_id, member_id);

      await client.query('BEGIN'); // Mulai transaksi database
      transactionStarted = true;

      // 1. Cek ketersediaan buku
      const bookCheck = await client.query(
        'SELECT id, available_copies FROM books WHERE id = $1 FOR UPDATE',
        [normalizedBookId]
      );
      if (bookCheck.rows.length === 0) {
        throw new Error('ID buku tidak ditemukan.');
      }

      if (bookCheck.rows[0].available_copies <= 0) {
        throw new Error('Buku sedang tidak tersedia (stok habis).');
      }

      // 2. Pastikan member tersedia
      const memberCheck = await client.query('SELECT id FROM members WHERE id = $1', [normalizedMemberId]);
      if (memberCheck.rows.length === 0) {
        throw new Error('ID member tidak ditemukan.');
      }

      const resolvedDueDate = due_date || getDefaultDueDate();

      // 3. Kurangi stok buku
      await client.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = $1', [normalizedBookId]);

      // 4. Catat transaksi peminjaman
      const loanQuery = `
        INSERT INTO loans (book_id, member_id, due_date) 
        VALUES ($1, $2, $3) RETURNING *
      `;
      const result = await client.query(loanQuery, [normalizedBookId, normalizedMemberId, resolvedDueDate]);

      await client.query('COMMIT'); // Simpan semua perubahan
      return result.rows[0];
    } catch (error) {
      if (transactionStarted) {
        await client.query('ROLLBACK'); // Batalkan jika ada error
      }
      throw error;
    } finally {
      client.release();
    }
  },

  // Tugas 3: Refactor returnLoan — transaksi eksplisit dengan semua kriteria
  async returnLoan(book_id, member_id) {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
      const { normalizedBookId, normalizedMemberId } = normalizeAndValidateIds(book_id, member_id);

      await client.query('BEGIN');
      transactionStarted = true;

      // 1. Validasi buku ada
      const bookCheck = await client.query(
        'SELECT id, total_copies, available_copies FROM books WHERE id = $1 FOR UPDATE',
        [normalizedBookId]
      );
      if (bookCheck.rows.length === 0) {
        throw new Error('ID buku tidak ditemukan.');
      }

      // 2. Validasi member ada
      const memberCheck = await client.query('SELECT id FROM members WHERE id = $1', [normalizedMemberId]);
      if (memberCheck.rows.length === 0) {
        throw new Error('ID member tidak ditemukan.');
      }

      // 3. Cari peminjaman aktif
      const activeLoanCheck = await client.query(
        `
          SELECT id
          FROM loans
          WHERE book_id = $1
            AND member_id = $2
            AND status = 'BORROWED'
            AND return_date IS NULL
          ORDER BY loan_date DESC NULLS LAST
          LIMIT 1
          FOR UPDATE
        `,
        [normalizedBookId, normalizedMemberId]
      );

      if (activeLoanCheck.rows.length === 0) {
        throw new Error('Tidak ada peminjaman aktif untuk ID buku dan ID member tersebut.');
      }

      const loanId = activeLoanCheck.rows[0].id;

      // 4. Ubah status peminjaman menjadi RETURNED dan isi return_date
      const updateLoan = await client.query(
        `
          UPDATE loans
          SET status = 'RETURNED',
              return_date = CURRENT_DATE
          WHERE id = $1
          RETURNING *
        `,
        [loanId]
      );

      if (updateLoan.rowCount === 0) {
        throw new Error('Gagal memperbarui data peminjaman. Silakan coba lagi.');
      }

      // 5. Tambah kembali available_copies sebanyak 1 (tidak melebihi total_copies)
      const updateStock = await client.query(
        `
          UPDATE books
          SET available_copies = LEAST(total_copies, available_copies + 1)
          WHERE id = $1
          RETURNING available_copies
        `,
        [normalizedBookId]
      );

      if (updateStock.rowCount === 0) {
        throw new Error('Gagal memperbarui stok buku. Proses dibatalkan.');
      }

      await client.query('COMMIT');
      return updateLoan.rows[0];
    } catch (error) {
      if (transactionStarted) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllLoans() {
    const query = `
      SELECT l.*, b.title as book_title, m.full_name as member_name
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN members m ON l.member_id = m.id
      ORDER BY
        CASE
          WHEN l.status = 'BORROWED' AND l.return_date IS NULL THEN 0
          ELSE 1
        END,
        l.due_date ASC NULLS LAST,
        l.loan_date DESC NULLS LAST
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};
