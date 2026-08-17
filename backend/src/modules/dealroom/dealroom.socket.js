
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const service = require('./dealroom.service');

const roomPresence = new Map(); // dealRoomId -> Set<userId>

function roomChannel(dealRoomId) {
  return `dealroom:${dealRoomId}`;
}

async function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Missing auth token'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.firebase_uid) return next(new Error('Invalid token payload'));

    const { rows } = await pool.query(
      'SELECT id, role FROM users WHERE firebase_uid = $1',
      [decoded.firebase_uid]
    );
    if (!rows[0]) return next(new Error('No matching user record'));

    socket.user = { dbId: rows[0].id, role: rows[0].role, firebaseUid: decoded.firebase_uid };
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
}

function broadcastPresence(io, dealRoomId) {
  const online = Array.from(roomPresence.get(dealRoomId) || []);
  io.to(roomChannel(dealRoomId)).emit('presence-update', { dealRoomId, online });
}

function initDealRoomSocket(io) {
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    // Rooms this socket has actually been verified as a participant of.
    // send-message re-checks against this set every time -- join-room
    // succeeding once isn't treated as a standing authorization.
    const joinedRooms = new Set();

    socket.on('join-room', async ({ dealRoomId }, callback = () => {}) => {
      try {
        const allowed = await service.isParticipant(dealRoomId, socket.user.dbId);
        if (!allowed) return callback({ error: 'Not a participant in this deal room' });

        socket.join(roomChannel(dealRoomId));
        joinedRooms.add(dealRoomId);

        if (!roomPresence.has(dealRoomId)) roomPresence.set(dealRoomId, new Set());
        roomPresence.get(dealRoomId).add(socket.user.dbId);
        broadcastPresence(io, dealRoomId);

        const history = await service.getMessages(dealRoomId);
        callback({ ok: true, history });
      } catch (err) {
        callback({ error: err.message });
      }
    });

    socket.on('send-message', async ({ dealRoomId, content }, callback = () => {}) => {
      try {
        if (!joinedRooms.has(dealRoomId)) {
          return callback({ error: 'Join the room before sending messages' });
        }
        if (!content || !content.trim()) {
          return callback({ error: 'Message content required' });
        }

        const saved = await service.sendMessage({
          dealRoomId,
          senderUserId: socket.user.dbId,
          content: content.trim(),
        });

        io.to(roomChannel(dealRoomId)).emit('new-message', saved);
        callback({ ok: true, message: saved });
      } catch (err) {
        callback({ error: err.message });
      }
    });

    socket.on('disconnect', () => {
      for (const dealRoomId of joinedRooms) {
        const set = roomPresence.get(dealRoomId);
        if (set) {
          set.delete(socket.user.dbId);
          if (set.size === 0) roomPresence.delete(dealRoomId);
        }
        broadcastPresence(io, dealRoomId);
      }
    });
  });
}

module.exports = initDealRoomSocket;