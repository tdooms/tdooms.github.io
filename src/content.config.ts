import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const papers = defineCollection({
	loader: glob({ pattern: '**/*.toml', base: './src/content/papers' }),
	schema: z.object({
		title: z.string(),
		date: z.string(),
		conference: z.string(),
		labels: z.array(z.string()).optional(),
		description: z.string(),
		link: z.string(),
		external: z.boolean().optional(),
		authors: z.array(z.string()),
		code: z.string().optional(),
		video: z.string().optional(),
		paper: z.string().optional(),
		models: z.string().optional(),
		demo: z.string().optional(),
		bibtex: z.string().optional(),
	}),
});

const presentations = defineCollection({
	loader: glob({ pattern: '**/*.toml', base: './src/content/presentations' }),
	schema: z.object({
		title: z.string(),
		date: z.string(),
		conference: z.string(),
		description: z.string(),
		link: z.string(),
		external: z.boolean().optional(),
	}),
});

const blogs = defineCollection({
	loader: glob({ pattern: '**/*.toml', base: './src/content/blogs' }),
	schema: ({ image }) => z.object({
		title: z.string(),
		date: z.string(),
		description: z.string().optional(),
		link: z.string(),
		image: image(),
		external: z.boolean().optional(),
	}),
});

const demos = defineCollection({
	loader: glob({ pattern: '**/*.toml', base: './src/content/demos' }),
	schema: ({ image }) => z.object({
		title: z.string(),
		sub: z.string(),
		url: z.string(),
		image: image(),
		square: z.boolean().optional(),
		order: z.number(),
	}),
});

const education = defineCollection({
	loader: glob({ pattern: '**/*.toml', base: './src/content/education' }),
	schema: ({ image }) => z.object({
		title: z.string(),
		start: z.string(),
		end: z.string().optional(),
		icon: image(),
		grade: z.string().optional(),
		subject: z.string().optional(),
		advisor: z.string().optional(),
	}),
});

const work = defineCollection({
	loader: glob({ pattern: '**/*.toml', base: './src/content/work' }),
	schema: ({ image }) => z.object({
		icon: image(),
		title: z.string(),
		start: z.string(),
		end: z.string().optional(),
		text: z.string(),
	}),
});

const languages = defineCollection({
	loader: glob({ pattern: '**/*.toml', base: './src/content/languages' }),
	schema: z.object({
		name: z.string(),
		level: z.string(),
		percent: z.number(),
		order: z.number(),
	}),
});

const awards = defineCollection({
	loader: glob({ pattern: '**/*.toml', base: './src/content/awards' }),
	schema: z.object({
		title: z.string(),
		start: z.string(),
		end: z.string().optional(),
		order: z.number(),
	}),
});

const news = defineCollection({
	loader: glob({ pattern: '**/*.toml', base: './src/content/news' }),
	schema: z.object({
		title: z.string(),
		date: z.string(),
		description: z.string(),
		icon: z.string().optional(),
		link: z.string().optional(),
		external: z.boolean().optional(),
	}),
});

export const collections = {
	papers,
	presentations,
	blogs,
	demos,
	education,
	work,
	languages,
	awards,
	news,
};
