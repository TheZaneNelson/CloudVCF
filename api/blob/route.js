import { put, get, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { action, sessionId, data } = await request.json();

  if (!['upload', 'fetch', 'delete'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    if (action === 'upload') {
      const blob = await put(
        `sessions/${sessionId}.json`,
        JSON.stringify(data),
        { 
          access: 'public',
          contentType: 'application/json',
          token: process.env.BLOB_READ_WRITE_TOKEN
        }
      );
      return NextResponse.json(blob);
    }

    if (action === 'fetch') {
      const blob = await get(`sessions/${sessionId}.json`, {
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      if (!blob) return NextResponse.json(null);
      
      const res = await fetch(blob.url);
      return NextResponse.json(await res.json());
    }

    if (action === 'delete') {
      await del(`sessions/${sessionId}.json`, {
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Blob operation failed', details: error.message },
      { status: 500 }
    );
  }
}