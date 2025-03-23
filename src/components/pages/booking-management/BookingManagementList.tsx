import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useBookings } from '@/hooks/bookings/useBookings';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/app/(dashboard)/booking-management/columns';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PaginationOptions } from '@/types/booking';

// Loading skeleton for the booking list
function BookingListSkeleton() {
	return (
		<div>
			<div className='flex justify-end mb-4'>
				<Skeleton className='w-32 h-10' />
			</div>
			<div className='border rounded-md'>
				<div className='p-4'>
					<div className='space-y-3'>
						<Skeleton className='w-full h-10' />
						<Skeleton className='w-full h-32' />
					</div>
				</div>
			</div>
		</div>
	);
}

export function BookingManagementList() {
	const { getBookings, bookings, isLoading, pagination } = useBookings();
	const initialFetchDone = useRef(false);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string>('all');

	// Debounce search to avoid too many API calls
	const searchTimeout = useRef<NodeJS.Timeout | null>(null);

	const fetchBookings = (
		options?: PaginationOptions & { search?: string; status?: string },
	) => {
		const queryParams: PaginationOptions & {
			search?: string;
			status?: string;
		} = {
			page: options?.page || currentPage,
			per_page: options?.per_page || pageSize,
		};

		if (options?.search || searchQuery) {
			queryParams.search = options?.search || searchQuery;
		}

		// Only add status to params if it's not 'all'
		if (options?.status && options.status !== 'all') {
			queryParams.status = options.status;
		} else if (statusFilter && statusFilter !== 'all') {
			queryParams.status = statusFilter;
		}

		getBookings(queryParams);
	};

	// Fetch bookings when component mounts or pagination changes
	useEffect(() => {
		if (!initialFetchDone.current) {
			console.log('Initial bookings management list mount - fetching data');
			initialFetchDone.current = true;
		}

		fetchBookings();
	}, [getBookings, currentPage, pageSize, statusFilter]);

	// Handle search with debounce
	useEffect(() => {
		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current);
		}

		searchTimeout.current = setTimeout(() => {
			setCurrentPage(1); // Reset to first page on new search
			fetchBookings({ search: searchQuery });
		}, 500);

		return () => {
			if (searchTimeout.current) {
				clearTimeout(searchTimeout.current);
			}
		};
	}, [searchQuery]);

	const handleExport = () => {
		// In a real application, this would generate a CSV or Excel file
		toast.success('Data exported successfully');
	};

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

	const handlePageSizeChange = (value: string) => {
		setPageSize(Number(value));
		setCurrentPage(1); // Reset to first page when changing page size
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value);
		setCurrentPage(1); // Reset to first page when changing filter
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	// Show loading state
	if (isLoading && bookings.length === 0) {
		return <BookingListSkeleton />;
	}

	// Calculate total pages
	const totalPages = pagination ? Math.ceil(pagination.total / pageSize) : 1;

	return (
		<div>
			<div className='flex md:flex-row flex-col md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-4'>
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
					<Select value={statusFilter} onValueChange={handleStatusFilterChange}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='All Statuses' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Statuses</SelectItem>
							<SelectItem value='pending'>Pending</SelectItem>
							<SelectItem value='confirmed'>Confirmed</SelectItem>
							<SelectItem value='checked-in'>Checked In</SelectItem>
							<SelectItem value='completed'>Completed</SelectItem>
							<SelectItem value='cancelled'>Cancelled</SelectItem>
							<SelectItem value='refund'>Refund</SelectItem>
							<SelectItem value='rescheduled'>Rescheduled</SelectItem>
						</SelectContent>
					</Select>

					<Button onClick={handleExport} variant='outline'>
						<Download className='mr-2 w-4 h-4' />
						Export Data
					</Button>
				</div>
			</div>

			<div className='mb-2'>
				{pagination && (
					<p className='text-muted-foreground text-sm'>
						Showing {bookings.length} of {pagination.total} bookings
					</p>
				)}
			</div>

			<DataTable columns={columns} data={bookings} />

			{pagination && (
				<div className='flex justify-end items-center mt-4 px-2'>
					<div className='flex items-center space-x-6'>
						<div className='flex items-center space-x-2'>
							<p className='font-medium text-sm'>Rows per page</p>
							<Select
								value={String(pageSize)}
								onValueChange={handlePageSizeChange}
							>
								<SelectTrigger className='w-[70px] h-8'>
									<SelectValue placeholder={pageSize} />
								</SelectTrigger>
								<SelectContent side='top'>
									{[10, 20, 30, 50, 100].map((size) => (
										<SelectItem key={size} value={String(size)}>
											{size}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className='flex justify-center items-center w-[100px] font-medium text-sm'>
							Page {currentPage} of {totalPages}
						</div>
						<div className='flex items-center space-x-2'>
							<Button
								variant='outline'
								className='p-0 w-8 h-8'
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage <= 1}
							>
								<span className='sr-only'>Go to previous page</span>
								<ChevronLeft className='w-4 h-4' />
							</Button>
							<Button
								variant='outline'
								className='p-0 w-8 h-8'
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage >= totalPages}
							>
								<span className='sr-only'>Go to next page</span>
								<ChevronRight className='w-4 h-4' />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
