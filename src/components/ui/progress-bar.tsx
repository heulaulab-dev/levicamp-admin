'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BottomProgressProps {
	isLoading?: boolean;
	progress?: number;
	className?: string;
	duration?: number;
}

export function BottomProgress({
	isLoading = false,
	progress: externalProgress,
	className,
	duration = 300,
}: BottomProgressProps) {
	const [progress, setProgress] = useState(0);
	const [visible, setVisible] = useState(false);

	// Handle automatic progress when isLoading is true
	useEffect(() => {
		if (isLoading && !visible) {
			// Show the progress bar
			setVisible(true);
			setProgress(0);

			// Start with initial progress
			const timer = setTimeout(() => {
				setProgress(20);
			}, 100);

			return () => clearTimeout(timer);
		} else if (!isLoading && visible && externalProgress === undefined) {
			// Complete the progress
			setProgress(100);

			// Hide after animation completes
			const timer = setTimeout(() => {
				setVisible(false);
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [isLoading, visible, duration, externalProgress]);

	// If external progress is provided, use it
	useEffect(() => {
		if (externalProgress !== undefined) {
			setVisible(true);
			setProgress(externalProgress);

			if (externalProgress >= 100) {
				const timer = setTimeout(() => {
					setVisible(false);
				}, duration);

				return () => clearTimeout(timer);
			}
		}
	}, [externalProgress, duration]);

	if (!visible) return null;

	return (
		<div className={cn('fixed bottom-0 left-0 right-0 z-50 px-0', className)}>
			<Progress
				value={progress}
				className='rounded-none h-1'
				style={{
					transitionProperty: 'width, opacity',
					transitionDuration: `${duration}ms`,
					transitionTimingFunction: 'ease-out',
				}}
			/>
		</div>
	);
}
