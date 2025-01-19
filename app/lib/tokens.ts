// app/lib/tokens.ts
import { createHash, randomBytes } from 'crypto';

export function generateUnsubscribeToken(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'fallback-secret';
  const randomString = randomBytes(16).toString('hex');
  
  return createHash('sha256')
    .update(email + secret + randomString)
    .digest('hex') + '.' + randomString;
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  try {
    const [hash, randomString] = token.split('.');
    const secret = process.env.UNSUBSCRIBE_SECRET || 'fallback-secret';
    
    const expectedHash = createHash('sha256')
      .update(email + secret + randomString)
      .digest('hex');
    
    return hash === expectedHash;
  } catch {
    return false;
  }
}