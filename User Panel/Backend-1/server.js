const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware: requests ke beech chalne wale handlers
const logger = require('./middleware/logger');
app.use(logger);
// CORS Configuration
const allowedOrigins = [
  'https://saaransh-user.vercel.app',
  'https://saaransh-admin.vercel.app',
  'http://localhost:5046',
  'http://localhost:8081',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));

// Routes: endpoint modules mount kar raha hai
const commentRoutes = require('./routes/comments');
const mlRoutes = require('./routes/ml');

app.use('/api', commentRoutes);
app.use('/ml', mlRoutes);

// Health check endpoint: server status batata hai
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Centralized error handler: sab errors yahin handle honge
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5046;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected (Neon PostgreSQL)' : 'Not configured'}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

