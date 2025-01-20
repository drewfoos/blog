// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import DOMPurify from 'isomorphic-dompurify';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_REQUESTS = 5; // 5 requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Max sizes for inputs
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 1000;

// Turnstile validation function with timeout
async function validateTurnstileToken(token: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const result = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({
          secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY!,
          response: token,
        }),
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeout);
    return result.json();
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// Security headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://challenges.cloudflare.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export async function POST(req: Request) {
  try {
    // Environment check
    if (!process.env.RESEND_API_KEY) {
      console.error('Resend API key not configured');
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500, headers: securityHeaders }
      );
    }

    // Rate limiting check
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
    const now = Date.now();
    const userRateLimit = rateLimit.get(ip);

    if (userRateLimit) {
      if (now - userRateLimit.timestamp < RATE_LIMIT_WINDOW) {
        if (userRateLimit.count >= RATE_LIMIT_REQUESTS) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429, headers: securityHeaders }
          );
        }
        userRateLimit.count++;
      } else {
        rateLimit.set(ip, { count: 1, timestamp: now });
      }
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }

    // Clean up old rate limit entries
    if (Math.random() < 0.1) {
      const cutoff = now - RATE_LIMIT_WINDOW;
      for (const [key, value] of rateLimit.entries()) {
        if (value.timestamp < cutoff) {
          rateLimit.delete(key);
        }
      }
    }

    // Content type validation
    if (req.headers.get("content-type") !== "application/json") {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 415, headers: securityHeaders }
      );
    }

    // Parse request body
    const { name, email, message, token } = await req.json();

    console.log('Received form data:', { 
      name: name?.slice(0, 20), // Log truncated values for safety
      email: email?.slice(0, 20),
      messageLength: message?.length,
      hasToken: !!token 
    });

    // Basic validation
    if (!name || !email || !message || 
        typeof name !== 'string' || 
        typeof email !== 'string' || 
        typeof message !== 'string') {
      console.log('Validation failed:', { 
        hasName: !!name, 
        hasEmail: !!email, 
        hasMessage: !!message,
        typeofName: typeof name,
        typeofEmail: typeof email,
        typeofMessage: typeof message
      });
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Size validation
    if (name.length > MAX_NAME_LENGTH || 
        email.length > MAX_EMAIL_LENGTH || 
        message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "Input exceeds maximum length" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Email format validation
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Turnstile verification (except in development)
    if (process.env.NODE_ENV !== 'development') {
      if (!process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
        console.error('Turnstile secret key not configured');
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500, headers: securityHeaders }
        );
      }

      if (!token) {
        console.log('No token provided');
        return NextResponse.json(
          { error: "Captcha token required" },
          { status: 400, headers: securityHeaders }
        );
      }

      try {
        const turnstileResult = await validateTurnstileToken(token);
        if (!turnstileResult.success) {
          console.log('Turnstile validation failed:', turnstileResult);
          return NextResponse.json(
            { error: "Invalid captcha token" },
            { status: 400, headers: securityHeaders }
          );
        }
      } catch (error) {
        console.error('Turnstile verification error:', error);
        return NextResponse.json(
          { error: "Failed to verify captcha" },
          { status: 500, headers: securityHeaders }
        );
      }
    }

    // Sanitize inputs
    const sanitizeInput = (input: string) => {
      const sanitized = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: [], // No attributes allowed
      });

      return sanitized
        .trim()
        .replace(/[<>]/g, '') // Extra safety: remove any remaining angle brackets
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    };

    const sanitizedName = sanitizeInput(name);
    const sanitizedMessage = sanitizeInput(message);

    // Send email
    try {
      await resend.emails.send({
        from: "noreply@andrewdryfoos.dev",
        to: "dryfoosa@gmail.com",
        subject: `New Contact Form Submission from ${sanitizedName}`,
        text: `
Name: ${sanitizedName}
Email: ${email}

Message:
${sanitizedMessage}
        `,
        html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${sanitizedName}</p>
<p><strong>Email:</strong> ${email}</p>
<h3>Message:</h3>
<p>${sanitizedMessage}</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500, headers: securityHeaders }
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200, headers: securityHeaders }
    );
  } catch (error) {
    console.error("Unexpected error in contact route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500, headers: securityHeaders }
    );
  }
}