// app/api/subscribe/route.ts
import { client } from "@/app/lib/sanity";
import { NextResponse } from "next/server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Basic email validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Normalize email to prevent case-sensitive duplicates
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing subscriber
    const existingSubscriber = await client.fetch(`
      *[_type == "subscriber" && lower(email) == $email][0]
    `, { email: normalizedEmail });

    if (existingSubscriber) {
      // If they exist but aren't active, reactivate them
      if (existingSubscriber.status === 'unsubscribed') {
        await client
          .patch(existingSubscriber._id)
          .set({ status: 'active' })
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

    // Send welcome email
    await resend.emails.send({
      from: "Andrew Blog <onboarding@resend.dev>",
      to: normalizedEmail,
      subject: "Welcome to Andrew's Blog",
      html: `
        <h1>Welcome to Andrew's Blog!</h1>
        <p>Thanks for subscribing to our newsletter. You'll receive updates when new articles are published.</p>
      `,
      text: "Welcome to Andrew's Blog!\n\nThanks for subscribing to our newsletter. You'll receive updates when new articles are published."
    });

    // Create new subscriber
    await client.create({
      _type: 'subscriber',
      email: normalizedEmail,
      status: 'active',
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { message: error.message || 'Error subscribing to newsletter' },
      { status: 500 }
    );
  }
}