import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '../../../../../../lib/prisma';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string; fileId: string } }
) {
  try {
    const { id, fileId } = context.params;
    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file || file.documentId !== id) {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 404 });
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const filePath = file.path;

    if (filePath.startsWith(uploadsDir)) {
      await unlink(filePath).catch(() => null);
    }

    await prisma.file.delete({ where: { id: fileId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Gagal menghapus file.' }, { status: 500 });
  }
}
