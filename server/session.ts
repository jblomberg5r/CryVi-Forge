import { Express } from 'express';
import session from 'express-session';
import { pool } from './db';
import connectPg from 'connect-pg-simple';

export function setupSession(app: Express) {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: 'sessions'
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'cryvi-forge-dev-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));
}