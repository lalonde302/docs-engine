'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { siteConfig } from '@/site.config';

interface Message {
	role: 'user' | 'assistant';
	content: string;
}

interface ChatPanelProps {
	isOpen: boolean;
	onToggle: () => void;
}

export function ChatPanel({ isOpen, onToggle }: ChatPanelProps) {
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

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
		if (isOpen) inputRef.current?.focus();
	}, [isOpen]);

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
					content: `I'm the ${siteConfig.name} assistant. This is a placeholder response — connect me to your API to get real responses!`,
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
	};

	return (
		<>
			{/* Toggle tab (visible when panel is closed) */}
			{!isOpen && (
				<button
					onClick={onToggle}
					className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 rounded-l-xl border border-r-0 border-[var(--sidebar-border)] bg-[var(--background)] pl-2.5 pr-2 py-3 shadow-md hover:shadow-lg transition-all hover:border-[var(--accent)] group"
					aria-label="Open chat"
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
					<span className="text-xs font-medium text-[var(--foreground)] opacity-60 group-hover:opacity-100 transition-opacity [writing-mode:vertical-lr] rotate-180">
						Ask AI
					</span>
				</button>
			)}

			{/* Chat panel */}
			<aside
				className={`flex-shrink-0 border-l border-[var(--sidebar-border)] bg-[var(--background)] transition-all duration-200 ease-in-out ${
					isOpen ? 'w-80 lg:w-96' : 'w-0'
				} overflow-hidden`}
			>
				<div className="flex flex-col h-full w-80 lg:w-96">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-[var(--sidebar-border)] px-4 py-3 flex-shrink-0">
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
								Ask AI
							</span>
						</div>
						<div className="flex items-center gap-1">
							{messages.length > 0 && (
								<button
									onClick={clearChat}
									className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-[var(--code-bg)] transition-colors"
									aria-label="Clear chat"
									title="Clear chat"
								>
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							)}
							<button
								onClick={onToggle}
								className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-[var(--code-bg)] transition-colors"
								aria-label="Close chat"
								title="Close chat"
							>
								<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					</div>

					{/* Messages area */}
					<div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
						{messages.length === 0 && !loading && (
							<div className="flex flex-col items-center justify-center h-full text-center px-4">
								<svg
									className="w-10 h-10 text-[var(--accent)] opacity-30 mb-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
									/>
								</svg>
								<p className="text-sm text-[var(--foreground)] opacity-40">
									Ask anything about the docs
								</p>
							</div>
						)}
						{messages.map((msg, i) => (
							<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
								<div
									className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
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

					{/* Input bar */}
					<div className="flex-shrink-0 border-t border-[var(--sidebar-border)] p-3">
						<div className="flex items-end gap-2 rounded-xl border border-[var(--sidebar-border)] bg-[var(--code-bg)] pl-3 pr-2 py-2 transition-all focus-within:border-[var(--accent)]">
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
								className="flex-1 resize-none bg-transparent text-sm text-[var(--foreground)] placeholder-gray-400 dark:placeholder-gray-500 outline-none leading-relaxed py-0.5"
								style={{ minHeight: '22px', maxHeight: '120px' }}
							/>
							<button
								onClick={send}
								disabled={!input.trim() || loading}
								className="flex-shrink-0 rounded-lg bg-[var(--accent)] p-1.5 text-white transition-all hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed"
								aria-label="Send message"
							>
								<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}
