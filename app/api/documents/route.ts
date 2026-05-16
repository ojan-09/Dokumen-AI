'use server';

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, content: true, updatedAt: true }
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error('GET /api/documents failed', error);
    return NextResponse.json({ error: 'Gagal memuat dokumen' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const document = await prisma.document.create({
      data: {
        title: body.title ?? 'Dokumen Baru',
        content: body.content ?? '',
        user: {
          connectOrCreate: {
            where: { email: 'local@ai-docs.app' },
            create: { email: 'local@ai-docs.app', name: 'Local User' }
          }
        }
      }
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('POST /api/documents failed', error);
    return NextResponse.json({ error: 'Gagal membuat dokumen' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await context.params;

  await prisma.document.delete({
    where: { id },
  });

  return Response.json({
    success: true,
  });
}