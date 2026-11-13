import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/constants';

export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie') || '';

  try {
    const res = await fetch(`${API_BASE_URL}/inquiries/owner`, {
      method: 'GET',
      headers: {
        Cookie: cookie,
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
