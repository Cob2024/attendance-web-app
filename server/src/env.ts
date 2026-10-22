import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from process.cwd() or server/ folder
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

// If JWT_SECRET is still missing:
// In development, supply default local development secret with warning.
// In production, crash immediately to enforce security.
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  JWT_SECRET was not found in environment; using local development secret.');
    process.env.JWT_SECRET = 'vZiSWFquSWgB5Fe8335Ro7v2Fzp3sL5j_bLA_olR2K_OJazCRfV-IG1-3wZbAikX';
  } else {
    console.error('❌ FATAL: JWT_SECRET environment variable is not set. Server cannot start.');
    process.exit(1);
  }
}

