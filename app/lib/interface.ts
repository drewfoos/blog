// lib/interface.ts
export interface Category {
    title: string;
    slug: string;
    color: string;
}

export interface simpleBlogCard {
    title: string;
    smallDescription: string;
    currentSlug: string;
    titleImage: any;
    publishedAt: string;
    category?: {
        title: string;
        color: string;
        slug: string;
    };
}

export interface fullBlog extends Omit<simpleBlogCard, 'smallDescription'> {
    content: any;
}