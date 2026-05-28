import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const papers = defineCollection({
  loader: glob({ pattern: '**/[^_]*.toml', base: './src/content/papers' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      shortTitle: z.string().optional(),
      date: z.string(),
      conference: z.string(),
      labels: z.array(z.string()).optional(),
      description: z.string(),
      link: z.string(),
      external: z.boolean().optional(),
      authors: z.array(z.string()),
      code: z.string().optional(),
      video: z.string().optional(),
      slides: z.string().optional(),
      paper: z.string().optional(),
      models: z.string().optional(),
      news: z.string().optional(),
      bibtex: z.string().optional(),
      // Optional thumbnail shown on the compact card on the home page.
      image: image().optional(),
    }),
})

const papersContent = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/papers' }),
  schema: z.object({}).strict(),
})

const blogs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/blogs' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.string(),
      description: z.string().optional(),
      // Optional now that Blog cards are text-only; kept for forward compatibility.
      image: image().optional(),
      // When set, the blog card links out to this URL and no local page is generated.
      external: z.url().optional(),
    }),
})

const education = defineCollection({
  loader: glob({ pattern: '**/[^_]*.toml', base: './src/content/education' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      start: z.string(),
      end: z.string().optional(),
      icon: image(),
      grade: z.string().optional(),
      subject: z.string().optional(),
      advisor: z.string().optional(),
    }),
})

const work = defineCollection({
  loader: glob({ pattern: '**/[^_]*.toml', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      icon: image(),
      title: z.string(),
      start: z.string(),
      end: z.string().optional(),
      text: z.string(),
    }),
})

const languages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.toml', base: './src/content/languages' }),
  schema: z.object({
    name: z.string(),
    level: z.string(),
    percent: z.number(),
    order: z.number(),
  }),
})

const awards = defineCollection({
  loader: glob({ pattern: '**/[^_]*.toml', base: './src/content/awards' }),
  schema: z.object({
    title: z.string(),
    start: z.string(),
    end: z.string().optional(),
    order: z.number(),
  }),
})

const news = defineCollection({
  loader: glob({ pattern: '**/[^_]*.toml', base: './src/content/news' }),
  schema: z.object({
    // `title` supports **bold** markdown — rendered in brand orange to emphasize key words.
    title: z.string(),
    date: z.string(),
    icon: z.string().optional(),
    link: z.string().optional(),
    external: z.boolean().optional(),
  }),
})

export const collections = {
  papers,
  papersContent,
  blogs,
  education,
  work,
  languages,
  awards,
  news,
}
