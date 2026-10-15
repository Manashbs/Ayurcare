import { NextResponse } from 'next/server';
import herbsData from '@/app/patient/remedies/herbs-large.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    const dosha = searchParams.get('dosha') || 'All';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);

    let filtered = herbsData as any[];

    if (dosha !== 'All') {
      filtered = filtered.filter((h) => h.balances && h.balances.includes(dosha));
    }

    if (search) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(search) ||
          h.scientificName.toLowerCase().includes(search) ||
          h.sanskritName.toLowerCase().includes(search) ||
          h.desc.toLowerCase().includes(search) ||
          (h.diseases && h.diseases.some((d: string) => d.toLowerCase().includes(search))) ||
          (h.benefits && h.benefits.some((b: string) => b.toLowerCase().includes(search)))
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
      herbs: paginatedItems,
    });
  } catch (error: any) {
    console.error('Fetch herb remedies error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
