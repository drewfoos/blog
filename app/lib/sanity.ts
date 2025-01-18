import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url"

export const client = createClient({
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pcu8iz2y',
    token: process.env.SANITY_API_TOKEN, // Add this for write permissions
    useCdn: false,
});

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source)
}