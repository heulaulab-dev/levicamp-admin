'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useArticleStore } from '@/hooks/article/useArticle';
import { ArticleForm } from '@/components/pages/article-management/ArticleForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditArticleContentProps {
	id: string;
}

export default function EditArticleContent({ id }: EditArticleContentProps) {
	const {
		getArticleById,
		updateArticle,
		setFormData,
		resetForm,
		selectedArticle,
		setSelectedArticle,
	} = useArticleStore();
	const [loading, setLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const fetchArticle = async () => {
			setIsLoading(true);
			const parsedId = parseInt(id);
			if (isNaN(parsedId)) {
				router.push('/article-management');
				return;
			}

			const success = await getArticleById(parsedId);
			setIsLoading(false);

			if (!success) {
				router.push('/article-management');
			}
		};

		fetchArticle();

		return () => {
			// Clean up when leaving the page
			resetForm();
			setSelectedArticle(null);
		};
	}, [id, getArticleById, router, resetForm, setSelectedArticle]);

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
		const success = await updateArticle(false);
		setLoading(false);
		if (success) {
			resetForm();
			router.push('/article-management');
		}
	};

	if (isLoading) {
		return (
			<div className='space-y-6 p-6'>
				<div className='mb-6'>
					<h1 className='mb-2 font-bold text-2xl'>Article Editor</h1>
					<p className='text-muted-foreground'>Loading article...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center gap-2 mb-6'>
				<Button asChild variant='ghost' size='icon'>
					<Link href='/article-management'>
						<ArrowLeft className='w-4 h-4' />
					</Link>
				</Button>
				<div>
					<h1 className='mb-2 font-bold text-2xl'>Article Editor</h1>
					<p className='text-muted-foreground'>
						Edit article with rich text content
					</p>
				</div>
			</div>
			<div className='max-w-4xl'>
				<ArticleForm
					initialValues={selectedArticle || {}}
					onSubmit={handleSubmit}
					onCancel={() => router.push('/article-management')}
					loading={loading}
				/>
			</div>
		</div>
	);
}
