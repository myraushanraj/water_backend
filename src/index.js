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

// Allow cross-origin resource policy so assets like images can be embedded from other origins (e.g., Next dev server)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Ensure uploads are served with CORP relaxed and explicit CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}, express.static('src/uploads'));

const corsOrigin = env.nodeEnv === 'development'
  ? true
  : (env.clientUrl.includes(',') ? env.clientUrl.split(',').map((s) => s.trim()) : env.clientUrl);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

const limiter = rateLimit({ windowMs: env.rateLimitWindowMs, max: env.rateLimitMax });
app.use('/api', limiter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: corsOrigin, credentials: true },
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