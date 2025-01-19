// app/api/subscribe/route.ts
import { client } from "@/app/lib/sanity";
import { NextResponse } from "next/server";
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

const getEmailTemplate = (email: string, unsubscribeToken: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DrewFoos Blog</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  background-color: #f9fafb;
">
  <div style="
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  ">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 10px;">
        Welcome to DrewFoos Blog! 🎉
      </h1>
    </div>

    <div style="margin-bottom: 30px;">
      <p style="color: #444; font-size: 16px; line-height: 1.6;">
        Thank you for subscribing! You'll receive email notifications whenever a new article is published.
      </p>
    </div>

    <div style="
      border-top: 1px solid #eee;
      padding-top: 20px;
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    ">
      <p>You're receiving this email because you subscribed to DrewFoos Blog with: ${email}</p>
      <p>
        <a href="https://drewfoosblog.vercel.app/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(unsubscribeToken)}" 
           style="color: #666; text-decoration: underline;">
          Unsubscribe from these notifications
        </a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check for existing subscriber
    const existingSubscriber = await client.fetch(`
      *[_type == "subscriber" && lower(email) == $email][0]
    `, { email: normalizedEmail });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        const newToken = randomBytes(32).toString('hex');
        await client
          .patch(existingSubscriber._id)
          .set({ 
            status: 'active',
            subscribedAt: new Date().toISOString(),
            unsubscribeToken: newToken
          })
          .unset(['unsubscribedAt'])
          .commit();

        return NextResponse.json(
          { message: 'Your subscription has been reactivated!' },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { message: 'This email is already subscribed to our newsletter' },
        { status: 400 }
      );
    }

    // Generate token for new subscriber
    const unsubscribeToken = randomBytes(32).toString('hex');

    // Create new subscriber
    await client.create({
      _type: 'subscriber',
      email: normalizedEmail,
      status: 'active',
      subscribedAt: new Date().toISOString(),
      unsubscribeToken
    });

    // Send welcome email
    await resend.emails.send({
      from: "Drewfoos Blog <onboarding@resend.dev>",
      to: normalizedEmail,
      subject: "Welcome to DrewFoos Blog! 🎉",
      html: getEmailTemplate(normalizedEmail, unsubscribeToken),
      text: `Welcome to DrewFoos Blog!

Thank you for subscribing! You'll receive email notifications whenever a new article is published.

To unsubscribe, visit: https://drewfoosblog.vercel.app/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&token=${encodeURIComponent(unsubscribeToken)}`,
    });

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your subscription' },
      { status: 500 }
    );
  }
}