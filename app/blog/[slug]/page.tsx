import { FullBlog } from "@/app/lib/interface";
import { client, urlFor } from "@/app/lib/sanity";
import { PortableText } from "next-sanity";
import Image from "next/image";
import { CalendarDays, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ShareButton from "@/app/components/ShareButton";
import CodeBlock from "@/app/components/CodeBlock";

export const revalidate = 30;

async function getData(slug: string) {
  const query = `
    *[_type == "blog" && slug.current == $slug] {
      "currentSlug": slug.current,
      title,
      content,
      titleImage,
      publishedAt,
      "category": category->{
        title,
        color
      }
    }[0]
  `;
  const data = await client.fetch(query, { slug });
 
  if (!data) {
    throw new Error('Blog post not found');
  }
  return data;
}

export default async function BlogArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data: FullBlog = await getData(slug);
 
  const date = new Date(data.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <article className="max-w-3xl mx-auto">
      {/* Navigation */}
      <nav className="flex items-center gap-2 mb-16">
        <div className="w-8 h-[2px] bg-primary"/>
        <Link 
          href="/" 
          className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </Link>
      </nav>

      {/* Article Header */}
      <header className="mb-16 space-y-8">
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {data.category && (
              <span 
                className="inline-flex text-sm font-medium px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `hsl(var(--${data.category.color}))`,
                  color: 'hsl(var(--background))'
                }}
              >
                {data.category.title}
              </span>
            )}
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={data.publishedAt}>{date}</time>
            </div>
          </div>

          <h1 className="text-4xl font-serif sm:text-5xl !leading-tight">
            {data.title}
          </h1>
        </div>
      </header>

      {/* Featured Image */}
      <div className="relative aspect-[21/9] mb-16 rounded-lg overflow-hidden">
        <Image
          src={urlFor(data.titleImage).url()}
          alt={data.title}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Article Content */}
      <div className="prose prose-lg dark:prose-invert mx-auto
        prose-headings:font-serif 
        prose-headings:tracking-tight
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
        prose-h3:text-2xl
        prose-p:leading-relaxed prose-p:text-base
        prose-blockquote:border-l-primary 
        prose-blockquote:bg-muted/50 
        prose-blockquote:py-2 
        prose-blockquote:px-6
        prose-code:text-primary 
        prose-code:bg-muted/50 
        prose-code:px-1.5 
        prose-code:py-0.5 
        prose-code:rounded-md
        prose-code:before:content-[''] 
        prose-code:after:content-['']
        prose-li:marker:text-primary
        prose-a:text-primary 
        prose-a:no-underline 
        hover:prose-a:underline
        prose-img:rounded-lg 
        prose-img:border
        max-w-none
      ">
        <PortableText 
          value={data.content}
          components={{
            types: {
              image: ({value}) => (
                <div className="relative aspect-[16/9] my-12 rounded-lg overflow-hidden">
                  <Image
                    src={urlFor(value).url()}
                    alt={value.alt || ''}
                    fill
                    className="object-cover"
                  />
                  {value.caption && (
                    <p className="text-sm text-center text-muted-foreground mt-4">
                      {value.caption}
                    </p>
                  )}
                </div>
              ),
              code: ({value}) => <CodeBlock value={value} />,
            },
            marks: {
              link: ({value, children}) => {
                const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
                return (
                  <a href={value?.href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined}>
                    {children}
                  </a>
                );
              }
            }
          }}
        />
      </div>

      {/* Article Footer */}
      <footer className="mt-16 pt-8 border-t pb-8">
        <div className="flex items-center justify-between gap-4">
          <Link 
            href="/" 
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            More articles
          </Link>
          <ShareButton title={data.title} />
        </div>
      </footer>
    </article>
  );
}