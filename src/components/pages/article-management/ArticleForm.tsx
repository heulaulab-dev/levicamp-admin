import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Article } from '@/hooks/article/useArticle';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ThumbnailUploader } from './ThumbnailUploader';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ArticleFormProps {
	mode?: 'create' | 'edit';
	initialValues?: Partial<Article>;
	onSubmit: (data: Record<string, unknown>) => void;
	onCancel: () => void;
	loading?: boolean;
}

export function ArticleForm({
	initialValues,
	onSubmit,
	onCancel,
	loading,
}: ArticleFormProps) {
	// Format initial date for the form input
	const formatDateForInput = (dateString?: string) => {
		if (!dateString) return '';
		// Try to parse the date string
		try {
			const date = new Date(dateString);
			// Only return if it's a valid date
			if (!isNaN(date.getTime())) {
				return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for input
			}
		} catch (e) {
			console.error('Error parsing date:', e);
		}
		return '';
	};

	const { register, handleSubmit, setValue, watch } = useForm({
		defaultValues: {
			title: initialValues?.title || '',
			summary: initialValues?.summary || '',
			author: initialValues?.author || '',
			published_at: formatDateForInput(initialValues?.published_at),
			image: initialValues?.image || '',
			tags: initialValues?.tags?.join(', ') || '',
			content: initialValues?.content || '',
			status: initialValues?.status || 'draft',
		},
	});

	// We need to watch the image field and status field
	const imageValue = watch('image');
	const statusValue = watch('status');

	const handleFormSubmit = (data: Record<string, unknown>) => {
		// Format the date as ISO 8601 with timezone
		if (data.published_at && typeof data.published_at === 'string') {
			// Ensure the time component is included
			const date = new Date(`${data.published_at}T12:00:00Z`);
			data.published_at = date.toISOString();
		}

		// Handle tags conversion
		if (data.tags && typeof data.tags === 'string') {
			data.tags = (data.tags as string)
				.split(',')
				.map((tag) => tag.trim())
				.filter((tag) => tag !== '');
		}

		onSubmit(data);
	};

	// Handle status toggle change
	const handleStatusChange = (checked: boolean) => {
		setValue('status', checked ? 'published' : 'draft');
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
			<Input {...register('title', { required: true })} placeholder='Title' />
			<Input
				{...register('summary', { required: true })}
				placeholder='Summary'
			/>
			<Input {...register('author', { required: true })} placeholder='Author' />
			<Input
				{...register('published_at', { required: true })}
				placeholder='Published At (YYYY-MM-DD)'
				type='date'
			/>

			{/* Publishing Status Toggle */}
			<div className='flex justify-between items-center space-x-2'>
				<Label htmlFor='article-status' className='flex flex-col space-y-1'>
					<span>Publishing Status</span>
					<span className='font-normal text-muted-foreground text-sm'>
						{statusValue === 'published'
							? 'This article will be visible on the website'
							: 'This article is a draft and will not be visible on the website'}
					</span>
				</Label>
				<Switch
					id='article-status'
					checked={statusValue === 'published'}
					onCheckedChange={handleStatusChange}
				/>
			</div>

			{/* Replace image URL input with ThumbnailUploader */}
			<ThumbnailUploader
				value={imageValue}
				onChange={(url) => setValue('image', url, { shouldValidate: true })}
				articleId={initialValues?.id}
			/>

			<Input {...register('tags')} placeholder='Tags (comma separated)' />
			<div>
				<label className='block mb-1 font-medium'>Content</label>
				<RichTextEditor
					value={initialValues?.content || ''}
					onChange={(html) => setValue('content', html)}
					articleId={initialValues?.id}
				/>
			</div>
			<DialogFooter>
				<Button
					type='button'
					variant='outline'
					onClick={onCancel}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button type='submit' disabled={loading}>
					Save Article
				</Button>
			</DialogFooter>
		</form>
	);
}
