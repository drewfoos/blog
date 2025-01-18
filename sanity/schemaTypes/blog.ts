// schemas/blog.ts
import { defineField, defineType } from "sanity";

export default defineType({
    name: 'blog',
    type: 'document',
    title: 'Blog',
    fields: [
        defineField({
            name: 'title',
            type: 'string',
            title: 'Title of blog article',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'slug',
            type: 'slug',
            title: 'Slug of your blog article',
            options: {
                source: 'title',
                maxLength: 96
            },
            validation: rule => rule.required()
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
            initialValue: () => new Date().toISOString()
        }),
        defineField({
            name: 'titleImage',
            type: 'image',
            title: 'Title Image',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'smallDescription',
            type: 'text',
            title: 'Small Description',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'category' }]
        }),
        defineField({
            name: 'content',
            type: 'array',
            title: 'Content',
            of: [
                {
                    type: 'block',
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                        { title: 'Quote', value: 'blockquote' }
                    ],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                            { title: 'Code', value: 'code' }
                        ],
                        annotations: [
                            {
                                name: 'link',
                                type: 'object',
                                title: 'Link',
                                fields: [
                                    {
                                        name: 'href',
                                        type: 'url',
                                        title: 'URL'
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    type: 'image',
                    options: {
                        hotspot: true
                    },
                    fields: [
                        {
                            name: 'caption',
                            type: 'string',
                            title: 'Caption',
                            description: 'Image caption'
                        },
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alt text',
                            description: 'Important for SEO and accessibility'
                        }
                    ]
                },
                {
                    type: 'code',
                    title: 'Code Block',
                    options: {
                        language: 'typescript',
                        languageAlternatives: [
                            { title: 'TypeScript', value: 'typescript' },
                            { title: 'JavaScript', value: 'javascript' },
                            { title: 'HTML', value: 'html' },
                            { title: 'CSS', value: 'css' },
                            { title: 'JSON', value: 'json' },
                            { title: 'Python', value: 'python' },
                            { title: 'PHP', value: 'php' },
                            { title: 'Shell', value: 'bash' },
                            { title: 'JSX', value: 'jsx' },
                            { title: 'TSX', value: 'tsx' },
                            { title: 'YAML', value: 'yaml' }
                        ],
                        withFilename: true,
                    }
                }
            ],
        }),
    ],
});