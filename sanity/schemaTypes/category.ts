// schemas/category.ts
import { defineField, defineType } from "sanity";

export default defineType({
    name: 'category',
    title: 'Category',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: rule => rule.required()
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96
            }
        }),
        defineField({
            name: 'color',
            title: 'Color',
            type: 'string',
            description: 'Color for category badge (use Tailwind class name)',
            initialValue: 'primary'
        })
    ]
});