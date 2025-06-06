'use client';

import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const themes = [
	{
		key: 'system',
		icon: Monitor,
		label: 'System theme',
	},
	{
		key: 'light',
		icon: Sun,
		label: 'Light theme',
	},
	{
		key: 'dark',
		icon: Moon,
		label: 'Dark theme',
	},
];

export type ThemeSwitcherProps = {
	value?: 'light' | 'dark' | 'system';
	onChange?: (theme: 'light' | 'dark' | 'system') => void;
	defaultValue?: 'light' | 'dark' | 'system';
	className?: string;
};

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Only show the theme switcher after mounting to avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Don't render anything until mounted on the client
	if (!mounted) {
		return (
			<div
				className={cn(
					'relative flex h-8 rounded-full bg-background p-1 ring-1 ring-border',
					className,
				)}
			>
				{/* Render placeholder buttons with the same structure but no active state */}
				{themes.map(({ key, icon: Icon, label }) => (
					<button
						type='button'
						key={key}
						className='relative rounded-full w-6 h-6'
						aria-label={label}
					>
						<Icon className='relative m-auto w-4 h-4 text-muted-foreground' />
					</button>
				))}
			</div>
		);
	}

	return (
		<div
			className={cn(
				'relative flex h-8 rounded-full bg-background p-1 ring-1 ring-border',
				className,
			)}
		>
			{themes.map(({ key, icon: Icon, label }) => {
				const isActive = theme === key;

				return (
					<button
						type='button'
						key={key}
						className='relative rounded-full w-6 h-6'
						onClick={() => setTheme(key as 'light' | 'dark' | 'system')}
						aria-label={label}
					>
						{isActive && (
							<motion.div
								layoutId='activeTheme'
								className='absolute inset-0 bg-secondary rounded-full'
								transition={{ type: 'spring', duration: 0.5 }}
							/>
						)}
						<Icon
							className={cn(
								'relative m-auto h-4 w-4',
								isActive ? 'text-foreground' : 'text-muted-foreground',
							)}
						/>
					</button>
				);
			})}
		</div>
	);
};
