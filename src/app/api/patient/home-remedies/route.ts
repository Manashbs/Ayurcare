import { NextResponse } from 'next/server';
import remediesData from '@/app/patient/home-remedies/remedies-large.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);

    let filtered = remediesData as any[];

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.symptom.toLowerCase().includes(search) ||
          r.name.toLowerCase().includes(search) ||
          r.desc.toLowerCase().includes(search) ||
          (r.ingredients && r.ingredients.some((i: string) => i.toLowerCase().includes(search))) ||
          (r.preparation && r.preparation.some((p: string) => p.toLowerCase().includes(search)))
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      totalCount: total,
      totalPages,
      currentPage,
      limit,
      remedies: paginatedItems,
    });
  } catch (error: any) {
    console.error('Fetch home remedies error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
