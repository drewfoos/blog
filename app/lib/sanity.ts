import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

// Define a simple type for Sanity images
type SanityImageSource = {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
};

export const client = createClient({
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pcu8iz2y',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
    return builder.image(source);
}