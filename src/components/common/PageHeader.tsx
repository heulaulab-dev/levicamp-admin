// components/common/PageHeader.tsx
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PageHeaderProps {
	title: string;
	buttonLabel?: string;
	onButtonClick?: () => void;
	onRefresh?: () => void;
	isLoading?: boolean;
}

export function PageHeader({
	title,
	buttonLabel,
	onButtonClick,
	onRefresh,
	isLoading,
}: PageHeaderProps) {
	return (
		<div className='flex justify-between items-center mb-8'>
			<h1 className='font-semibold text-2xl'>{title}</h1>
			<div className='flex items-center gap-2'>
				{onRefresh && (
					<Button
						variant='outline'
						size='icon'
						onClick={onRefresh}
						disabled={isLoading}
						className='w-9 h-9'
					>
						<RefreshCw
							className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
						/>
						<span className='sr-only'>Refresh data</span>
					</Button>
				)}
				{buttonLabel && onButtonClick && (
					<Button onClick={onButtonClick} disabled={isLoading}>
						{buttonLabel}
					</Button>
				)}
			</div>
		</div>
	);
}
