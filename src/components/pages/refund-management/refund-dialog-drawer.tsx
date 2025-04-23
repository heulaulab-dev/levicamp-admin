import { useRef, useState, useEffect } from 'react';
import { useRefunds } from '@/hooks/refunds/useRefunds';
import { Button } from '@/components/ui/button';
import {
	DrawerTitle,
	DrawerDescription,
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTrigger,
} from '@/components/ui/drawer';
import {
	RefundDetailItem,
	Refund,
	getRefundPaymentProof,
	getRefundRejectReason,
} from '@/types/refund';
import { Loader2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RefundDialogDrawerProps {
	refund: Refund;
	children: React.ReactNode;
}

const RefundDialogDrawer = ({ refund, children }: RefundDialogDrawerProps) => {
	const [open, setOpen] = useState(false);
	const [detailedRefund, setDetailedRefund] = useState<RefundDetailItem | null>(
		null,
	);
	const { getRefundById, isLoading } = useRefunds();
	const triggerRef = useRef<HTMLButtonElement>(null);

	const isDesktop = useMediaQuery('(min-width: 768px)');

	// Fetch detailed refund info when drawer opens
	useEffect(() => {
		if (open && refund.id) {
			const fetchRefundDetails = async () => {
				try {
					const details = await getRefundById(refund.id);
					setDetailedRefund(details);
				} catch (error) {
					console.error('Failed to fetch refund details:', error);
				}
			};

			fetchRefundDetails();
		}
	}, [open, refund.id, getRefundById]);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger ref={triggerRef} asChild>
					{children}
				</DialogTrigger>
				<DialogContent className='px-6 py-4'>
					<DialogHeader>
						<DialogTitle>Refund Details</DialogTitle>
						<DialogDescription>Refund Information Detail</DialogDescription>
					</DialogHeader>
					{isLoading ? (
						<div className='flex justify-center items-center py-10'>
							<Loader2 className='w-8 h-8 text-primary animate-spin' />
						</div>
					) : detailedRefund ? (
						<ScrollArea className='h-[500px]'>
							<div className='space-y-6'>
								<div className='gap-4 grid grid-cols-1 md:grid-cols-1'>
									<div className='space-y-2'>
										<Label htmlFor='requestId'>Request ID</Label>
										<Input
											id='requestId'
											value={detailedRefund.id}
											disabled
											readOnly
										/>
									</div>
									<div className='flex-col space-y-2'>
										<Label htmlFor='status'>Status</Label>
										<div>
											<Badge
												variant='secondary'
												className={
													detailedRefund.status === 'pending'
														? 'bg-orange-100 text-orange-700'
														: detailedRefund.status === 'rejected'
														? 'bg-red-100 text-red-700'
														: 'bg-green-100 text-green-700'
												}
											>
												{detailedRefund.status}
											</Badge>
										</div>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='guestName'>Guest Name</Label>
										<Input
											id='guestName'
											value={
												detailedRefund.booking?.guest?.name || 'Not Available'
											}
											disabled
											readOnly
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='amount'>Amount</Label>
										<Input
											id='amount'
											value={new Intl.NumberFormat('id-ID', {
												style: 'currency',
												currency: 'IDR',
											}).format(detailedRefund.refund_amount)}
											disabled
											readOnly
											className='text-muted-foreground'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='reason'>Reason</Label>
										<Input
											id='reason'
											value={detailedRefund.reason || 'No reason provided'}
											disabled
											readOnly
											className='text-muted-foreground'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='requestDate'>Request Date</Label>
										<Input
											id='requestDate'
											value={new Date(
												detailedRefund.created_at,
											).toLocaleDateString()}
											disabled
											readOnly
											className='text-muted-foreground'
										/>
									</div>

									{detailedRefund.status === 'rejected' && (
										<div className='space-y-2'>
											<Label htmlFor='rejectionReason'>Rejection Reason</Label>
											<Input
												id='rejectionReason'
												value={
													getRefundRejectReason(detailedRefund) ||
													'No rejection reason provided'
												}
												disabled
												readOnly
												className='text-muted-foreground'
											/>
										</div>
									)}

									{detailedRefund.status === 'success' && (
										<>
											<div className='space-y-2'>
												<Label htmlFor='completionDate'>Completion Date</Label>
												<Input
													id='completionDate'
													value={
														detailedRefund.updated_at
															? new Date(
																	detailedRefund.updated_at,
															  ).toLocaleDateString()
															: 'Not available'
													}
													disabled
													readOnly
													className='text-muted-foreground'
												/>
											</div>
											<div className='space-y-2'>
												<Label htmlFor='paymentProof'>Payment Proof</Label>
												{getRefundPaymentProof(detailedRefund) ? (
													<div className='mt-1'>
														<div className='relative w-full h-60'>
															<Image
																src={getRefundPaymentProof(detailedRefund)!}
																alt='Payment Proof'
																fill
																className='hover:opacity-90 rounded-md object-contain transition-opacity cursor-pointer'
																onClick={() =>
																	window.open(
																		getRefundPaymentProof(detailedRefund),
																		'_blank',
																	)
																}
															/>
														</div>
														<p className='mt-1 text-muted-foreground text-xs'>
															Click image to view full size
														</p>
													</div>
												) : (
													<p className='text-muted-foreground'>
														No payment proof available
													</p>
												)}
											</div>
										</>
									)}

									{detailedRefund.refund_method && (
										<div className='space-y-2'>
											<Label htmlFor='refundMethod'>Refund Method</Label>
											<Input
												id='refundMethod'
												value={detailedRefund.refund_method}
												disabled
												readOnly
												className='text-muted-foreground'
											/>
										</div>
									)}

									{detailedRefund.account_name && (
										<div className='space-y-2'>
											<Label htmlFor='accountName'>Account Name</Label>
											<Input
												id='accountName'
												value={detailedRefund.account_name}
												disabled
												readOnly
												className='text-muted-foreground'
											/>
										</div>
									)}

									{detailedRefund.account_number && (
										<div className='space-y-2'>
											<Label htmlFor='accountNumber'>Account Number</Label>
											<Input
												id='accountNumber'
												value={detailedRefund.account_number}
												disabled
												readOnly
												className='text-muted-foreground'
											/>
										</div>
									)}
								</div>

								{detailedRefund.responses &&
									Array.isArray(detailedRefund.responses) &&
									detailedRefund.responses.length > 0 && (
										<div className='mt-6'>
											<Label className='text-base'>Response History</Label>
											<div className='space-y-4 mt-2'>
												{detailedRefund.responses.map((response, index) => (
													<div key={index} className='bg-muted p-3 rounded-md'>
														<div className='flex justify-between mb-1'>
															<span className='font-medium'>
																{response.action}
															</span>
															<span className='text-muted-foreground text-sm'>
																{new Date(response.created_at).toLocaleString()}
															</span>
														</div>
														{response.additional_info && (
															<p className='text-sm'>
																{response.additional_info}
															</p>
														)}
													</div>
												))}
											</div>
										</div>
									)}
							</div>
						</ScrollArea>
					) : (
						<div className='py-10 text-muted-foreground text-center'>
							Failed to load refund details
						</div>
					)}
					<div className='flex justify-end mt-4'>
						<Button variant='outline' onClick={() => setOpen(false)}>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger ref={triggerRef} asChild>
				{children}
			</DrawerTrigger>
			<DrawerContent className='px-6 py-4'>
				<DrawerHeader>
					<DrawerTitle>Refund Details</DrawerTitle>
					<DrawerDescription>Refund Information Detail</DrawerDescription>
				</DrawerHeader>

				{isLoading ? (
					<div className='flex justify-center items-center py-10'>
						<Loader2 className='w-8 h-8 text-primary animate-spin' />
					</div>
				) : detailedRefund ? (
					<div className='space-y-6'>
						<div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
							<div className='space-y-2'>
								<Label htmlFor='drawer-requestId'>Request ID</Label>
								<Input
									id='drawer-requestId'
									value={detailedRefund.id}
									disabled
									readOnly
									className='text-muted-foreground'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='drawer-status'>Status</Label>
								<div>
									<Badge
										variant='secondary'
										className={
											detailedRefund.status === 'pending'
												? 'bg-orange-100 text-orange-700'
												: detailedRefund.status === 'rejected'
												? 'bg-red-100 text-red-700'
												: 'bg-green-100 text-green-700'
										}
									>
										{detailedRefund.status}
									</Badge>
								</div>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='drawer-guestName'>Guest Name</Label>
								<Input
									id='drawer-guestName'
									value={detailedRefund.booking?.guest?.name || 'Not available'}
									disabled
									readOnly
									className='text-muted-foreground'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='drawer-amount'>Amount</Label>
								<Input
									id='drawer-amount'
									value={new Intl.NumberFormat('id-ID', {
										style: 'currency',
										currency: 'IDR',
									}).format(detailedRefund.refund_amount)}
									disabled
									readOnly
									className='text-muted-foreground'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='drawer-reason'>Reason</Label>
								<Input
									id='drawer-reason'
									value={detailedRefund.reason || 'No reason provided'}
									disabled
									readOnly
									className='text-muted-foreground'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='drawer-requestDate'>Request Date</Label>
								<Input
									id='drawer-requestDate'
									value={new Date(
										detailedRefund.created_at,
									).toLocaleDateString()}
									disabled
									readOnly
									className='text-muted-foreground'
								/>
							</div>

							{detailedRefund.status === 'rejected' && (
								<div className='space-y-2'>
									<Label htmlFor='drawer-rejectionReason'>
										Rejection Reason
									</Label>
									<Input
										id='drawer-rejectionReason'
										value={
											getRefundRejectReason(detailedRefund) ||
											'No rejection reason provided'
										}
										disabled
										readOnly
										className='text-muted-foreground'
									/>
								</div>
							)}

							{detailedRefund.status === 'success' && (
								<>
									<div className='space-y-2'>
										<Label htmlFor='drawer-completionDate'>
											Completion Date
										</Label>
										<Input
											id='drawer-completionDate'
											value={
												detailedRefund.updated_at
													? new Date(
															detailedRefund.updated_at,
													  ).toLocaleDateString()
													: 'Not available'
											}
											disabled
											readOnly
											className='text-muted-foreground'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='drawer-paymentProof'>Payment Proof</Label>
										{getRefundPaymentProof(detailedRefund) ? (
											<div className='mt-1'>
												<div className='relative w-full h-60'>
													<Image
														src={getRefundPaymentProof(detailedRefund)!}
														alt='Payment Proof'
														fill
														className='hover:opacity-90 rounded-md object-contain transition-opacity cursor-pointer'
														onClick={() =>
															window.open(
																getRefundPaymentProof(detailedRefund),
																'_blank',
															)
														}
													/>
												</div>
												<p className='mt-1 text-muted-foreground text-xs'>
													Click image to view full size
												</p>
											</div>
										) : (
											<p className='text-muted-foreground'>
												No payment proof available
											</p>
										)}
									</div>
								</>
							)}

							{detailedRefund.refund_method && (
								<div className='space-y-2'>
									<Label htmlFor='drawer-refundMethod'>Refund Method</Label>
									<Input
										id='drawer-refundMethod'
										value={detailedRefund.refund_method}
										disabled
										readOnly
										className='text-muted-foreground'
									/>
								</div>
							)}

							{detailedRefund.account_name && (
								<div className='space-y-2'>
									<Label htmlFor='drawer-accountName'>Account Name</Label>
									<Input
										id='drawer-accountName'
										value={detailedRefund.account_name}
										disabled
										readOnly
										className='text-muted-foreground'
									/>
								</div>
							)}

							{detailedRefund.account_number && (
								<div className='space-y-2'>
									<Label htmlFor='drawer-accountNumber'>Account Number</Label>
									<Input
										id='drawer-accountNumber'
										value={detailedRefund.account_number}
										disabled
										readOnly
										className='text-muted-foreground'
									/>
								</div>
							)}
						</div>

						{detailedRefund.responses &&
							Array.isArray(detailedRefund.responses) &&
							detailedRefund.responses.length > 0 && (
								<div className='mt-6'>
									<Label htmlFor='drawer-responseHistory' className='text-base'>
										Response History
									</Label>
									<div className='space-y-4 mt-2'>
										{detailedRefund.responses.map((response, index) => (
											<div key={index} className='bg-muted p-3 rounded-md'>
												<div className='flex justify-between mb-1'>
													<span className='font-medium'>{response.action}</span>
													<span className='text-muted-foreground text-sm'>
														{new Date(response.created_at).toLocaleString()}
													</span>
												</div>
												{response.additional_info && (
													<p className='text-sm'>{response.additional_info}</p>
												)}
											</div>
										))}
									</div>
								</div>
							)}

						<div className='flex justify-end mt-4'>
							<Button variant='outline' onClick={() => setOpen(false)}>
								Close
							</Button>
						</div>
					</div>
				) : (
					<div className='py-10 text-muted-foreground text-center'>
						Failed to load refund details
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
};

export default RefundDialogDrawer;
