'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useArticleStore } from '@/hooks/article/useArticle';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

export default function ArticleManagementPage() {
	const { articles, getArticles, deleteArticle } = useArticleStore();

	const [formLoading, setFormLoading] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);

	useEffect(() => {
		getArticles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDelete = async (id: number) => {
		setFormLoading(true);
		setDeletingId(id);
		await deleteArticle(id);
		setFormLoading(false);
		setDeletingId(null);
	};

	return (
		<div className='space-y-6 p-6'>
			<div className='flex justify-between items-center mb-4'>
				<h1 className='font-bold text-2xl'>Article Management</h1>
				<Button asChild>
					<Link href='/article-management/new'>New Article</Link>
				</Button>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Title</TableHead>
						<TableHead>Author</TableHead>
						<TableHead>Published</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Tags</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{articles.map((article) => (
						<TableRow key={article.id}>
							<TableCell>{article.title}</TableCell>
							<TableCell>{article.author}</TableCell>
							<TableCell>{article.published_at?.slice(0, 10)}</TableCell>
							<TableCell>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
										article.status === 'published'
											? 'bg-green-100 text-green-800'
											: 'bg-yellow-100 text-yellow-800'
									}`}
								>
									{article.status === 'published' ? 'Published' : 'Draft'}
								</span>
							</TableCell>
							<TableCell>{article.tags?.join(', ')}</TableCell>
							<TableCell>
								<Button size='sm' variant='outline' asChild className='mr-2'>
									<Link href={`/article-management/${article.id}`}>Edit</Link>
								</Button>
								<Button
									size='sm'
									variant='destructive'
									onClick={() => handleDelete(article.id)}
									disabled={formLoading && deletingId === article.id}
								>
									{formLoading && deletingId === article.id
										? 'Deleting...'
										: 'Delete'}
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
 