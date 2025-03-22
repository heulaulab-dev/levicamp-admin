import { useRef, useState, useEffect } from 'react';
import { useRefunds } from '@/hooks/refunds/useRefunds';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
	RefundDetailItem,
	Refund,
	getRefundPaymentProof,
	getRefundRejectReason,
} from '@/types/refund';
import { Loader2 } from 'lucide-react';

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

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger ref={triggerRef} asChild>
				{children}
			</DrawerTrigger>
			<DrawerContent className='px-6 py-4'>
				<div className='mx-auto max-w-3xl'>
					<h2 className='mb-6 font-semibold text-xl'>Refund Details</h2>

					{isLoading ? (
						<div className='flex justify-center items-center py-10'>
							<Loader2 className='w-8 h-8 text-primary animate-spin' />
						</div>
					) : detailedRefund ? (
						<div className='space-y-6'>
							<div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
								<div className='space-y-2'>
									<h3 className='font-medium text-muted-foreground text-sm'>
										Request ID
									</h3>
									<p>{detailedRefund.id}</p>
								</div>
								<div className='space-y-2'>
									<h3 className='font-medium text-muted-foreground text-sm'>
										Status
									</h3>
									<p className='capitalize'>{detailedRefund.status}</p>
								</div>
								<div className='space-y-2'>
									<h3 className='font-medium text-muted-foreground text-sm'>
										Guest Name
									</h3>
									<p>
										{detailedRefund.booking?.guest?.name || 'Not available'}
									</p>
								</div>
								<div className='space-y-2'>
									<h3 className='font-medium text-muted-foreground text-sm'>
										Amount
									</h3>
									<p>
										{new Intl.NumberFormat('id-ID', {
											style: 'currency',
											currency: 'IDR',
										}).format(detailedRefund.refund_amount)}
									</p>
								</div>
								<div className='space-y-2'>
									<h3 className='font-medium text-muted-foreground text-sm'>
										Reason
									</h3>
									<p>{detailedRefund.reason || 'No reason provided'}</p>
								</div>
								<div className='space-y-2'>
									<h3 className='font-medium text-muted-foreground text-sm'>
										Request Date
									</h3>
									<p>
										{new Date(detailedRefund.created_at).toLocaleDateString()}
									</p>
								</div>

								{detailedRefund.status === 'rejected' && (
									<div className='space-y-2'>
										<h3 className='font-medium text-muted-foreground text-sm'>
											Rejection Reason
										</h3>
										<p>
											{getRefundRejectReason(detailedRefund) ||
												'No rejection reason provided'}
										</p>
									</div>
								)}

								{detailedRefund.status === 'success' && (
									<>
										<div className='space-y-2'>
											<h3 className='font-medium text-muted-foreground text-sm'>
												Completion Date
											</h3>
											<p>
												{detailedRefund.updated_at
													? new Date(
															detailedRefund.updated_at,
													  ).toLocaleDateString()
													: 'Not available'}
											</p>
										</div>
										<div className='space-y-2'>
											<h3 className='font-medium text-muted-foreground text-sm'>
												Payment Proof
											</h3>
											{getRefundPaymentProof(detailedRefund) ? (
												<div className='mt-1'>
													<img
														src={getRefundPaymentProof(detailedRefund)}
														alt='Payment Proof'
														className='hover:opacity-90 rounded-md max-h-60 transition-opacity cursor-pointer'
														onClick={() =>
															window.open(
																getRefundPaymentProof(detailedRefund),
																'_blank',
															)
														}
													/>
													<p className='mt-1 text-muted-foreground text-xs'>
														Click image to view full size
													</p>
												</div>
											) : (
												<p>No payment proof available</p>
											)}
										</div>
									</>
								)}

								{detailedRefund.refund_method && (
									<div className='space-y-2'>
										<h3 className='font-medium text-muted-foreground text-sm'>
											Refund Method
										</h3>
										<p>{detailedRefund.refund_method}</p>
									</div>
								)}

								{detailedRefund.account_name && (
									<div className='space-y-2'>
										<h3 className='font-medium text-muted-foreground text-sm'>
											Account Name
										</h3>
										<p>{detailedRefund.account_name}</p>
									</div>
								)}

								{detailedRefund.account_number && (
									<div className='space-y-2'>
										<h3 className='font-medium text-muted-foreground text-sm'>
											Account Number
										</h3>
										<p>{detailedRefund.account_number}</p>
									</div>
								)}
							</div>

							{detailedRefund.responses &&
								Array.isArray(detailedRefund.responses) &&
								detailedRefund.responses.length > 0 && (
									<div className='mt-6'>
										<h3 className='mb-3 font-medium text-lg'>
											Response History
										</h3>
										<div className='space-y-4'>
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
					) : (
						<div className='py-10 text-muted-foreground text-center'>
							Failed to load refund details
						</div>
					)}

					<div className='flex justify-end mt-8'>
						<Button variant='outline' onClick={() => setOpen(false)}>
							Close
						</Button>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export default RefundDialogDrawer;
