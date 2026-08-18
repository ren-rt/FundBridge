const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.set('io', io);
 
const initDealRoomSocket = require('./modules/dealroom/dealroom.socket');
initDealRoomSocket(io);

app.use(express.json());
app.use(require('cors')());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
const foundersRoutes = require('./modules/founders/founders.routes');
app.use('/api/founders', foundersRoutes);

const adminVerificationRoutes = require('./modules/adminVerification/adminVerification.routes');
app.use('/api/admin/verifications', adminVerificationRoutes);

const startupSchoolRoutes = require('./modules/startupSchool/startupSchool.routes');
app.use('/api/startup-school', startupSchoolRoutes);

const pitchesRoutes = require('./modules/pitches/pitches.routes');
app.use('/api/pitches', pitchesRoutes);

const feedRoutes = require('./modules/feed/feed.routes');
app.use('/api/feed', feedRoutes);

const investorsRoutes = require('./modules/investors/investors.routes');
app.use('/api/investors', investorsRoutes);

const authRoutes = require('./modules/auth/auth.routes');
app.use('/api/auth', authRoutes);

const matchesRoutes = require('./modules/matches/matches.routes');
app.use('/api/matches', matchesRoutes);

const dealroomRoutes = require('./modules/dealroom/dealroom.routes');
app.use('/api/dealrooms', dealroomRoutes);

const notificationsRoutes = require('./modules/notifications/notifications.routes');
app.use('/api/notifications', notificationsRoutes);

const postsRoutes = require('./modules/posts/posts.routes');
app.use('/api/posts', postsRoutes);

const liveSessionsRoutes = require('./modules/liveSessions/liveSessions.routes');
app.use('/api/live-sessions', liveSessionsRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
