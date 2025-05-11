'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import {
	Bold,
	Italic,
	List,
	ListOrdered,
	Heading1,
	Heading2,
	Quote,
	Link as LinkIcon,
	Image as ImageIcon,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Code,
	Undo,
	Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { ImageUploader } from './image-uploader';
import { Dialog, DialogContent, DialogTrigger } from './dialog';

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	editorClassName?: string;
	articleId?: string | number;
}

const MenuBar = ({
	editor,
	articleId,
}: {
	editor: Editor | null;
	articleId?: string | number;
}) => {
	const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

	if (!editor) {
		return null;
	}

	const addImage = (url: string) => {
		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
		setIsImageDialogOpen(false);
	};

	const setLink = () => {
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('Enter URL', previousUrl);

		if (url === null) {
			return;
		}

		if (url === '') {
			editor.chain().focus().unsetLink().run();
			return;
		}

		editor.chain().focus().setLink({ href: url }).run();
	};

	return (
		<div className='flex flex-wrap items-center gap-1 p-2 border-b'>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={cn(editor.isActive('bold') ? 'bg-accent' : '')}
			>
				<Bold className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={cn(editor.isActive('italic') ? 'bg-accent' : '')}
			>
				<Italic className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={cn(editor.isActive('bulletList') ? 'bg-accent' : '')}
			>
				<List className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={cn(editor.isActive('orderedList') ? 'bg-accent' : '')}
			>
				<ListOrdered className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={cn(
					editor.isActive('heading', { level: 1 }) ? 'bg-accent' : '',
				)}
			>
				<Heading1 className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={cn(
					editor.isActive('heading', { level: 2 }) ? 'bg-accent' : '',
				)}
			>
				<Heading2 className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className={cn(editor.isActive('blockquote') ? 'bg-accent' : '')}
			>
				<Quote className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={setLink}
				className={cn(editor.isActive('link') ? 'bg-accent' : '')}
			>
				<LinkIcon className='w-4 h-4' />
			</Button>

			<Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
				<DialogTrigger asChild>
					<Button type='button' variant='ghost' size='sm'>
						<ImageIcon className='w-4 h-4' />
					</Button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-md'>
					<div className='space-y-2 py-2'>
						<h3 className='font-medium text-lg'>Insert Image</h3>
						<p className='text-muted-foreground text-sm'>
							Upload an image or enter an image URL
						</p>
						<div className='gap-4 grid py-4'>
							<ImageUploader
								onImageUploaded={addImage}
								folder='articles'
								articleId={articleId}
							/>
							<div className='relative'>
								<div className='absolute inset-0 flex items-center'>
									<span className='border-t w-full' />
								</div>
								<div className='relative flex justify-center text-xs uppercase'>
									<span className='bg-background px-2 text-muted-foreground'>
										Or
									</span>
								</div>
							</div>
							<div className='flex items-center gap-2'>
								<input
									type='text'
									placeholder='Image URL'
									className='flex bg-transparent shadow-sm px-3 py-1 border border-input rounded-md w-full h-9 text-sm transition-colors'
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											addImage((e.target as HTMLInputElement).value);
										}
									}}
								/>
								<Button
									type='button'
									onClick={() => {
										const input = document.querySelector(
											'input[placeholder="Image URL"]',
										) as HTMLInputElement;
										if (input && input.value) {
											addImage(input.value);
										}
									}}
								>
									Insert
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().setTextAlign('left').run()}
				className={cn(
					editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : '',
				)}
			>
				<AlignLeft className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().setTextAlign('center').run()}
				className={cn(
					editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : '',
				)}
			>
				<AlignCenter className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().setTextAlign('right').run()}
				className={cn(
					editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : '',
				)}
			>
				<AlignRight className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={cn(editor.isActive('codeBlock') ? 'bg-accent' : '')}
			>
				<Code className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
			>
				<Undo className='w-4 h-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
			>
				<Redo className='w-4 h-4' />
			</Button>
		</div>
	);
};

export function RichTextEditor({
	value,
	onChange,
	editorClassName,
	articleId,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-primary underline',
				},
			}),
			Image.configure({
				allowBase64: true,
				HTMLAttributes: {
					class: 'mx-auto rounded-md max-w-full',
				},
			}),
			TextAlign.configure({
				types: ['heading', 'paragraph'],
				defaultAlignment: 'left',
			}),
		],
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
	});

	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [editor, value]);

	return (
		<div className='border rounded-md overflow-hidden'>
			<MenuBar editor={editor} articleId={articleId} />
			<div
				className={cn(
					'p-4 min-h-[200px] prose prose-sm max-w-none',
					editorClassName,
				)}
			>
				{editor && <EditorContent editor={editor} />}
			</div>
		</div>
	);
}
