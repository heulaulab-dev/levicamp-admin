import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Download,
	ChevronLeft,
	ChevronRight,
	Search,
	Plus,
	Calendar,
} from 'lucide-react';
import { useBookings } from '@/hooks/bookings/use-bookings';
import BookingTable from '@/components/pages/booking-management/booking-table';
import { columns } from '@/components/pages/booking-management/booking-columns';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PaginationOptions } from '@/types/booking';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from '@/components/ui/pagination';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import { useId } from 'react';

import { ChevronFirst, ChevronLast } from 'lucide-react';
import { useExport } from '@/hooks/export/use-export';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import Link from 'next/link';

export function BookingManagementList() {
	const { getBookings, bookings, pagination } = useBookings();
	const { exportBookings, exportDailyGuestCount } = useExport();
	const initialFetchDone = useRef(false);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [categoryFilter, setCategoryFilter] = useState<string>('');
	const [dateRange, setDateRange] = useState<{
		startDate: Date | undefined;
		endDate: Date | undefined;
	}>({
		startDate: undefined,
		endDate: undefined,
	});
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
	const id = useId();

	// Debounce search to avoid too many API calls
	const searchTimeout = useRef<NodeJS.Timeout | null>(null);

	const fetchBookings = useCallback(
		(
			options?: PaginationOptions & {
				search?: string;
				status?: string;
				category?: string;
			},
		) => {
			const queryParams: PaginationOptions & {
				search?: string;
				status?: string;
				category?: string;
			} = {
				page: options?.page || currentPage,
				page_size: options?.page_size || pageSize,
				search: options?.search ?? searchQuery,
			};

			// Only include status if it's not "all"
			if (options?.status && options.status !== 'all') {
				queryParams.status = options.status;
			} else if (statusFilter && statusFilter !== 'all') {
				queryParams.status = statusFilter;
			}

			// Only include category if it's not "all"
			if (options?.category && options.category !== 'all') {
				queryParams.category = options.category;
			} else if (categoryFilter && categoryFilter !== 'all') {
				queryParams.category = categoryFilter;
			}

			getBookings(queryParams);
		},
		[
			currentPage,
			pageSize,
			searchQuery,
			statusFilter,
			categoryFilter,
			getBookings,
		],
	);

	// Single useEffect to handle all fetch triggers with proper dependency tracking
	useEffect(() => {
		// Skip the first render if we're just initializing state
		if (!initialFetchDone.current) {
			initialFetchDone.current = true;
			fetchBookings();
			return;
		}

		// Clear any existing timeout
		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current);
		}

		// Set a debounce timeout for all parameter changes
		searchTimeout.current = setTimeout(() => {
			fetchBookings();
		}, 500);

		return () => {
			if (searchTimeout.current) {
				clearTimeout(searchTimeout.current);
			}
		};
	}, [
		fetchBookings,
		currentPage,
		pageSize,
		searchQuery,
		statusFilter,
		categoryFilter,
	]);

	const handleExport = () => {
		const promise = () => {
			return exportBookings();
		};

		toast.promise(promise, {
			loading: 'Exporting booking data...',
			success: () => {
				return 'Bookings exported successfully';
			},
			error: 'Failed to export bookings',
		});
	};

	const handleDailyGuestExport = () => {
		if (!dateRange.startDate || !dateRange.endDate) {
			toast.error('Please select both start and end dates');
			return;
		}

		const startDateStr = format(dateRange.startDate, 'yyyy-MM-dd');
		const endDateStr = format(dateRange.endDate, 'yyyy-MM-dd');

		const promise = () => {
			return exportDailyGuestCount(startDateStr, endDateStr);
		};

		toast.promise(promise, {
			loading: 'Exporting daily guest count data...',
			success: () => {
				setIsDatePickerOpen(false);
				setDateRange({ startDate: undefined, endDate: undefined });
				return 'Daily guest count exported successfully';
			},
			error: 'Failed to export daily guest count',
		});
	};

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
		// fetchBookings is called by the useEffect
	};

	const handlePageSizeChange = (value: string) => {
		setPageSize(Number(value));
		setCurrentPage(1);
		// fetchBookings is called by the useEffect
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value);
		setCurrentPage(1);
		// fetchBookings is called by the useEffect
	};

	const handleCategoryFilterChange = (value: string) => {
		setCategoryFilter(value);
		setCurrentPage(1);
		// fetchBookings is called by the useEffect
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
		// fetchBookings is called by the useEffect
	};

	// Calculate total pages
	const totalPages = pagination?.totalPages || 0;

	return (
		<div>
			<div className='flex md:flex-row flex-col justify-between md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-4'>
				<div className='flex justify-between items-center gap-2 md:gap-4'>
					<div className='relative flex flex-1 items-center md:max-w-sm'>
						<Input
							placeholder='Search bookings...'
							value={searchQuery}
							onChange={handleSearchChange}
							className='pr-8'
						/>
						<Search className='top-2.5 right-3 absolute w-4 h-4 text-muted-foreground' />
					</div>

					<div className='flex items-center space-x-4'>
						<Select
							value={statusFilter}
							onValueChange={handleStatusFilterChange}
						>
							<SelectTrigger className='w-[180px]'>
								<SelectValue placeholder='All Statuses' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Statuses</SelectItem>
								<SelectItem value='pending'>Pending</SelectItem>
								<SelectItem value='confirmed'>Confirmed</SelectItem>
								<SelectItem value='checked_in'>Checked In</SelectItem>
								<SelectItem value='completed'>Completed</SelectItem>
								<SelectItem value='cancelled'>Cancelled</SelectItem>
								<SelectItem value='refund'>Refund</SelectItem>
								<SelectItem value='rescheduled'>Rescheduled</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={categoryFilter}
							onValueChange={handleCategoryFilterChange}
						>
							<SelectTrigger className='w-[180px]'>
								<SelectValue placeholder='All Categories' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								<SelectItem value='VIP'>VIP</SelectItem>
								<SelectItem value='Standard'>Standard</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className='flex flex-row gap-4'>
					<Button asChild>
						<Link href='/booking-management/add-booking'>
							<Plus className='mr-2 w-4 h-4' />
							Add Booking
						</Link>
					</Button>
					<Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
						<PopoverTrigger asChild>
							<Button variant={'outline'}>
								<Calendar className='mr-2 w-4 h-4' />
								Daily Guest Export
							</Button>
						</PopoverTrigger>
						<PopoverContent className='p-0 w-auto' align='end'>
							<div className='space-y-4 p-4'>
								<div className='space-y-2'>
									<h4 className='font-medium'>Select Date Range</h4>
									<p className='text-muted-foreground text-sm'>
										Choose start and end dates for guest count export
									</p>
								</div>
								<div className='gap-2 grid grid-cols-2'>
									<div className='space-y-2'>
										<Label className='text-xs'>Start Date</Label>
										<Button
											variant='outline'
											className={cn(
												'w-full justify-start text-left font-normal',
												!dateRange.startDate && 'text-muted-foreground',
											)}
											onClick={() => {
												// Open calendar for start date
											}}
										>
											{dateRange.startDate ? (
												format(dateRange.startDate, 'PPP')
											) : (
												<span>Pick start date</span>
											)}
										</Button>
									</div>
									<div className='space-y-2'>
										<Label className='text-xs'>End Date</Label>
										<Button
											variant='outline'
											className={cn(
												'w-full justify-start text-left font-normal',
												!dateRange.endDate && 'text-muted-foreground',
											)}
											onClick={() => {
												// Open calendar for end date
											}}
										>
											{dateRange.endDate ? (
												format(dateRange.endDate, 'PPP')
											) : (
												<span>Pick end date</span>
											)}
										</Button>
									</div>
								</div>
								<CalendarComponent
									mode='range'
									selected={{
										from: dateRange.startDate,
										to: dateRange.endDate,
									}}
									onSelect={(range) => {
										setDateRange({
											startDate: range?.from,
											endDate: range?.to,
										});
									}}
									numberOfMonths={2}
									className='border rounded-md'
								/>
								<div className='flex gap-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => {
											setDateRange({
												startDate: undefined,
												endDate: undefined,
											});
										}}
									>
										Clear
									</Button>
									<Button
										size='sm'
										onClick={handleDailyGuestExport}
										disabled={!dateRange.startDate || !dateRange.endDate}
									>
										Export Excel
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
					<Button onClick={handleExport} variant={'outline'}>
						<Download className='mr-2 w-4 h-4' />
						Export Data
					</Button>
				</div>
			</div>

			<div className='mb-2'>
				{pagination && (
					<p className='text-muted-foreground text-sm'>
						Showing {bookings.length} of {pagination.totalItems} bookings
					</p>
				)}
			</div>
			<BookingTable
				columns={columns}
				data={bookings}
				key={`data-table-${pageSize}`}
			/>

			{/* Pagination */}
			{pagination && (
				<div className='flex justify-between items-center gap-8 mt-4'>
					{/* Results per page */}
					<div className='flex items-center gap-3'>
						<Label htmlFor={id} className='max-sm:sr-only'>
							Rows per page
						</Label>
						<Select
							value={String(pageSize)}
							onValueChange={handlePageSizeChange}
						>
							<SelectTrigger id={id} className='w-fit whitespace-nowrap'>
								<SelectValue placeholder='Select number of results' />
							</SelectTrigger>
							<SelectContent className='[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto'>
								{[5, 10, 25, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={pageSize.toString()}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{/* Page number information */}
					<div className='flex justify-end text-muted-foreground text-sm whitespace-nowrap grow'>
						<p
							className='text-muted-foreground text-sm whitespace-nowrap'
							aria-live='polite'
						>
							<span className='text-foreground'>
								{currentPage}-{totalPages}
							</span>{' '}
							of <span className='text-foreground'>{totalPages}</span>
						</p>
					</div>
					{/* Pagination buttons */}
					<div>
						<Pagination>
							<PaginationContent>
								{/* First page button */}
								<PaginationItem>
									<Button
										size='icon'
										variant='outline'
										className='disabled:opacity-50 disabled:pointer-events-none'
										onClick={() => handlePageChange(1)}
										disabled={currentPage <= 1}
										aria-label='Go to first page'
									>
										<ChevronFirst
											size={16}
											strokeWidth={2}
											aria-hidden='true'
										/>
									</Button>
								</PaginationItem>
								{/* Previous page button */}
								<PaginationItem>
									<Button
										size='icon'
										variant='outline'
										className='disabled:opacity-50 disabled:pointer-events-none'
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage <= 1}
										aria-label='Go to previous page'
									>
										<ChevronLeft size={16} strokeWidth={2} aria-hidden='true' />
									</Button>
								</PaginationItem>
								{/* Next page button */}
								<PaginationItem>
									<Button
										size='icon'
										variant='outline'
										className='disabled:opacity-50 disabled:pointer-events-none'
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={currentPage >= totalPages}
										aria-label='Go to next page'
									>
										<ChevronRight
											size={16}
											strokeWidth={2}
											aria-hidden='true'
										/>
									</Button>
								</PaginationItem>
								{/* Last page button */}
								<PaginationItem>
									<Button
										size='icon'
										variant='outline'
										onClick={() => handlePageChange(totalPages)}
										disabled={currentPage >= totalPages}
										className='disabled:opacity-50 disabled:pointer-events-none'
										aria-label='Go to last page'
									>
										<ChevronLast size={16} strokeWidth={2} aria-hidden='true' />
									</Button>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				</div>
			)}
		</div>
	);
}
