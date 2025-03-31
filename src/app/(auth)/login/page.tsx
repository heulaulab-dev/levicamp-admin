import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/pages/login/login-form';

export default function LoginPage() {
	return (
		<div className='grid lg:grid-cols-2 min-h-svh'>
			<div className='flex flex-col gap-4 p-6 md:p-10'>
				<div className='flex justify-center md:justify-start gap-2'>
					<Link href='/' className='flex items-center gap-2 font-medium'>
						<Image
							src='https://assets.levicamp.id/assets/logo/levicamp-logo-orange.png'
							alt='Levi Camp'
							width={120}
							height={120}
						/>
					</Link>
				</div>
				<div className='flex flex-1 justify-center items-center'>
					<div className='w-full max-w-xs'>
						<LoginForm />
					</div>
				</div>
			</div>
			<div className='hidden lg:block relative bg-muted'>
				<Image
					src='/login/jumbotron_login.png'
					alt='Image'
					width={1920}
					height={1080}
					className='absolute inset-0 dark:brightness-[0.2] dark:grayscale w-full h-full object-cover'
				/>
			</div>
		</div>
	);
}
