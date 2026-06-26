const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');
const db = require('./config/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false
}));

app.use(bodyParser.json());
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/friends', friendRoutes);

app.get('/', (req, res) => {
  res.send('Spit Node.js PostgreSQL project is running');
});

const startServer = async () => {
  try {
    await db.query('SELECT 1');
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1);
  }
};

startServer();
