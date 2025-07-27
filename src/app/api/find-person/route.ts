
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const externalApiResponse = await fetch('https://1320e004f4f7.ngrok-free.app/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image }),
    });

    if (!externalApiResponse.ok) {
      const errorBody = await externalApiResponse.text();
      console.error('External API Error:', errorBody);
      // Pass the specific error and status from the external API to the client
      return NextResponse.json(
        { 
          error: `The external service is currently unavailable. Please try again later.`,
          details: errorBody,
        },
        { status: externalApiResponse.status }
      );
    }

    const data = await externalApiResponse.json();
    
    // Assuming the API response contains `text` and `found` fields
    return NextResponse.json({
        text: data.text,
        found: data.found,
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error while contacting the prediction service.' }, { status: 500 });
  }
}
