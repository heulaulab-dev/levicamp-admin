'use client';
import { cn } from '@/lib/utils';
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
	SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export default function TentsTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
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
		state: {
			sorting,
		},
	});

	return (
		<div className='border rounded-md overflow-auto'>
			<div className='w-full min-w-max'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className='hover:bg-transparent'>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} className='h-11'>
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
		</div>
	);
}
