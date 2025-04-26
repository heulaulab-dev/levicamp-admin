import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon } from 'lucide-react';
import { format, isBefore, startOfToday } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
	DrawerDescription,
} from '@/components/ui/drawer';

type Props = {
	date?: DateRange;
	setDate: (range?: DateRange) => void;
	label?: string;
};

export default function DateRangePicker({ date, setDate }: Props) {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const today = startOfToday();

	if (isMobile) {
		return (
			<div className='flex flex-col gap-2 w-full'>
				<Drawer>
					<DrawerTrigger asChild>
						<Button className='flex justify-between bg-white hover:bg-white w-full text-secondary-foreground'>
							{date?.from ? (
								date.to ? (
									<>
										{format(date.from, 'PPP')} - {format(date.to, 'PPP')}
									</>
								) : (
									format(date.from, 'PPP')
								)
							) : (
								'Select date range'
							)}
							<CalendarIcon className='ml-2 w-4 h-4' />
						</Button>
					</DrawerTrigger>
					<DrawerContent className='p-4'>
						<DrawerHeader className='text-left'>
							<DrawerTitle>Set The Date</DrawerTitle>
							<DrawerDescription>
								Select the date you want to stay at the campsite.
							</DrawerDescription>
						</DrawerHeader>
						<Calendar
							mode='range'
							selected={date}
							onSelect={(newDate) => {
								setDate(newDate);
								if (newDate?.from && newDate?.to) {
									document
										.querySelector<HTMLButtonElement>('.vaul-drawer-close')
										?.click();
								}
							}}
							numberOfMonths={1}
							className='p-4 w-full max-w-full'
							classNames={{
								head_row: 'w-full flex justify-between',
								row: 'w-full flex justify-between mt-2',
								table: 'w-full',
								cell: 'w-full flex justify-between',
							}}
							disabled={(date) => isBefore(date, today)}
							initialFocus
						/>
						<DrawerFooter className='pt-2'>
							<DrawerClose asChild>
								<Button variant='outline'>Choose dates</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-2 w-full'>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						className='flex justify-between text-secondary-foreground'
						variant={'outline'}
					>
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, 'PPP')} - {format(date.to, 'PPP')}
								</>
							) : (
								format(date.from, 'PPP')
							)
						) : (
							'Select date range'
						)}
						<CalendarIcon className='ml-2 w-4 h-4' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='p-0 md:p-4 w-auto'>
					<div className='flex flex-col items-center gap-2 p-2'>
						<h1 className='font-bold text-xl'>Set The Date</h1>
						<p className='text-sm'>
							Select the date you want to stay at the campsite.
						</p>
					</div>
					<Separator className='my-2' />
					<Calendar
						mode='range'
						selected={date}
						onSelect={setDate}
						numberOfMonths={2}
						className='rounded-md'
						disabled={(date) => isBefore(date, today)}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
