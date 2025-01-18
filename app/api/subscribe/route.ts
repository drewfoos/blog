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

    // Send welcome email
    await resend.emails.send({
      from: "Andrew Blog <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Andrew's Blog",
      html: `
        <h1>Welcome to Andrew's Blog!</h1>
        <p>Thanks for subscribing to our newsletter. You'll receive updates when new articles are published.</p>
      `,
      text: "Welcome to Andrew's Blog!\n\nThanks for subscribing to our newsletter. You'll receive updates when new articles are published."
    });

    // Create subscriber document in Sanity
    await client.create({
      _type: 'subscriber',
      email,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { message: 'Error subscribing to newsletter' },
      { status: 500 }
    );
  }
}