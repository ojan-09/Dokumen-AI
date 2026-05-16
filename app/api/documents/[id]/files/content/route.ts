import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import mammoth from 'mammoth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename parameter.' }, { status: 400 });
    }

    const filepath = join(process.cwd(), 'public', 'uploads', filename);

    // Validate file exists and is in uploads directory
    if (!filepath.startsWith(join(process.cwd(), 'public', 'uploads'))) {
      return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 });
    }

    const fileBuffer = await readFile(filepath);

    // Check if it's a Word document
    if (filename.endsWith('.docx')) {
      const result = await mammoth.convertToHtml({ buffer: fileBuffer });
      // Strip out image tags since they reference internal resources
      const htmlWithoutImages = result.value
        .replace(/<img[^>]*>/g, '')
        .replace(/<p>\s*<\/p>/g, ''); // Remove empty paragraphs

      // Remove any hyperlink wrappers that may be created during conversion
      // so imported document text renders cleanly in the editor.
      const htmlClean = htmlWithoutImages.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');

      return NextResponse.json({ content: htmlClean });
    }

    // For text files, just return as text
    if (filename.endsWith('.txt') || filename.endsWith('.md')) {
      const text = fileBuffer.toString('utf-8');
      return NextResponse.json({ content: text });
    }

    // For other binary files, return error
    return NextResponse.json({ error: 'File type not supported for text extraction.' }, { status: 400 });
  } catch (error) {
    console.error('Extract content error:', error);
    return NextResponse.json({ error: 'Failed to extract file content.' }, { status: 500 });
  }
}
