// components/common/PageHeader.tsx
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

type PageHeaderProps = {
	title: string;
	subtitle?: string;
	buttonLabel?: string;
	onButtonClick?: () => void;
	isLoading?: boolean;
	icon?: React.ReactNode;
};

export function PageHeader({
	title,
	subtitle,
	buttonLabel,
	onButtonClick,
	isLoading,
	icon = <PlusCircle size={16} />,
}: PageHeaderProps) {
	return (
		<div className='flex justify-between items-center mb-6'>
			<div className='flex flex-col gap-2'>
				<h1 className='font-bold text-3xl tracking-tight'>{title}</h1>
				<p className='text-muted-foreground'>{subtitle}</p>
			</div>

			{/* Render button hanya jika ada buttonLabel & onButtonClick */}
			{buttonLabel && onButtonClick && (
				<Button
					onClick={onButtonClick}
					className='flex items-center gap-2'
					disabled={isLoading}
				>
					{icon}
					<span>{buttonLabel}</span>
				</Button>
			)}
		</div>
	);
}
