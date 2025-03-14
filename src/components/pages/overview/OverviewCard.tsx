import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';

interface OverviewCardProps {
	title: string;
	amount: string;
	percentage: string;
	icon: LucideIcon;
	tooltip: string;
}

export function OverviewCard({
	title,
	amount,
	percentage,
	icon: Icon,
	tooltip,
}: OverviewCardProps) {
	return (
		<Card>
			<CardHeader className='flex flex-row justify-between items-center space-y-0 pb-2'>
				<CardTitle className='font-medium text-sm'>{title}</CardTitle>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<div className='bg-primary p-2 rounded-full'>
								<Icon className='w-4 h-4 text-primary-foreground' />
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p>{tooltip}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</CardHeader>
			<CardContent>
				<div className='font-bold text-2xl'>{amount}</div>
				<p className='text-muted-foreground text-xs'>{percentage}</p>
			</CardContent>
		</Card>
	);
}
