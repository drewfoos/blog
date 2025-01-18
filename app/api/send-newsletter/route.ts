// app/api/send-newsletter/route.ts
import { client } from "@/app/lib/sanity";
import { NextResponse } from "next/server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const BATCH_SIZE = 50; // Adjust based on your needs

export async function POST(req: Request) {
  try {
    const { article } = await req.json();

    // Get all active subscribers
    const subscribers = await client.fetch(`
      *[_type == "subscriber" && status == "active"].email
    `);

    if (!subscribers.length) {
      return NextResponse.json(
        { message: 'No subscribers found' },
        { status: 200 }
      );
    }

    // Split subscribers into batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      
      await resend.emails.send({
        from: "Andrew Blog <onboarding@resend.dev>",
        to: batch[0], // First recipient in batch
        cc: batch.slice(1), // Rest of batch
        subject: `New Post: ${article.title}`,
        html: `
          <h1>${article.title}</h1>
          <p>${article.smallDescription}</p>
          <a href="https://yourdomain.com/blog/${article.currentSlug}">Read More</a>
        `,
        text: `${article.title}\n\n${article.smallDescription}\n\nRead More: https://yourdomain.com/blog/${article.currentSlug}`
      });

      // Optional: Add a small delay between batches
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json(
      { message: 'Newsletter sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { message: 'Error sending newsletter' },
      { status: 500 }
    );
  }
}