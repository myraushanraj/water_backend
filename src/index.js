import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { connectToDatabase } from './config/db.js';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

await connectToDatabase();

const app = express();

// Security headers
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: 'cross-origin' },
//   })
// );

// app.use(cors({
//   origin: '*'
// }));

app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Serve uploads with relaxed CORP + CORS
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  },
  express.static('src/uploads')
);

// CORS setup
// const allowedOrigins = [
//   'https://main.d3l0tyl8twjasp.amplifyapp.com',
//   'http://localhost:3000',
//   'http://localhost:5173',
//   '*'
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow requests with no origin (like mobile apps or curl)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         return callback(new Error('CORS not allowed'), false);
//       }
//     },
//     credentials: true,
//   })
// );

// Apply CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
});
app.use('/api', limiter);

// API routes
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Create server & Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('join', (room) => socket.join(room));
  socket.on('chat:message', ({ room, message, user }) => {
    io.to(room).emit('chat:message', { message, user, at: new Date().toISOString() });
  });
});

server.listen(env.port, () => {
  console.log(`🚀 Server running on http://localhost:${env.port}`);
});
