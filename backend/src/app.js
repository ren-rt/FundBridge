const express = require('express');
require('dotenv').config();

const app = express();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
