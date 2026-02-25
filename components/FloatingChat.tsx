'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { siteConfig } from '@/site.config';

interface Message {
	role: 'user' | 'assistant';
	content: string;
}

export function FloatingChat() {
	const [input, setInput] = useState('');
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Auto-resize textarea
	const resizeTextarea = useCallback(() => {
		const el = inputRef.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = Math.min(el.scrollHeight, 120) + 'px';
	}, []);

	// Scroll to bottom of messages
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, loading]);

	// Focus input when chat opens
	useEffect(() => {
		if (open) inputRef.current?.focus();
	}, [open]);

	// Close on click outside
	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				if (messages.length === 0) setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open, messages.length]);

	const send = () => {
		const text = input.trim();
		if (!text || loading) return;

		setMessages((prev) => [...prev, { role: 'user', content: text }]);
		setInput('');
		setLoading(true);

		// Reset textarea height
		if (inputRef.current) inputRef.current.style.height = 'auto';

		// TODO: Replace with actual API call
		setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: `I'm the ${siteConfig.name} docs assistant. This is a placeholder response — connect me to your API to get real answers!`,
				},
			]);
			setLoading(false);
		}, 1000);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	};

	const clearChat = () => {
		setMessages([]);
		setLoading(false);
		setInput('');
		setOpen(false);
	};

	// Collapsed pill button
	if (!open) {
		return (
			<button
				onClick={() => setOpen(true)}
				className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 rounded-full border border-[var(--sidebar-border)] bg-[var(--background)] px-5 py-3 shadow-lg hover:shadow-xl transition-all hover:border-[var(--accent)] group"
			>
				<svg
					className="w-[18px] h-[18px] text-[var(--accent)] transition-transform group-hover:scale-110"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
					/>
				</svg>
				<span className="text-sm font-medium text-[var(--foreground)] opacity-70 group-hover:opacity-100 transition-opacity">
					Ask the docs anything...
				</span>
			</button>
		);
	}

	// Expanded chat
	return (
		<div
			ref={containerRef}
			className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
		>
			{/* Messages panel */}
			{messages.length > 0 && (
				<div className="mb-2 rounded-2xl border border-[var(--sidebar-border)] bg-[var(--background)] shadow-2xl overflow-hidden">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-[var(--sidebar-border)] px-4 py-2">
						<div className="flex items-center gap-2">
							<svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
								/>
							</svg>
							<span className="text-xs font-semibold tracking-wide uppercase text-[var(--foreground)] opacity-50">
								{siteConfig.name} Assistant
							</span>
						</div>
						<button
							onClick={clearChat}
							className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-[var(--code-bg)] transition-colors"
							aria-label="Clear chat"
						>
							<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Messages */}
					<div ref={scrollRef} className="max-h-72 overflow-y-auto p-4 space-y-3">
						{messages.map((msg, i) => (
							<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
								<div
									className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
										msg.role === 'user'
											? 'bg-[var(--accent)] text-white rounded-br-md'
											: 'bg-[var(--code-bg)] text-[var(--foreground)] border border-[var(--sidebar-border)] rounded-bl-md'
									}`}
								>
									{msg.content}
								</div>
							</div>
						))}
						{loading && (
							<div className="flex justify-start">
								<div className="bg-[var(--code-bg)] border border-[var(--sidebar-border)] rounded-2xl rounded-bl-md px-4 py-3">
									<div className="flex gap-1">
										<span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-50 animate-bounce [animation-delay:0ms]" />
										<span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-50 animate-bounce [animation-delay:150ms]" />
										<span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-50 animate-bounce [animation-delay:300ms]" />
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Input bar */}
			<div
				className="flex items-end gap-3 rounded-2xl border border-[var(--sidebar-border)] bg-[var(--background)] pl-4 pr-3 py-2.5 shadow-2xl transition-all focus-within:border-[var(--accent)]"
			>
				<textarea
					ref={inputRef}
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
						resizeTextarea();
					}}
					onKeyDown={handleKeyDown}
					placeholder="Ask the docs anything..."
					rows={1}
					className="flex-1 resize-none bg-transparent text-sm text-[var(--foreground)] placeholder-gray-400 dark:placeholder-gray-500 outline-none leading-relaxed py-1"
					style={{ minHeight: '24px', maxHeight: '120px' }}
				/>

				<button
					onClick={send}
					disabled={!input.trim() || loading}
					className="flex-shrink-0 rounded-xl bg-[var(--accent)] p-2 text-white transition-all hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed"
					aria-label="Send message"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
					</svg>
				</button>
			</div>
		</div>
	);
}
