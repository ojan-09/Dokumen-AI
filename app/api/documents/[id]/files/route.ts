import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '../../../../../lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/markdown',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed.' }, { status: 400 });
    }

    // Generate unique filename
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const filename = bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '') + '_' + file.name;
    const filepath = join(process.cwd(), 'public', 'uploads', filename);

    // Ensure uploads directory exists
    await mkdir(join(process.cwd(), 'public', 'uploads'), { recursive: true });

    // Save file to disk
    const bytesData = await file.arrayBuffer();
    const buffer = Buffer.from(bytesData);
    await writeFile(filepath, buffer);

    // Save file info to database
    const fileRecord = await prisma.file.create({
      data: {
        name: filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filepath,
        url: `/uploads/${filename}`,
        documentId: id
      }
    });

    return NextResponse.json(fileRecord, { status: 201 });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const files = await prisma.file.findMany({
      where: { documentId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json({ error: 'Failed to get files.' }, { status: 500 });
  }
}