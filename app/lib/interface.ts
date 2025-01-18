// lib/interface.ts
export interface Category {
    title: string;
    slug: string;
    color: string;
}

interface SanityImage {
    _type: 'image';
    asset: {
        _ref: string;
        _type: 'reference';
    };
}

export interface SimpleBlogCard {
    title: string;
    smallDescription: string;
    currentSlug: string;
    titleImage: SanityImage;
    publishedAt: string;
    category?: Category;
}

export interface FullBlog extends Omit<SimpleBlogCard, 'smallDescription'> {
    content: {
        _type: string;
        children: Array<{
            _key: string;
            _type: string;
            marks: string[];
            text: string;
        }>;
    }[];
}