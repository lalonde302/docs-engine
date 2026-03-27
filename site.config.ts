/**
 * Site Configuration
 *
 * Multi-tenant docs engine configuration. The exported `siteConfig` is either:
 * 1. Generated from `content/site.config.json` by `generate-config` (runs in predev / prebuild when that file exists)
 * 2. The hardcoded Numanity default below (when no external config exists)
 *
 * To rebrand for a different project, provide a site.config.json in your content repo.
 * Run `npm run generate-config` (or let prebuild handle it) to regenerate this file.
 */

export interface LandingConfig {
	/** Small label above the headline, e.g. who this page is for */
	audience?: string;
	/** Plain-language headline for non-technical readers */
	partnerHeadline: string;
	/** 2–4 sentences: what this site is, why it exists, what decisions it captures */
	partnerLead: string;
	/** Short bullets: what a partner gets from reading */
	valueBullets?: string[];
	/** Optional callout (e.g. where to ask questions) */
	callout?: string;
	/** Heading above the doc section cards */
	browseTitle?: string;
}

export interface SiteConfig {
	name: string;
	shortName: string;
	description: string;
	titleSuffix: string;

	/** Partner-facing home hero; optional; set per content repo in site.config.json */
	landing?: LandingConfig;

	auth: {
		enabled: boolean;
		provider: 'google';
		domain?: string;
	};

	sections: Record<string, { title: string; description: string; order: number }>;

	tabs: {
		docs: { label: string; sections: string[] };
		api: { label: string };
		learn: { label: string; sections: string[] };
		archive: { label: string; sections: string[] };
	};

	features: {
		apiReference: boolean;
		chatPanel: boolean;
		adrTracks: boolean;
	};

	theme: {
		colors: {
			primary: Record<string, string>;
			brand: Record<string, string>;
		};
		light: ThemeVars;
		dark: ThemeVars;
	};
}

export interface ThemeVars {
	background: string;
	foreground: string;
	sidebarBg: string;
	sidebarBorder: string;
	codeBg: string;
	accent: string;
	accentLight: string;
}

const defaultConfig: SiteConfig = {
	name: 'Numanity',
	shortName: 'N',
	description: 'Internal portal for Numanity',
	titleSuffix: 'Numanity Docs',

	auth: {
		enabled: true,
		provider: 'google',
		domain: 'numanity.us',
	},

	sections: {
		guides: {
			title: 'Guides',
			description: 'Best practices and how-to guides for the team.',
			order: 1,
		},
		designs: {
			title: 'Designs',
			description: 'Design documents, RFCs, and feature proposals.',
			order: 2,
		},
		adr: {
			title: 'ADRs',
			description: 'Architecture Decision Records documenting key technical decisions.',
			order: 3,
		},
		reference: {
			title: 'Reference',
			description: 'Technical references and system documentation.',
			order: 4,
		},
		operations: {
			title: 'Operations',
			description: 'CI/CD, deployment, and operational runbooks.',
			order: 5,
		},
		projects: {
			title: 'Projects',
			description: 'In-progress and experimental feature documentation.',
			order: 6,
		},
		archive: {
			title: 'Archive',
			description: 'Miscellaneous records, notes, and archived documents.',
			order: 7,
		},
	},

	tabs: {
		docs: { label: 'Docs', sections: ['reference', 'adr', 'operations'] },
		api: { label: 'API' },
		learn: { label: 'Learn', sections: ['guides', 'designs', 'projects'] },
		archive: { label: 'Archive', sections: ['archive'] },
	},

	features: {
		apiReference: true,
		chatPanel: true,
		adrTracks: true,
	},

	theme: {
		colors: {
			primary: {
				'50': '#f6f9f7',
				'100': '#e8f0eb',
				'200': '#d1e1d7',
				'300': '#a8c7b4',
				'400': '#7aa88a',
				'500': '#5a8a6a',
				'600': '#476f54',
				'700': '#3a5a45',
				'800': '#314a3a',
				'900': '#2a3e31',
				'950': '#162119',
			},
			brand: {
				'50': '#f4f9f6',
				'100': '#e0ede6',
				'200': '#c2dace',
				'300': '#96bfa8',
				'400': '#6a9e80',
				'500': '#4a8264',
				'600': '#3a6850',
				'700': '#315443',
				'800': '#1B4D3E',
				'900': '#1a3a30',
				'950': '#0e211b',
			},
		},
		light: {
			background: '#ffffff',
			foreground: '#1a1a1a',
			sidebarBg: '#f8faf9',
			sidebarBorder: '#d1e7dd',
			codeBg: '#f4f9f6',
			accent: '#1B4D3E',
			accentLight: '#3a6850',
		},
		dark: {
			background: '#111714',
			foreground: '#d4ddd8',
			sidebarBg: '#151c18',
			sidebarBorder: '#263830',
			codeBg: '#1a2420',
			accent: '#7aa88a',
			accentLight: '#96bfa8',
		},
	},
};

export { defaultConfig };

/**
 * Active config. When building with an external content repo, the generate-config
 * script replaces this line with the JSON-derived config. Otherwise it's the default.
 */
export const siteConfig: SiteConfig = {
	"name": "TradeYard",
	"shortName": "TY",
	"description": "Internal documentation for TradeYard — procurement and marketplace for landscape contractors.",
	"titleSuffix": "TradeYard Docs",
	"auth": {
		"enabled": false,
		"provider": "google"
	},
	"sections": {
		"guides": {
			"title": "Guides",
			"description": "How to contribute, naming conventions, and team workflows.",
			"order": 1
		},
		"designs": {
			"title": "Designs",
			"description": "Product and UX design. Use exploratory/ for options; specs/ for finalized build targets.",
			"order": 2
		},
		"adr": {
			"title": "ADRs",
			"description": "Architecture Decision Records — durable technical commitments.",
			"order": 3
		},
		"reference": {
			"title": "Reference",
			"description": "Technical references and system documentation.",
			"order": 4
		},
		"operations": {
			"title": "Operations",
			"description": "Deployment, postmortems, stakeholder briefings, and runbooks.",
			"order": 5
		},
		"archive": {
			"title": "Archive",
			"description": "Historical notes and superseded material.",
			"order": 6
		}
	},
	"tabs": {
		"docs": {
			"label": "Docs",
			"sections": [
				"reference",
				"adr",
				"operations"
			]
		},
		"api": {
			"label": "API"
		},
		"learn": {
			"label": "Learn",
			"sections": [
				"guides",
				"designs"
			]
		},
		"archive": {
			"label": "Archive",
			"sections": [
				"archive"
			]
		}
	},
	"features": {
		"apiReference": false,
		"chatPanel": false,
		"adrTracks": true
	},
	"theme": {
		"colors": {
			"primary": {
				"50": "#f7f6f3",
				"100": "#ede9e1",
				"200": "#d9d2c4",
				"300": "#b8ab9a",
				"400": "#918472",
				"500": "#75685a",
				"600": "#5f5549",
				"700": "#4f463d",
				"800": "#443d36",
				"900": "#3b3530",
				"950": "#211e1b"
			},
			"brand": {
				"50": "#f3f7f4",
				"100": "#e1ebe4",
				"200": "#c4d7ca",
				"300": "#9bb8a6",
				"400": "#6d947c",
				"500": "#4a7a5f",
				"600": "#3a624d",
				"700": "#305040",
				"800": "#294235",
				"900": "#23382e",
				"950": "#121f19"
			}
		},
		"light": {
			"background": "#ffffff",
			"foreground": "#1a1a1a",
			"sidebarBg": "#f8f9f7",
			"sidebarBorder": "#e1e7e0",
			"codeBg": "#f4f6f4",
			"accent": "#305040",
			"accentLight": "#4a7a5f"
		},
		"dark": {
			"background": "#141716",
			"foreground": "#e2e8e4",
			"sidebarBg": "#181c1a",
			"sidebarBorder": "#2a322e",
			"codeBg": "#1c221e",
			"accent": "#9bb8a6",
			"accentLight": "#c4d7ca"
		}
	},
	"landing": {
		"audience": "For TradeYard partners",
		"partnerHeadline": "One place for how we build TradeYard — in plain English",
		"partnerLead": "This site is our shared playbook. It records what we decided and why, what we are building for contractors and suppliers, and how we operate the product safely (auth, payments, data, releases). You do not need to read every technical page: start here, then use the sections below when you want detail.",
		"valueBullets": [
			"Understand the big decisions (ADRs) so we do not re-litigate them later.",
			"Read finalized specs when we are aligned on a feature, and exploratory notes while options are still open.",
			"Find runbooks, postmortems, and partner briefings when we ship a phase or learn something important."
		],
		"callout": "Something missing or unclear? Ask the team — we add or update docs as decisions land.",
		"browseTitle": "Browse the library"
	}
} as SiteConfig;

