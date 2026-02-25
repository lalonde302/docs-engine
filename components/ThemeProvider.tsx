'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>('light');

	useEffect(() => {
		// Check for saved preference or system preference
		const saved = localStorage.getItem('theme') as Theme | null;
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const initial = saved || (systemPrefersDark ? 'dark' : 'light');
		setTheme(initial);
		document.documentElement.classList.toggle('dark', initial === 'dark');
	}, []);

	const toggleTheme = () => {
		const next = theme === 'light' ? 'dark' : 'light';
		setTheme(next);
		localStorage.setItem('theme', next);
		document.documentElement.classList.toggle('dark', next === 'dark');
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
