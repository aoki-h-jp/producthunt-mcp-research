// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	integrations: [
		mermaid({
			theme: 'base',
		}),
		starlight({
			title: 'producthunt-mcp-research',
			description: 'Product Hunt MCP research platform with AI-powered natural language queries',
			tableOfContents: {
				minHeadingLevel: 2,
				maxHeadingLevel: 3,
			},
			logo: {
				light: './src/assets/icon.png',
				dark: './src/assets/icon_dark.png',
			},
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'canonical',
						href: '/',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: '/src/styles/mermaid-theme.css',
					},
				},
				{
					tag: 'script',
					attrs: {
						src: '/src/scripts/mermaid-theme.js',
						defer: true,
					},
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:title',
						content: 'Product Hunt MCP Research',
					},
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:description',
						content: 'Product Hunt MCP research platform with AI-powered natural language queries',
					},
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: '/ogp.png',
					},
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:type',
						content: 'website',
					},
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:url',
						content: 'https://producthunt-mcp-research.docs.solopreneurs.tech/',
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:card',
						content: 'summary_large_image',
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:title',
						content: 'Product Hunt MCP Research',
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:description',
						content: 'Product Hunt MCP research platform with AI-powered natural language queries',
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:image',
						content: '/ogp.png',
					},
				},
			],
			customCss: [
				'./src/styles/mermaid-theme.css',
			],
			locales: {
				root: {
					label: 'English',
					lang: 'en',
				},
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/aoki-h-jp/producthunt-mcp-research',
				},
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{
							label: 'Introduction',
							link: '/introduction/',
						},
						{
							label: 'Installation',
							link: '/installation/',
						},
						{
							label: 'Quick Start',
							link: '/quick-start/',
						},
					],
				},
				{
					label: 'Configuration',
					items: [
						{
							label: 'Configuration',
							link: '/configuration/',
						},
					],
				},
				{
					label: 'API Reference',
					items: [
						{
							label: 'CLI Reference',
							link: '/reference/cli/',
						},
						{
							label: 'Orchestrator API',
							link: '/reference/orchestrator/',
						},
						{
							label: 'Fetcher API',
							link: '/reference/fetcher/',
						},
						{
							label: 'Repository API',
							link: '/reference/repository/',
						},
						{
							label: 'Utilities',
							link: '/reference/utilities/',
						},
					],
				},
			],
		}),
	],
});
