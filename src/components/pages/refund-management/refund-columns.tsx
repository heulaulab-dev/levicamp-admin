import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Refund, RefundStatus } from '@/types/refund';
import { MoreHorizontal, CheckCircle } from 'lucide-react';
import RefundDialogDrawer from '@/components/pages/refund-management/refund-dialog-drawer';
import UpdateStatusDialog from '@/components/pages/refund-management/update-status-drawer';
import { useRefunds } from '@/hooks/refunds/useRefunds';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
// Status color mapping
const getStatusVariant = (
    status: RefundStatus,
): 'destructive' | 'secondary' | 'success' | 'default' | 'outline' => {
    switch (status) {
        case 'pending':
            return 'default';
        case 'processing':
            return 'secondary';
        case 'success':
            return 'success';
        case 'rejected':
            return 'destructive';
        default:
            return 'default';
    }
};

// Reusable badge component for consistent status display
const StatusBadge = ({ status }: { status: RefundStatus }) => (
    <Badge variant={getStatusVariant(status)}>{status}</Badge>
);

// Shared columns used across all views
export const sharedColumns: ColumnDef<Refund>[] = [
    {
        accessorKey: 'id',
        header: 'Request ID',
        cell: ({ row }) => <span>{row.original.id}</span>,
    },
    {
        accessorKey: 'date',
        header: 'Request Date',
        cell: ({ row }) => {
            // Convert ISO date string to YYYY-MM-DD format
            const date = new Date(row.original.date);
            return date.toISOString().split('T')[0]; // Gets YYYY-MM-DD part
        },
    },
    {
        accessorKey: 'amount',
        header: 'Refund Amount',
        cell: ({ row }) =>
            new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
            }).format(row.original.amount),
    },
    {
        accessorKey: 'refundMethod',
        header: 'Refund Method',
        cell: ({ row }) => <span>{row.original.refundMethod}</span>,
    },
    {
        accessorKey: 'refundReason',
        header: 'Refund Reason',
        cell: ({ row }) => <span>{row.original.reason}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
];

// Action dropdown component
const ActionsDropdown = ({ refund }: { refund: Refund }) => {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='p-0 w-8 h-8'>
                        <span className='sr-only'>Open menu</span>
                        <MoreHorizontal className='w-4 h-4' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <RefundDialogDrawer refund={refund}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            View Detail
                        </DropdownMenuItem>
                    </RefundDialogDrawer>
                    {refund.status === 'pending' && (
                        <UpdateStatusDialog refund={refund}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Update Status
                            </DropdownMenuItem>
                        </UpdateStatusDialog>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

// Complete Refund Button Component
const CompleteRefundButton = ({ refund }: { refund: Refund }) => {
    const { completeRefund, isLoading } = useRefunds();
    const [open, setOpen] = useState(false);

    const handleComplete = async () => {
        try {
            await completeRefund(refund.id);
            toast.success('Refund marked as completed successfully');
            setOpen(false);
        } catch (error) {
            console.error('Error completing refund:', error);
            toast.error('Failed to complete refund');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center'
                    disabled={isLoading}
                >
                    <CheckCircle className='mr-1 w-4 h-4' />
                    Complete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Refund</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to complete this refund? This action cannot be
                        undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='mt-4'>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='default'
                        onClick={handleComplete}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Columns for all refunds (default view)
export const allColumns: ColumnDef<Refund>[] = [
    ...sharedColumns,
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionsDropdown refund={row.original} />,
    },
];

// Columns for pending refunds
export const pendingColumns: ColumnDef<Refund>[] = allColumns;

// Columns for processing refunds
export const processingColumns: ColumnDef<Refund>[] = [
    ...sharedColumns,
    {
        id: 'completeAction',
        header: 'Complete',
        cell: ({ row }) => <CompleteRefundButton refund={row.original} />,
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionsDropdown refund={row.original} />,
    },
];

// Columns for rejected refunds
export const rejectedColumns: ColumnDef<Refund>[] = [
    ...sharedColumns,
    {
        accessorKey: 'updatedAt',
        header: 'Updated At',
        cell: ({ row }) => {
            // Convert ISO date string to YYYY-MM-DD format
            const date = new Date(row.original.refundedDate);
            return date.toISOString().split('T')[0]; // Gets YYYY-MM-DD part
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionsDropdown refund={row.original} />,
    },
];

// Columns for successful refunds
export const successColumns: ColumnDef<Refund>[] = [
    ...sharedColumns,
    {
        accessorKey: 'refundedDate',
        'header': 'Refunded Date',
        cell: ({ row }) => {
            // Convert ISO date string to YYYY-MM-DD format
            const date = new Date(row.original.refundedDate);
            return date.toISOString().split('T')[0]; // Gets YYYY-MM-DD part
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionsDropdown refund={row.original} />,
    },
];
