// app/api/test-newsletter/route.ts
import { client, urlFor } from "@/app/lib/sanity";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

const resend = new Resend(process.env.RESEND_API_KEY);
const BATCH_SIZE = 50;

interface Subscriber {
  email: string;
  unsubscribeToken: string;
}

interface ResendError {
  statusCode: number;
  name: string;
  message: string;
}

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

const getEmailContent = (
  post: { title: string; smallDescription: string; currentSlug: string; titleImage: any },
  imageUrl: string,
  subscriberEmail: string,
  unsubscribeToken: string
) => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
      <h1 style="color: #111; font-size: 24px; margin-bottom: 16px;">${post.title}</h1>
      <img 
        src="${imageUrl}" 
        alt="${post.title}"
        style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin: 20px 0;"
      />
      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 16px 0;">
        ${post.smallDescription}
      </p>
      <a 
        href="https://drewfoosblog.vercel.app/blog/${post.currentSlug}"
        style="display: inline-block; background-color: #0070f3; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 20px;"
      >
        Read the full article →
      </a>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; text-align: center;">
        <p>You're receiving this because you subscribed to Drew's Foos Blog with: ${subscriberEmail}</p>
        <p>
          <a 
            href="https://drewfoosblog.vercel.app/unsubscribe?email=${encodeURIComponent(subscriberEmail)}&token=${encodeURIComponent(unsubscribeToken)}"
            style="color: #666; text-decoration: underline;"
          >
            Unsubscribe from these emails
          </a>
        </p>
      </div>
    </div>
  `;

  const text = `
New Post: ${post.title}

${post.smallDescription}

Read the full article: https://drewfoosblog.vercel.app/blog/${post.currentSlug}

To unsubscribe, visit: https://drewfoosblog.vercel.app/unsubscribe?email=${encodeURIComponent(subscriberEmail)}&token=${encodeURIComponent(unsubscribeToken)}
  `;

  return { html, text };
};

export async function POST(req: Request) {
  const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

  if (!SANITY_WEBHOOK_SECRET) {
    console.error("Environment variable SANITY_WEBHOOK_SECRET is not set.");
    return NextResponse.json(
      { error: "Server misconfiguration: Secret not set." },
      { status: 500 }
    );
  }

  try {
    const body = await buffer(req.body).toString();
    const signature = req.headers.get(SIGNATURE_HEADER_NAME);

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

    const latestPost = await client.fetch(`
      *[_type == "blog"] | order(publishedAt desc)[0] {
        title,
        smallDescription,
        "currentSlug": slug.current,
        titleImage,
        publishedAt
      }
    `);

    // Fetch active subscribers with their unsubscribe tokens
    const subscribers = await client.fetch<Subscriber[]>(`
      *[_type == "subscriber" && status == "active"] {
        email,
        unsubscribeToken
      }
    `);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        message: "No subscribers found",
        subscriberCount: 0,
      });
    }

    console.log(`Found ${subscribers.length} active subscribers.`);

    const imageUrl = urlFor(latestPost.titleImage).width(600).url();
    const sentBatches = [];

    // Send emails in batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      console.log(`Sending batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batch.length} recipients...`);

      try {
        // Get email content for the first recipient in the batch
        const { html: firstHtml, text: firstText } = getEmailContent(
          latestPost,
          imageUrl,
          batch[0].email,
          batch[0].unsubscribeToken
        );

        await resend.emails.send({
          from: "drewfoosBlog <onboarding@resend.dev>",
          to: batch[0].email,
          cc: batch.length > 1 ? batch.slice(1).map(s => s.email) : undefined,
          subject: `New Post: ${latestPost.title}`,
          html: firstHtml,
          text: firstText,
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