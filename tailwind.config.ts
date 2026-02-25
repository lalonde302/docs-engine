import type { Config } from 'tailwindcss';
import { siteConfig } from './site.config';

const config: Config = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: siteConfig.theme.colors.primary,
				brand: siteConfig.theme.colors.brand,
			},
		},
	},
	plugins: [],
};

export default config;
