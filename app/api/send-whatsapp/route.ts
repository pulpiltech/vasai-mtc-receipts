import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Proxy the request directly using the raw body stream
    const contentType = req.headers.get('content-type');
    const serviceUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${serviceUrl}/api/send-pdf`, {
      method: 'POST',
      headers: contentType ? { 'Content-Type': contentType } : {},
      body: req.body,
      // @ts-ignore
      duplex: 'half' // Required for streaming request bodies in Node 18+
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to send WhatsApp message' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: data.message });
  } catch (error: any) {
    console.error('Error proxying to WhatsApp service:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
