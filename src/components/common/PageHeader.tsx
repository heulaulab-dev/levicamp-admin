// components/common/PageHeader.tsx
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

type PageHeaderProps = {
	title: string;
	buttonLabel?: string;
	onButtonClick?: () => void;
	isLoading?: boolean;
	icon?: React.ReactNode;
};

export function PageHeader({
	title,
	buttonLabel,
	onButtonClick,
	isLoading,
	icon = <PlusCircle size={16} />,
}: PageHeaderProps) {
	return (
		<div className='flex justify-between items-center mb-6'>
			<h1 className='font-semibold text-2xl'>{title}</h1>

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
