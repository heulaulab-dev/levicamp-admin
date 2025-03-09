'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';

const bookings = [
	{
		id: 'BOOK-001',
		startDate: '2024-03-20',
		endDate: '2024-03-22',
		tentCategory: 'VIP',
		tentName: 'Luxury Suite 1',
		guestName: 'John Doe',
		guestPhone: '+1 234-567-8900',
		status: 'Confirmed',
	},
	{
		id: 'BOOK-002',
		startDate: '2024-03-21',
		endDate: '2024-03-23',
		tentCategory: 'Standard',
		tentName: 'Standard Room 3',
		guestName: 'Jane Smith',
		guestPhone: '+1 234-567-8901',
		status: 'Pending',
	},
];

const statusOptions = [
	'Pending',
	'Confirmed',
	'Checked-in',
	'Completed',
	'Canceled',
	'Refund',
	'Rescheduled',
];

const getStatusColor = (status: string) => {
	const colors = {
		'Pending': 'bg-yellow-100 text-yellow-800',
		'Confirmed': 'bg-blue-100 text-blue-800',
		'Checked-in': 'bg-green-100 text-green-800',
		'Completed': 'bg-purple-100 text-purple-800',
		'Canceled': 'bg-red-100 text-red-800',
		'Refund': 'bg-orange-100 text-orange-800',
		'Rescheduled': 'bg-indigo-100 text-indigo-800',
	};
	return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

interface DialogProps {
	booking: (typeof bookings)[0];
	children: React.ReactNode;
	type: 'checkin' | 'modify' | 'cancel';
}

function ResponsiveDialog({ booking, children, type }: DialogProps) {
	const [open, setOpen] = useState(false);
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [status, setStatus] = useState(booking.status);

	const handleAction = () => {
		switch (type) {
			case 'checkin':
				toast.success(`Checked in ${booking.guestName} successfully`);
				break;
			case 'modify':
				toast.success(`Booking ${booking.id} updated successfully`);
				break;
			case 'cancel':
				toast.success(`Booking ${booking.id} cancelled successfully`);
				break;
		}
		setOpen(false);
	};

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{type === 'checkin'
								? 'Check-in Guest'
								: type === 'modify'
								? 'Modify Booking'
								: 'Cancel Booking'}
						</DialogTitle>
						<DialogDescription>
							{type === 'checkin'
								? `Are you sure you want to check in ${booking.guestName}?`
								: type === 'modify'
								? 'Update the booking details below.'
								: `Are you sure you want to cancel booking ${booking.id}?`}
						</DialogDescription>
					</DialogHeader>
					{type === 'modify' && (
						<div className='gap-4 grid py-4'>
							<div className='gap-2 grid'>
								<div>
									<p className='mb-2 font-medium'>Booking Details</p>
									<p>Guest: {booking.guestName}</p>
									<p>Phone: {booking.guestPhone}</p>
									<p>
										Tent: {booking.tentName} ({booking.tentCategory})
									</p>
									<p>
										Dates: {booking.startDate} - {booking.endDate}
									</p>
								</div>
								<div className='space-y-2'>
									<label className='font-medium text-sm'>Status</label>
									<Select value={status} onValueChange={setStatus}>
										<SelectTrigger>
											<SelectValue placeholder='Select status' />
										</SelectTrigger>
										<SelectContent>
											{statusOptions.map((option) => (
												<SelectItem key={option} value={option}>
													{option}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant='outline' onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							variant={type === 'cancel' ? 'destructive' : 'default'}
							onClick={handleAction}
						>
							{type === 'checkin'
								? 'Check In'
								: type === 'modify'
								? 'Save Changes'
								: 'Cancel Booking'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>
						{type === 'checkin'
							? 'Check-in Guest'
							: type === 'modify'
							? 'Modify Booking'
							: 'Cancel Booking'}
					</DrawerTitle>
					<DrawerDescription>
						{type === 'checkin'
							? `Are you sure you want to check in ${booking.guestName}?`
							: type === 'modify'
							? 'Update the booking details below.'
							: `Are you sure you want to cancel booking ${booking.id}?`}
					</DrawerDescription>
				</DrawerHeader>
				{type === 'modify' && (
					<div className='gap-4 grid p-4'>
						<div className='gap-2 grid'>
							<div>
								<p className='mb-2 font-medium'>Booking Details</p>
								<p>Guest: {booking.guestName}</p>
								<p>Phone: {booking.guestPhone}</p>
								<p>
									Tent: {booking.tentName} ({booking.tentCategory})
								</p>
								<p>
									Dates: {booking.startDate} - {booking.endDate}
								</p>
							</div>
							<div className='space-y-2'>
								<label className='font-medium text-sm'>Status</label>
								<Select value={status} onValueChange={setStatus}>
									<SelectTrigger>
										<SelectValue placeholder='Select status' />
									</SelectTrigger>
									<SelectContent>
										{statusOptions.map((option) => (
											<SelectItem key={option} value={option}>
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				)}
				<DrawerFooter>
					<Button
						variant={type === 'cancel' ? 'destructive' : 'default'}
						onClick={handleAction}
					>
						{type === 'checkin'
							? 'Check In'
							: type === 'modify'
							? 'Save Changes'
							: 'Cancel Booking'}
					</Button>
					<Button variant='outline' onClick={() => setOpen(false)}>
						Cancel
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export function BookingList() {
	const handleExport = () => {
		toast.success('Data exported successfully');
	};

	return (
		<div>
			<div className='flex justify-end mb-4'>
				<Button onClick={handleExport} variant='outline'>
					<Download className='mr-2 w-4 h-4' />
					Export Data
				</Button>
			</div>
			<div className='border rounded-md'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Booking ID</TableHead>
							<TableHead>Date Range</TableHead>
							<TableHead>Tent Details</TableHead>
							<TableHead>Guest Information</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className='text-right'>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{bookings.map((booking) => (
							<TableRow key={booking.id}>
								<TableCell className='font-medium'>{booking.id}</TableCell>
								<TableCell>
									{booking.startDate}
									<br />
									{booking.endDate}
								</TableCell>
								<TableCell>
									<div className='font-medium'>{booking.tentName}</div>
									<div className='text-muted-foreground text-sm'>
										{booking.tentCategory}
									</div>
								</TableCell>
								<TableCell>
									<div className='font-medium'>{booking.guestName}</div>
									<div className='text-muted-foreground text-sm'>
										{booking.guestPhone}
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant='secondary'
										className={getStatusColor(booking.status)}
									>
										{booking.status}
									</Badge>
								</TableCell>
								<TableCell className='text-right'>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' className='p-0 w-8 h-8'>
												<span className='sr-only'>Open menu</span>
												<MoreHorizontal className='w-4 h-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<ResponsiveDialog booking={booking} type='checkin'>
												<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
													Check-in Guest
												</DropdownMenuItem>
											</ResponsiveDialog>
											<ResponsiveDialog booking={booking} type='modify'>
												<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
													Modify Booking
												</DropdownMenuItem>
											</ResponsiveDialog>
											<ResponsiveDialog booking={booking} type='cancel'>
												<DropdownMenuItem
													onSelect={(e) => e.preventDefault()}
													className='text-red-600'
												>
													Cancel Booking
												</DropdownMenuItem>
											</ResponsiveDialog>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
