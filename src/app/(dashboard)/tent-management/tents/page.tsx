/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTentStore } from '@/hooks/tents/useTents';
import { Dialog } from '@/components/ui/dialog';
import { AddTentForm } from '@/components/pages/tent-management/tents/AddTentForm';
import { PageHeader } from '@/components/common/page-header';
import TentsTable from '@/components/pages/tent-management/tents/tents-table';
import { columns } from '@/components/pages/tent-management/tents/tents-columns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TentPaginationOptions } from '@/types/tent';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from '@/components/ui/pagination';
import { Label } from '@/components/ui/label';
import { useId } from 'react';
import { ChevronFirst, ChevronLast } from 'lucide-react';

export default function TentsPage() {
	const {
		tents,
		getTents,
		pagination,
		isLoading,
		resetForm,
		isCreateOpen,
		setIsCreateOpen,
	} = useTentStore();

	const initialFetchDone = useRef(false);
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [categoryFilter, setCategoryFilter] = useState<string>('');
	const [sortField, setSortField] = useState<string>('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const id = useId();

	// Debounce search to avoid too many API calls
	const searchTimeout = useRef<NodeJS.Timeout | null>(null);

	const fetchTents = useCallback(
		(
			options?: TentPaginationOptions & {
				search?: string;
				status?: string;
				category?: string;
				sort?: string;
				order?: 'asc' | 'desc';
			},
		) => {
			const queryParams: TentPaginationOptions = {
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

			// Include sort options
			if (options?.sort ?? sortField) {
				queryParams.sort = options?.sort ?? sortField;
				queryParams.order = options?.order ?? sortOrder;
			}

			getTents(queryParams);
		},
		[
			currentPage,
			pageSize,
			searchQuery,
			statusFilter,
			categoryFilter,
			sortField,
			sortOrder,
			getTents,
		],
	);

	// Single useEffect to handle all fetch triggers with proper dependency tracking
	useEffect(() => {
		// Skip the first render if we're just initializing state
		if (!initialFetchDone.current) {
			initialFetchDone.current = true;
			fetchTents();
			return;
		}

		// Clear any existing timeout
		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current);
		}

		// Set a debounce timeout for all parameter changes
		searchTimeout.current = setTimeout(() => {
			fetchTents();
		}, 500);

		return () => {
			if (searchTimeout.current) {
				clearTimeout(searchTimeout.current);
			}
		};
	}, [
		fetchTents,
		currentPage,
		pageSize,
		searchQuery,
		statusFilter,
		categoryFilter,
		sortField,
		sortOrder,
	]);

	const handleOpenCreateModal = () => {
		resetForm();
		setIsCreateOpen(true);
	};

	const handleRefresh = useCallback(async () => {
		await fetchTents(); // Force refresh
	}, [fetchTents]);

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

	const handlePageSizeChange = (value: string) => {
		setPageSize(Number(value));
		setCurrentPage(1);
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value);
		setCurrentPage(1);
	};

	const handleCategoryFilterChange = (value: string) => {
		setCategoryFilter(value);
		setCurrentPage(1);
	};

	const handleSortChange = (value: string) => {
		setSortField(value);
		setCurrentPage(1);
	};

	const handleOrderChange = (value: 'asc' | 'desc') => {
		setSortOrder(value);
		setCurrentPage(1);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	// Calculate total pages
	const totalPages = pagination?.totalPages || 0;

	return (
		<div className='mx-auto py-10 container'>
			<PageHeader
				title='Tent List'
				buttonLabel='Add Tent'
				onButtonClick={handleOpenCreateModal}
				onRefresh={handleRefresh}
				isLoading={isLoading}
			/>

			{/* Filters and Search */}
			<div className='flex md:flex-row flex-col justify-between md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-4'>
				<div className='flex justify-between items-center gap-2 md:gap-4'>
					<div className='relative flex flex-1 items-center md:max-w-sm'>
						<Input
							placeholder='Search tents...'
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
								<SelectItem value='available'>Available</SelectItem>
								<SelectItem value='unavailable'>Unavailable</SelectItem>
								<SelectItem value='maintenance'>Maintenance</SelectItem>
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
						<Select value={sortField} onValueChange={handleSortChange}>
							<SelectTrigger className='w-[180px]'>
								<SelectValue placeholder='Sort by' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value=''>No Sort</SelectItem>
								<SelectItem value='name'>Name</SelectItem>
								<SelectItem value='status'>Status</SelectItem>
								<SelectItem value='category'>Category</SelectItem>
								<SelectItem value='weekday_price'>Weekday Price</SelectItem>
								<SelectItem value='weekend_price'>Weekend Price</SelectItem>
								<SelectItem value='created_at'>Created Date</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={sortOrder}
							onValueChange={handleOrderChange}
							disabled={!sortField}
						>
							<SelectTrigger className='w-[120px]'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='asc'>Ascending</SelectItem>
								<SelectItem value='desc'>Descending</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className='mb-2'>
				{pagination && (
					<p className='text-muted-foreground text-sm'>
						Showing {tents.length} of {pagination.totalItems} tents
					</p>
				)}
			</div>

			<TentsTable
				columns={columns}
				data={tents}
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

			<Dialog modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<AddTentForm />
			</Dialog>
		</div>
	);
}
