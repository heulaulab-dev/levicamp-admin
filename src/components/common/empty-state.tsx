import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
	title: string;
	description: string;
	icons?: LucideIcon[];
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

export function EmptyState({
	title,
	description,
	icons = [],
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				'text-center',
				'p-14 w-full',
				'group hover:bg-muted/50 transition duration-500 hover:duration-200',
				className,
			)}
		>
			<div className='isolate flex justify-center'>
				{icons.length === 3 ? (
					<>
						<div className='top-1.5 left-2.5 relative place-items-center grid bg-background shadow-lg ring-border rounded-xl ring-1 size-12 -rotate-6 group-hover:-rotate-12 transition group-hover:-translate-x-5 group-hover:-translate-y-0.5 duration-500 group-hover:duration-200'>
							{React.createElement(icons[0], {
								className: 'w-6 h-6 text-muted-foreground',
							})}
						</div>
						<div className='z-10 relative place-items-center grid bg-background shadow-lg ring-border rounded-xl ring-1 size-12 transition group-hover:-translate-y-0.5 duration-500 group-hover:duration-200'>
							{React.createElement(icons[1], {
								className: 'w-6 h-6 text-muted-foreground',
							})}
						</div>
						<div className='top-1.5 right-2.5 relative place-items-center grid bg-background shadow-lg ring-border rounded-xl ring-1 size-12 rotate-6 group-hover:rotate-12 transition group-hover:-translate-y-0.5 group-hover:translate-x-5 duration-500 group-hover:duration-200'>
							{React.createElement(icons[2], {
								className: 'w-6 h-6 text-muted-foreground',
							})}
						</div>
					</>
				) : (
					<div className='place-items-center grid bg-background shadow-lg ring-border rounded-xl ring-1 size-12 transition group-hover:-translate-y-0.5 duration-500 group-hover:duration-200'>
						{icons[0] &&
							React.createElement(icons[0], {
								className: 'w-6 h-6 text-muted-foreground',
							})}
					</div>
				)}
			</div>
			<h2 className='mt-6 font-medium text-foreground'>{title}</h2>
			<p className='mt-1 text-muted-foreground text-sm whitespace-pre-line'>
				{description}
			</p>
			{action && (
				<Button
					onClick={action.onClick}
					variant='outline'
					className={cn('mt-4', 'shadow-sm active:shadow-none')}
				>
					{action.label}
				</Button>
			)}
		</div>
	);
}
