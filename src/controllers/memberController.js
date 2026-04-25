import { MemberModel } from '../models/memberModel.js';

export const MemberController = {
  // Mendapatkan semua daftar anggota
  async getAllMembers(req, res) {
    try {
      const members = await MemberModel.getAll();
      res.json(members);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Tugas 1: Ambil satu member berdasarkan ID
  async getMemberById(req, res) {
    try {
      const member = await MemberModel.getById(req.params.id);
      if (!member) {
        return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
      }
      res.json(member);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Mendaftarkan anggota baru
  async registerMember(req, res) {
    try {
      const newMember = await MemberModel.create(req.body);
      res.status(201).json({
        message: 'Anggota berhasil didaftarkan!',
        data: newMember
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Tugas 1: Update member
  async updateMember(req, res) {
    try {
      const updated = await MemberModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
      }
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Tugas 1: Hapus member
  async deleteMember(req, res) {
    try {
      const deleted = await MemberModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
      }
      res.json({ message: 'Anggota berhasil dihapus.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
