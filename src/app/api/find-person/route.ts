
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const externalApiResponse = await fetch('https://9198f9552d6a.ngrok-free.app/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image }),
    });

    if (!externalApiResponse.ok) {
      const errorBody = await externalApiResponse.text();
      console.error('External API Error:', errorBody);
      return NextResponse.json(
        { error: `External API failed with status ${externalApiResponse.status}` },
        { status: externalApiResponse.status }
      );
    }

    const data = await externalApiResponse.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
