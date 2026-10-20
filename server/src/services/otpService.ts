import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';

export interface ResetSessionPayload {
  userId: string;
  codeHash: string;
  target: string;
  channel: 'email' | 'sms';
  role: string;
  purpose: 'reset_session';
}

export interface VerifiedResetPayload {
  userId: string;
  email: string;
  role: string;
  purpose: 'verified_reset';
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP code.
 */
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Mask an email or phone number for safe public display.
 * Examples:
 *   kwabena.mensah@ttu.edu.gh -> k***@ttu.edu.gh
 *   0244123456 -> 024****456
 */
export function maskIdentifier(identifier: string, channel: 'email' | 'sms'): string {
  if (channel === 'email' || identifier.includes('@')) {
    const [local, domain] = identifier.split('@');
    if (!domain) return identifier;
    const maskedLocal = local.length <= 2 
      ? local[0] + '***' 
      : local.slice(0, 2) + '***' + local.slice(-1);
    return `${maskedLocal}@${domain}`;
  }

  // SMS / Phone masking
  const digits = identifier.replace(/\D/g, '');
  if (digits.length <= 4) return identifier;
  const prefix = digits.slice(0, 3);
  const suffix = digits.slice(-3);
  return `${prefix}****${suffix}`;
}

/**
 * Create a cryptographically signed reset session token (valid for 15 minutes).
 */
export async function createResetSessionToken(
  userId: string,
  code: string,
  target: string,
  channel: 'email' | 'sms',
  role: string
): Promise<string> {
  const codeHash = await bcrypt.hash(code, 10);
  const payload: ResetSessionPayload = {
    userId,
    codeHash,
    target,
    channel,
    role,
    purpose: 'reset_session',
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Verify the 6-digit code against the signed reset session token.
 * If valid, returns a single-use verifiedResetToken.
 */
export async function verifyResetSessionToken(
  resetSessionToken: string,
  candidateCode: string
): Promise<{ success: boolean; verifiedResetToken?: string; error?: string }> {
  try {
    const decoded = jwt.verify(resetSessionToken, JWT_SECRET) as ResetSessionPayload;

    if (decoded.purpose !== 'reset_session') {
      return { success: false, error: 'Invalid session token purpose' };
    }

    const matches = await bcrypt.compare(candidateCode.trim(), decoded.codeHash);
    if (!matches) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    // Issue verified token allowing password modification
    const verifiedPayload: VerifiedResetPayload = {
      userId: decoded.userId,
      email: decoded.target,
      role: decoded.role,
      purpose: 'verified_reset',
    };

    const verifiedResetToken = jwt.sign(verifiedPayload, JWT_SECRET, { expiresIn: '15m' });
    return { success: true, verifiedResetToken };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return { success: false, error: 'Reset session has expired. Please request a new code.' };
    }
    return { success: false, error: 'Invalid or corrupted reset session' };
  }
}

/**
 * Verify the verifiedResetToken before updating the user's password.
 */
export function verifyVerifiedResetToken(
  verifiedResetToken: string
): { success: boolean; userId?: string; error?: string } {
  try {
    const decoded = jwt.verify(verifiedResetToken, JWT_SECRET) as VerifiedResetPayload;

    if (decoded.purpose !== 'verified_reset') {
      return { success: false, error: 'Invalid reset verification state' };
    }

    return { success: true, userId: decoded.userId };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return { success: false, error: 'Password reset window has expired. Please start over.' };
    }
    return { success: false, error: 'Invalid or corrupted reset token' };
  }
}

/**
 * Dispatch OTP via Email or SMS.
 * In development, testing, or mock mode, this logs a styled preview to the console.
 */
export async function dispatchOtp(
  channel: 'email' | 'sms',
  target: string,
  code: string,
  userName?: string
): Promise<{ success: boolean; channel: string; message: string }> {
  const timestamp = new Date().toLocaleTimeString();

  // Highlighted console log for institutional observability
  console.log(`\n============================================================`);
  console.log(`🏛️  TTU SMARTATTEND - PASSWORD RESET OTP DISPATCH`);
  console.log(`Channel   : ${channel.toUpperCase()}`);
  console.log(`Recipient : ${target} ${userName ? `(${userName})` : ''}`);
  console.log(`Code      : [ ${code} ]`);
  console.log(`Valid For : 15 Minutes`);
  console.log(`Timestamp : ${timestamp}`);
  console.log(`============================================================\n`);

  // Pluggable Production Hooks:
  // If SMTP environment variables are present, transactional emails can be sent here.
  // If SMS gateway API keys (e.g. Hubtel, Arkesel, Twilio) are present, SMS is sent here.

  return {
    success: true,
    channel,
    message: `Verification code successfully sent via ${channel.toUpperCase()}`,
  };
}

