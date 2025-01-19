// app/api/unsubscribe/route.ts
import { client } from "@/app/lib/sanity";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json(
        { message: 'Invalid request' },
        { status: 400 }
      );
    }

    // Find subscriber and verify token
    const subscriber = await client.fetch(`
      *[_type == "subscriber" && 
        lower(email) == $email && 
        unsubscribeToken == $token][0]
    `, {
      email: email.toLowerCase(),
      token
    });

    if (!subscriber) {
      return NextResponse.json(
        { message: 'Invalid unsubscribe link' },
        { status: 403 }
      );
    }

    // Update subscriber status
    await client
      .patch(subscriber._id)
      .set({
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString()
      })
      .commit();

    return NextResponse.json(
      { message: 'Successfully unsubscribed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}