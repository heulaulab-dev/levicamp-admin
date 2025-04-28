'use client';

import * as React from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';

export function MobileDetectionDialog() {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const isMobile = useIsMobile();

	React.useEffect(() => {
		// Only show dialog on mobile devices
		if (isMobile) {
			setOpen(true);
		}
	}, [isMobile]);

	const handleClose = () => {
		setOpen(false);
	};

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<div className='flex justify-between items-center'>
							<DialogTitle className='font-bold text-xl'>
								Website lebih nyaman jika diakses di desktop
							</DialogTitle>
						</div>
						<DialogDescription className='pt-2 text-base'>
							Tampilannya lebih enak dilihat dan fiturnya lebih mudah dipakai
							jika kamu buka di desktop, lho!
						</DialogDescription>
					</DialogHeader>
					<MobileDialogContent />
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerContent>
				<DrawerHeader>
					<div className='flex justify-between items-center'>
						<DrawerTitle className='font-bold text-xl text-center'>
							Levi Camp Admin lebih nyaman jika diakses di desktop!
						</DrawerTitle>
					</div>
					<DrawerDescription className='pt-2 text-base text-center'>
						Tampilannya lebih enak dilihat dan fiturnya lebih mudah dipakai jika
						kamu buka di desktop, lho!
					</DrawerDescription>
				</DrawerHeader>
				<MobileDialogContent className='px-4' />
				<DrawerFooter className='pt-2'>
					<DrawerClose asChild>
						<Button variant='outline' className='w-full' onClick={handleClose}>
							Tetap Buka di Perangkat Ini
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function MobileDialogContent({ className }: React.ComponentProps<'div'>) {
	return (
		<div className={className}>
			{/* Desktop Preview Image */}
			<div className='mb-6 p-4 rounded-lg overflow-hidden'>
				<Image
					src='/placeholder.svg'
					alt='Desktop Version Preview'
					width={600}
					height={400}
					className='border border-white/10 rounded-lg'
				/>
			</div>

			{/* URL Section */}
			<div className='bg-muted mb-6 p-4 rounded-lg text-center'>
				<p className='mb-1 text-muted-foreground text-sm'>
					Yuk, buka alamat ini dari browser desktop-mu:
				</p>
				<Link href='https://admin.levicamp.id' passHref>
					<p className='font-medium text-lg'>admin.levicamp.id</p>
				</Link>
			</div>

			{/* Desktop-only button (Dialog version) */}
			{typeof window !== 'undefined' && window.innerWidth >= 768 && (
				<Button
					variant='outline'
					className='mb-6 w-full'
					onClick={() => document.dispatchEvent(new Event('close-dialog'))}
				>
					Tetap Buka di Perangkat Ini
				</Button>
			)}

			{/* Tip section */}
			<div className='flex items-center gap-2 bg-muted/50 mb-6 p-4 rounded-lg'>
				<div className='bg-yellow-100 p-2 rounded-full'>💡</div>
				<p className='text-muted-foreground text-sm'>
					Kelola reservasi dan perbarui ketersediaan tenda dengan lebih praktis
					menggunakan versi desktop.
				</p>
			</div>
		</div>
	);
}
