'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
} from '@/components/ui/pagination';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	ColumnDef,
	PaginationState,
	SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import {
	ChevronDown,
	ChevronFirst,
	ChevronLast,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
} from 'lucide-react';
import { useId, useState } from 'react';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export default function AdminTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const id = useId();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'name',
			desc: false,
		},
	]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		enableSortingRemoval: false,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			sorting,
			pagination,
		},
	});

	return (
		<div className='space-y-4'>
			<div className='bg-background border border-border rounded-lg overflow-hidden'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className='hover:bg-transparent'>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											style={{ width: `${header.getSize()}px` }}
											className='h-11'
										>
											{header.isPlaceholder ? null : header.column.getCanSort() ? (
												<div
													className={cn(
														header.column.getCanSort() &&
															'flex h-full cursor-pointer select-none items-center justify-between gap-2',
													)}
													onClick={header.column.getToggleSortingHandler()}
													onKeyDown={(e) => {
														// Enhanced keyboard handling for sorting
														if (
															header.column.getCanSort() &&
															(e.key === 'Enter' || e.key === ' ')
														) {
															e.preventDefault();
															header.column.getToggleSortingHandler()?.(e);
														}
													}}
													tabIndex={header.column.getCanSort() ? 0 : undefined}
												>
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
													{{
														asc: (
															<ChevronUp
																className='opacity-60 shrink-0'
																size={16}
																strokeWidth={2}
																aria-hidden='true'
															/>
														),
														desc: (
															<ChevronDown
																className='opacity-60 shrink-0'
																size={16}
																strokeWidth={2}
																aria-hidden='true'
															/>
														),
													}[header.column.getIsSorted() as string] ?? null}
												</div>
											) : (
												flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className='h-24'>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className='h-24 text-center'
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className='flex justify-between items-center gap-8'>
				{/* Results per page */}
				<div className='flex items-center gap-3'>
					<Label htmlFor={id} className='max-sm:sr-only'>
						Rows per page
					</Label>
					<Select
						value={table.getState().pagination.pageSize.toString()}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
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
							{table.getState().pagination.pageIndex *
								table.getState().pagination.pageSize +
								1}
							-
							{Math.min(
								Math.max(
									table.getState().pagination.pageIndex *
										table.getState().pagination.pageSize +
										table.getState().pagination.pageSize,
									0,
								),
								table.getRowCount(),
							)}
						</span>{' '}
						of{' '}
						<span className='text-foreground'>
							{table.getRowCount().toString()}
						</span>
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
									onClick={() => table.firstPage()}
									disabled={!table.getCanPreviousPage()}
									aria-label='Go to first page'
								>
									<ChevronFirst size={16} strokeWidth={2} aria-hidden='true' />
								</Button>
							</PaginationItem>
							{/* Previous page button */}
							<PaginationItem>
								<Button
									size='icon'
									variant='outline'
									className='disabled:opacity-50 disabled:pointer-events-none'
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}
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
									onClick={() => table.nextPage()}
									disabled={!table.getCanNextPage()}
									aria-label='Go to next page'
								>
									<ChevronRight size={16} strokeWidth={2} aria-hidden='true' />
								</Button>
							</PaginationItem>
							{/* Last page button */}
							<PaginationItem>
								<Button
									size='icon'
									variant='outline'
									className='disabled:opacity-50 disabled:pointer-events-none'
									onClick={() => table.lastPage()}
									disabled={!table.getCanNextPage()}
									aria-label='Go to last page'
								>
									<ChevronLast size={16} strokeWidth={2} aria-hidden='true' />
								</Button>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</div>
		</div>
	);
}
