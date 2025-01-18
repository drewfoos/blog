import { SimpleBlogCard } from "./lib/interface";
import { client, urlFor } from "./lib/sanity";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import NewsletterForm from "@/app/components/NewsletterForm";

export const revalidate = 30;

async function getData(): Promise<SimpleBlogCard[]> {
  const query = `
  *[_type == 'blog'] | order(publishedAt desc) {
    title,
    smallDescription,
    "currentSlug": slug.current,
    titleImage,
    publishedAt
  }`;

  const data: SimpleBlogCard[] = await client.fetch(query);
  return data;
}

export default async function Home(): Promise<JSX.Element> {
  const data: SimpleBlogCard[] = await getData();

  if (!data || data.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-16 py-8">
        <p className="text-center text-muted-foreground">No blog posts available.</p>
      </div>
    );
  }

  const [featuredPost, ...remainingPosts] = data;

  return (
    <div className="max-w-[1200px] mx-auto space-y-16 py-8">
      {/* Featured Post */}
      {featuredPost && (
        <section className="border-b pb-16">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-[2px] bg-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Featured Story</h2>
          </div>
          <article className="grid gap-8 md:grid-cols-12">
            <Link
              href={`/blog/${featuredPost.currentSlug}`}
              className="md:col-span-7 cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={urlFor(featuredPost.titleImage).url()}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition duration-500 hover:scale-105"
                  priority
                />
              </div>
            </Link>
            <div className="md:col-span-5 flex flex-col justify-center">
              <Link href={`/blog/${featuredPost.currentSlug}`} className="space-y-6 cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <time dateTime={featuredPost.publishedAt}>
                    {new Date(featuredPost.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif">{featuredPost.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{featuredPost.smallDescription}</p>
                </div>
              </Link>
              <div className="pt-6">
                <Link
                  href={`/blog/${featuredPost.currentSlug}`}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Read the full story →
                </Link>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* Recent Posts Grid */}
      {remainingPosts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-[2px] bg-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Latest Articles</h2>
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {remainingPosts.map((post) => (
              <article key={post.currentSlug} className="space-y-4">
                <Link href={`/blog/${post.currentSlug}`} className="block cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={urlFor(post.titleImage).url()}
                      alt={post.title}
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors">
                      <CalendarDays className="h-4 w-4" />
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <h3 className="font-serif text-xl leading-snug">{post.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed transition-colors line-clamp-5">
                      {post.smallDescription}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <NewsletterForm />
    </div>
  );
}
