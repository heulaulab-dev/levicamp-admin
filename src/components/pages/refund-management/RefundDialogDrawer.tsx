import { DialogHeader } from '@/components/ui/dialog';
import {
	DrawerTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
} from '@/components/ui/dialog';
import { Drawer } from '@/components/ui/drawer';
import { Refund } from '@/types';
import RefundDetails from '@/components/pages/refund-management/RefundDetails';

export default function RefundDialogDrawer({
	children,
	refund,
}: {
	children: React.ReactNode;
	refund: Refund;
}) {
	const isDesktop = useMediaQuery('(min-width: 768px)');

	if (isDesktop) {
		return (
			<Dialog>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Refund Details</DialogTitle>
					</DialogHeader>
					<RefundDetails refund={refund} />
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Refund Details</DrawerTitle>
				</DrawerHeader>
				<div className='px-4 pb-4'>
					<RefundDetails refund={refund} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
