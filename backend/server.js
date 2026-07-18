require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const chatRouter = require('./routes/chat');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security & Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false  // allow inline scripts in the served frontend
}));
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '10kb' }));

// Rate limiting – 60 requests/min per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});
app.use('/api/', limiter);

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/chat', chatRouter);
app.use('/api/health', healthRouter);

// ── Serve Frontend ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅  Fitness Buddy server running on http://localhost:${PORT}`);
  console.log(`   IBM Granite model : ${process.env.IBM_MODEL_ID || 'ibm/granite-13b-chat-v2'}`);
});
