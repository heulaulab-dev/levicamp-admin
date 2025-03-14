import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'minio';

export async function GET(request: NextRequest) {
	// Ambil parameter dari URL
	const searchParams = request.nextUrl.searchParams;
	const fileName = searchParams.get('fileName');
	const fileType = searchParams.get('fileType');

	if (!fileName || !fileType) {
		return NextResponse.json(
			{ message: 'fileName and fileType are required' },
			{ status: 400 },
		);
	}

	try {
		// Inisialisasi Minio client
		const minioClient = new Client({
			endPoint: process.env.MINIO_ENDPOINT || 'localhost',
			port: parseInt(process.env.MINIO_PORT || '9000'),
			useSSL: process.env.MINIO_USE_SSL === 'true',
			accessKey: process.env.MINIO_ACCESS_KEY || '',
			secretKey: process.env.MINIO_SECRET_KEY || '',
		});

		const bucketName = process.env.MINIO_BUCKET || 'tents';
		const objectName = `tent-${Date.now()}-${fileName}`;

		// Generate presigned URL untuk PUT operation (upload)
		const presignedUrl = await minioClient.presignedPutObject(
			bucketName,
			objectName,
			60 * 60,
		); // URL valid selama 1 jam

		// Generate URL yang akan digunakan untuk mengakses file
		const fileUrl = `${process.env.MINIO_PUBLIC_ENDPOINT}/${bucketName}/${objectName}`;

		return NextResponse.json({ presignedUrl, fileUrl });
	} catch (error) {
		console.error('Error generating presigned URL:', error);
		return NextResponse.json(
			{ message: 'Failed to generate upload URL' },
			{ status: 500 },
		);
	}
}
