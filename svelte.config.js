import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import {mdsvex} from 'mdsvex';

import path from 'node:path'
import rehypeKatexSvelte from "rehype-katex-svelte";
import remarkMath from 'remark-math'

const config = {
	extensions: ['.svelte', '.md', '.svx'],
    preprocess: [
		vitePreprocess(),
        mdsvex({
            extensions: ['.md', '.svx'],
			layout: {
				_: path.resolve("src/blog.svelte"),
			},
			rehypePlugins: [rehypeKatexSvelte],
			remarkPlugins: [remarkMath]
        })
    ],

	kit: {
		adapter: adapter(),
		alias: {
			$data: path.resolve('./src/data'),
			$lib: path.resolve('./src/lib'),
			$bib: path.resolve('./src/bib'),
		}
	}
};

export default config;
