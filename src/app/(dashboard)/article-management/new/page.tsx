'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useArticleStore } from '@/hooks/article/useArticle';
import { ArticleForm } from '@/components/pages/article-management/ArticleForm';

export default function NewArticlePage() {
	const { createArticle, setFormData, resetForm } = useArticleStore();
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (data: Record<string, unknown>) => {
		setLoading(true);
		// Convert tags from comma string to array
		if (typeof data.tags === 'string') {
			data.tags = data.tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean);
		}
		setFormData(data);
		const success = await createArticle();
		setLoading(false);
		if (success) {
			resetForm();
			router.push('/article-management');
		}
	};

	return (
		<div className='space-y-6 p-6'>
			<div className='mb-6'>
				<h1 className='mb-2 font-bold text-2xl'>Article Editor</h1>
				<p className='text-muted-foreground'>
					Create or edit article with rich text content
				</p>
			</div>
			<div className='max-w-4xl'>
				<ArticleForm
					mode='create'
					onSubmit={handleSubmit}
					onCancel={() => router.push('/article-management')}
					loading={loading}
				/>
			</div>
		</div>
	);
}
 