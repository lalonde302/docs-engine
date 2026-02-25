import { siteConfig, ThemeVars } from '@/site.config';

function varBlock(vars: ThemeVars): string {
	return [
		`--background: ${vars.background}`,
		`--foreground: ${vars.foreground}`,
		`--sidebar-bg: ${vars.sidebarBg}`,
		`--sidebar-border: ${vars.sidebarBorder}`,
		`--code-bg: ${vars.codeBg}`,
		`--accent: ${vars.accent}`,
		`--accent-light: ${vars.accentLight}`,
	].join('; ');
}

export function getThemeCss(): string {
	return [
		`:root { ${varBlock(siteConfig.theme.light)} }`,
		`.dark { ${varBlock(siteConfig.theme.dark)} }`,
	].join('\n');
}
