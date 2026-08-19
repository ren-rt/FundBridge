
const pool = require('../../config/db');
const { createNotification } = require('../notifications/notifications.service');

async function getRole(userId) {
  const { rows } = await pool.query(`SELECT role FROM users WHERE id = $1`, [userId]);
  return rows[0] ? rows[0].role : null;
}


async function sendMessage(senderUserId, recipientUserId, content) {
  const senderRole = await getRole(senderUserId);
  const recipientRole = await getRole(recipientUserId);

  if (!senderRole || !recipientRole) {
    const err = new Error('Sender or recipient not found');
    err.statusCode = 404;
    throw err;
  }
  if (!(senderRole === 'FOUNDER' && recipientRole === 'INVESTOR') &&
      !(senderRole === 'INVESTOR' && recipientRole === 'FOUNDER')) {
    const err = new Error('Messaging is only between a founder and an investor');
    err.statusCode = 400;
    throw err;
  }

  const founderUserId = senderRole === 'FOUNDER' ? senderUserId : recipientUserId;
  const investorUserId = senderRole === 'INVESTOR' ? senderUserId : recipientUserId;

  let thread;
  const existing = await pool.query(
    `SELECT * FROM message_threads WHERE founder_user_id = $1 AND investor_user_id = $2`,
    [founderUserId, investorUserId]
  );

  if (existing.rows[0]) {
    thread = existing.rows[0];
    if (thread.status === 'DECLINED') {
      const err = new Error('This conversation was declined');
      err.statusCode = 403;
      throw err;
    }
    if (thread.status === 'PENDING' && thread.initiated_by_user_id !== senderUserId) {
      const err = new Error('Accept or decline this conversation before replying');
      err.statusCode = 403;
      throw err;
    }
  } else {
    const { rows } = await pool.query(
      `INSERT INTO message_threads (founder_user_id, investor_user_id, initiated_by_user_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [founderUserId, investorUserId, senderUserId]
    );
    thread = rows[0];
  }

  const { rows: msgRows } = await pool.query(
    `INSERT INTO direct_messages (thread_id, sender_user_id, content)
     VALUES ($1, $2, $3) RETURNING *`,
    [thread.id, senderUserId, content]
  );

  await createNotification(
    recipientUserId,
    thread.status === 'PENDING' && thread.initiated_by_user_id === senderUserId
      ? 'You have a new message request.'
      : 'You have a new message.',
    'SYSTEM'
  );

  return { thread, message: msgRows[0] };
}

async function listThreads(userId) {
  const { rows } = await pool.query(
    `SELECT
       t.id, t.status, t.initiated_by_user_id, t.created_at,
       CASE WHEN t.founder_user_id = $1 THEN t.investor_user_id ELSE t.founder_user_id END AS counterparty_user_id,
       COALESCE(fp.company, ip.firm_name, cu.email) AS counterparty_label,
       (SELECT content FROM direct_messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) AS last_message
     FROM message_threads t
     JOIN users cu ON cu.id = CASE WHEN t.founder_user_id = $1 THEN t.investor_user_id ELSE t.founder_user_id END
     LEFT JOIN profiles fp ON fp.user_id = t.founder_user_id AND fp.role = 'FOUNDER'
     LEFT JOIN profiles ip ON ip.user_id = t.investor_user_id AND ip.role = 'INVESTOR'
     WHERE t.founder_user_id = $1 OR t.investor_user_id = $1
     ORDER BY t.created_at DESC`,
    [userId]
  );
  return rows;
}

async function getThread(threadId) {
  const { rows } = await pool.query(`SELECT * FROM message_threads WHERE id = $1`, [threadId]);
  return rows[0] || null;
}

function isParticipant(thread, userId) {
  return thread.founder_user_id === userId || thread.investor_user_id === userId;
}

async function listMessages(threadId) {
  const { rows } = await pool.query(
    `SELECT * FROM direct_messages WHERE thread_id = $1 ORDER BY created_at ASC`,
    [threadId]
  );
  return rows;
}

async function respondToThread(threadId, userId, accept) {
  const thread = await getThread(threadId);
  if (!thread) return null;
  if (!isParticipant(thread, userId)) {
    const err = new Error('Not a participant in this conversation');
    err.statusCode = 403;
    throw err;
  }
  if (thread.initiated_by_user_id === userId) {
    const err = new Error('You cannot accept or decline your own message request');
    err.statusCode = 403;
    throw err;
  }
  if (thread.status !== 'PENDING') {
    const err = new Error('This conversation has already been responded to');
    err.statusCode = 400;
    throw err;
  }

  const { rows } = await pool.query(
    `UPDATE message_threads SET status = $1 WHERE id = $2 RETURNING *`,
    [accept ? 'ACCEPTED' : 'DECLINED', threadId]
  );

  await createNotification(
    thread.initiated_by_user_id,
    accept ? 'Your message request was accepted.' : 'Your message request was declined.',
    'SYSTEM'
  );

  return rows[0];
}

module.exports = { sendMessage, listThreads, getThread, isParticipant, listMessages, respondToThread };