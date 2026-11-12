import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/constants';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  try {
    const res = await fetch(`${API_BASE_URL}/inquiries/owner`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
