const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(require('cors')());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const foundersRoutes = require('./modules/founders/founders.routes');
app.use('/api/founders', foundersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const investorsRoutes = require('./modules/investors/investors.routes');
app.use('/api/investors', investorsRoutes);