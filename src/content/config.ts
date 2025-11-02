import { defineCollection, z } from 'astro:content';

const papers = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
		date: z.string(),
		conference: z.string(), // e.g., "ICML'25", "NeurIPS'25"
		labels: z.array(z.string()).optional(), // e.g., ["workshop", "spotlight", "oral"]
		description: z.string(),
		link: z.string(),
		external: z.boolean().optional(),
		authors: z.array(z.string()),
		// Optional additional links
		code: z.string().optional(),
		video: z.string().optional(),
		paper: z.string().optional(),
		models: z.string().optional(),
		demo: z.string().optional(),
		// BibTeX citation
		bibtex: z.string().optional(),
	}),
});

const presentations = defineCollection({
	type: 'data',
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
	type: 'data',
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
	type: 'data',
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
	type: 'data',
	schema: ({ image }) => z.object({
		title: z.string(),
		start: z.string(),
		end: z.string().optional(),
		icon: image(),
		grade: z.string().optional(),
		subject: z.string().optional(),
		advisor: z.string().optional(),
		order: z.number(),
	}),
});

const work = defineCollection({
	type: 'data',
	schema: ({ image }) => z.object({
		icon: image(),
		title: z.string(),
		start: z.string(),
		end: z.string().optional(),
		text: z.string(),
		order: z.number(),
	}),
});

const languages = defineCollection({
	type: 'data',
	schema: z.object({
		name: z.string(),
		level: z.string(),
		percent: z.number(),
		order: z.number(),
	}),
});

const awards = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
		start: z.string(),
		end: z.string().optional(),
		order: z.number(),
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
};
