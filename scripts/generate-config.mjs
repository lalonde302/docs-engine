#!/usr/bin/env node
/**
 * Reads content/site.config.json (if present) and patches site.config.ts
 * so the exported siteConfig uses the external JSON values instead of
 * the hardcoded Numanity defaults.
 *
 * Safe to run when no external config exists -- it's a no-op.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXTERNAL_JSON = path.join(ROOT, 'content', 'site.config.json');
const SITE_CONFIG_TS = path.join(ROOT, 'site.config.ts');
const AUTH_FLAGS_TS = path.join(ROOT, 'lib', 'generatedAuthFlags.ts');

function writeAuthFlagsFromJson(json) {
	const auth = json.auth || {};
	const enabled = auth.enabled === true;
	const domain =
		typeof auth.domain === 'string' && auth.domain.length > 0 ? auth.domain : null;
	const domainTs = domain == null ? 'undefined' : JSON.stringify(domain);
	const body = `/**
 * Auto-generated from content/site.config.json by scripts/generate-config.mjs.
 * Edge-safe — middleware and auth.config must not import site.config.ts.
 */
export const authEnabled = ${enabled};
export const authDomain: string | undefined = ${domainTs};
`;
	fs.writeFileSync(AUTH_FLAGS_TS, body, 'utf-8');
	console.log('[generate-config] lib/generatedAuthFlags.ts updated (Edge-safe auth flags).');
}

if (!fs.existsSync(EXTERNAL_JSON)) {
	console.log('[generate-config] No content/site.config.json found — using default config.');
	process.exit(0);
}

console.log('[generate-config] Found content/site.config.json — patching site.config.ts');

const json = JSON.parse(fs.readFileSync(EXTERNAL_JSON, 'utf-8'));
writeAuthFlagsFromJson(json);
const serialized = JSON.stringify(json, null, '\t');

let source = fs.readFileSync(SITE_CONFIG_TS, 'utf-8');

const defaultMarker = 'export const siteConfig: SiteConfig = defaultConfig;';
const patchedRe = /export const siteConfig: SiteConfig = \{[\s\S]*?\} as SiteConfig;/;

const replacement = `export const siteConfig: SiteConfig = ${serialized} as SiteConfig;`;

if (source.includes(defaultMarker)) {
	source = source.replace(defaultMarker, replacement);
} else if (patchedRe.test(source)) {
	source = source.replace(patchedRe, replacement);
} else {
	console.error('[generate-config] Could not find siteConfig assignment in site.config.ts');
	process.exit(1);
}

fs.writeFileSync(SITE_CONFIG_TS, source, 'utf-8');
console.log('[generate-config] site.config.ts patched successfully.');
