import { Suspense } from 'react';
import EditArticleContent from './EditArticleContent';

export default function EditArticlePage({
	params,
}: {
	params: { id: string };
}) {
	return (
		<Suspense
			fallback={
				<div className='space-y-6 p-6'>
					<div className='mb-6'>
						<h1 className='mb-2 font-bold text-2xl'>Article Editor</h1>
						<p className='text-muted-foreground'>Loading article...</p>
					</div>
				</div>
			}
		>
			<EditArticleContent id={params.id} />
		</Suspense>
	);
}
