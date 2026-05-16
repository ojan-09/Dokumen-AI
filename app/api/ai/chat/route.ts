import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ?? '';

async function callGemini(
  prompt: string,
  documentContent: string
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
You are an AI writing assistant.

Document:
${documentContent}

User request:
${prompt}
                `,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gemini API error: ${errorText}`
    );
  }

  const json = await response.json();

  return (
    json?.candidates?.[0]?.content?.parts?.[0]
      ?.text || 'AI response tidak tersedia.'
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const document =
      await prisma.document.findUnique({
        where: {
          id: body.documentId,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          error: 'Dokumen tidak ditemukan',
        },
        {
          status: 404,
        }
      );
    }

    const responseText = await callGemini(
      body.prompt,
      body.documentContent ??
        document.content
    );

    await prisma.aIChatHistory.create({
      data: {
        documentId: document.id,
        prompt: body.prompt,
        response: responseText,
      },
    });

    return NextResponse.json({
      response: responseText,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Terjadi kesalahan AI',
      },
      {
        status: 500,
      }
    );
  }
}