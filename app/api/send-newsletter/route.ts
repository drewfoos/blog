// app/api/test-newsletter/route.ts
import { client, urlFor } from "@/app/lib/sanity";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const BATCH_SIZE = 50;

// Define error type
interface ResendError {
  statusCode: number;
  name: string;
  message: string;
}

export async function POST(req: Request) {
  const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

  // Verify the webhook secret
  const providedSecret = req.headers.get("sanity-webhook-signature");
  if (!SANITY_WEBHOOK_SECRET || providedSecret !== SANITY_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized request" },
      { status: 401 }
    );
  }

  try {
    // Get latest blog post for test
    const latestPost = await client.fetch(`
      *[_type == "blog"] | order(publishedAt desc)[0] {
        title,
        smallDescription,
        "currentSlug": slug.current,
        titleImage,
        publishedAt
      }
    `);

    const subscribers = await client.fetch<string[]>(`
      *[_type == "subscriber" && status == "active"].email
    `);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        message: "No subscribers found",
        subscriberCount: 0,
      });
    }

    // Generate image URL
    const imageUrl = urlFor(latestPost.titleImage).width(600).url();

    // Create the email HTML and text content
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="color: #111; font-size: 24px; margin-bottom: 16px;">${latestPost.title}</h1>
        
        <img 
          src="${imageUrl}" 
          alt="${latestPost.title}"
          style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin: 20px 0;"
        />
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 16px 0;">
          ${latestPost.smallDescription}
        </p>
        
        <a 
          href="https://drewfoosblog.vercel.app/blog/${latestPost.currentSlug}"
          style="display: inline-block; background-color: #0070f3; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 20px;"
        >
          Read the full article →
        </a>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 14px; color: #666;">
          <p>You&apos;re receiving this because you subscribed to Andrew&apos;s Blog updates.</p>
          <p>To unsubscribe, reply to this email.</p>
        </div>
      </div>
    `;

    const emailText = `
New Post: ${latestPost.title}

${latestPost.smallDescription}

Read the full article: https://drewfoosblog.vercel.app/blog/${latestPost.currentSlug}

---
You&apos;re receiving this because you subscribed to Andrew&apos;s Blog updates.
To unsubscribe, reply to this email.
    `;

    const sentBatches = [];
    // Send emails in batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      
      try {
        await resend.emails.send({
          from: "Andrew Blog <onboarding@resend.dev>",
          to: batch[0],
          cc: batch.slice(1),
          subject: `New Post: ${latestPost.title}`,
          html: emailHtml,
          text: emailText,
        });

        sentBatches.push({
          batchNumber: Math.floor(i / BATCH_SIZE) + 1,
          recipientCount: batch.length,
          status: "success",
        });

        // Add a delay between batches
        if (i + BATCH_SIZE < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        const resendError = error as ResendError;
        console.error(`Error sending batch ${Math.floor(i / BATCH_SIZE) + 1}:`, resendError);
        sentBatches.push({
          batchNumber: Math.floor(i / BATCH_SIZE) + 1,
          recipientCount: batch.length,
          status: "error",
          error: resendError.message,
        });
      }
    }

    return NextResponse.json({
      message: "Newsletter sending complete",
      totalSubscribers: subscribers.length,
      batchResults: sentBatches,
      articleDetails: {
        title: latestPost.title,
        slug: latestPost.currentSlug,
      },
    });
  } catch (error) {
    const finalError = error as Error;
    console.error("Test error:", finalError);
    return NextResponse.json(
      { 
        error: finalError.message || "An unknown error occurred",
        details: finalError.toString(),
      },
      { status: 500 }
    );
  }
}
