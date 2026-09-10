/**
 * Notifications Controller
 */

import { query } from '../config/db.js';

export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const [notifications] = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 20',
      [userId]
    );

    return res.json({ success: true, notifications: notifications || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    await query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    return res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
