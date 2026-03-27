/**
 * Auth flags for auth.config.ts and middleware only (Edge-safe).
 * When content/site.config.json exists, `npm run generate-config` overwrites this file
 * from `json.auth`. Otherwise these defaults match `defaultConfig.auth` in site.config.ts.
 */
export const authEnabled = true;
export const authDomain: string | undefined = 'numanity.us';
