// app/api/test-newsletter/route.ts
import { client, urlFor } from "@/app/lib/sanity";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

const resend = new Resend(process.env.RESEND_API_KEY);
const BATCH_SIZE = 50;

// Define error type
interface ResendError {
  statusCode: number;
  name: string;
  message: string;
}

// Utility to read the raw request body
const buffer = async (readable: ReadableStream | null): Promise<Buffer> => {
  const reader = readable?.getReader();
  const chunks = [];
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
};

export async function POST(req: Request) {
  const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

  // Validate that the secret exists
  if (!SANITY_WEBHOOK_SECRET) {
    console.error("Environment variable SANITY_WEBHOOK_SECRET is not set.");
    return NextResponse.json(
      { error: "Server misconfiguration: Secret not set." },
      { status: 500 }
    );
  }

  try {
    // Read the raw body and signature from headers
    const body = await buffer(req.body).toString();
    const signature = req.headers.get(SIGNATURE_HEADER_NAME);

    // Verify the webhook signature
    if (!signature || !isValidSignature(body, signature, SANITY_WEBHOOK_SECRET)) {
      console.error("Webhook authentication failed", {
        providedSignature: signature,
      });
      return NextResponse.json(
        { error: "Unauthorized request: Invalid signature" },
        { status: 401 }
      );
    }

    console.log("Webhook authentication successful");

    // Fetch the latest blog post
    const latestPost = await client.fetch(`
      *[_type == "blog"] | order(publishedAt desc)[0] {
        title,
        smallDescription,
        "currentSlug": slug.current,
        titleImage,
        publishedAt
      }
    `);

    // Fetch active subscribers
    const subscribers = await client.fetch<string[]>(`
      *[_type == "subscriber" && status == "active"].email
    `);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        message: "No subscribers found",
        subscriberCount: 0,
      });
    }

    console.log(`Found ${subscribers.length} active subscribers.`);

    const imageUrl = urlFor(latestPost.titleImage).width(600).url();

    // Create the email content
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
      </div>
    `;

    const emailText = `
New Post: ${latestPost.title}

${latestPost.smallDescription}

Read the full article: https://drewfoosblog.vercel.app/blog/${latestPost.currentSlug}
    `;

    const sentBatches = [];

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      console.log(`Sending batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batch.length} recipients...`);

      try {
        await resend.emails.send({
          from: "drewfoosBlog <onboarding@resend.dev>",
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
    console.error("Unexpected error occurred:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : error,
      },
      { status: 500 }
    );
  }
}
