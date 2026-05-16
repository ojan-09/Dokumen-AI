import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PATCH(request: Request, context: any) {
  const body = await request.json();

  const params = await context.params;
  const { id } = params as { id: string };

  const document = await prisma.document.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content
    }
  });

  return NextResponse.json(document);
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  const { id } = params as { id: string };

  await prisma.document.delete({
    where: { id }
  });

  return NextResponse.json({
    success: true
  });
}