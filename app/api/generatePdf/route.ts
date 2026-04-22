import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';

async function generatePdf(data: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);

  page.drawText(JSON.stringify(data), {
    x: 50,
    y: 700,
    size: 20,
    color: rgb(0, 0, 0),
  });

  return pdfDoc;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body.data;

    const pdfDoc = await generatePdf(data);
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="output.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
