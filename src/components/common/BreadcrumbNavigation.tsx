'use client';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import React from 'react';

export function BreadcrumbNavigation() {
	const pathname = usePathname();

	// Create breadcrumb segments from pathname
	const pathSegments = pathname.split('/').filter(Boolean);

	// Generate breadcrumb items with proper paths
	const breadcrumbItems = pathSegments.map((segment, index) => {
		const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
		const name =
			segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
		return { name, href };
	});

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbItems.map((item, index) => (
					<React.Fragment key={item.href}>
						{index > 0 && <BreadcrumbSeparator className='hidden md:block' />}
						<BreadcrumbItem className='hidden md:block'>
							{index === 0 || index === breadcrumbItems.length - 1 ? (
								<BreadcrumbPage>{item.name}</BreadcrumbPage>
							) : (
								<BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</React.Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
