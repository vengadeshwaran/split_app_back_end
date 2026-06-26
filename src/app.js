const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const routes = require('./routes');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Spit API is running' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Email already in use' });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors[0].message });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
