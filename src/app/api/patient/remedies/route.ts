import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const query = searchParams.get('query') || '';
    const dosha = searchParams.get('dosha') || 'All';
    const category = searchParams.get('category') || 'All';

    const jsonPath = path.join(process.cwd(), 'src', 'app', 'patient', 'remedies', 'herbs-large.json');
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'Herbs database not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const herbs = JSON.parse(fileContent);

    // Filter server-side
    const filtered = herbs.filter((h: any) => {
      const matchesSearch =
        !query ||
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.hindiName.toLowerCase().includes(query.toLowerCase()) ||
        h.scientificName.toLowerCase().includes(query.toLowerCase()) ||
        h.desc.toLowerCase().includes(query.toLowerCase()) ||
        h.diseases.some((d: string) => d.toLowerCase().includes(query.toLowerCase())) ||
        h.benefits.some((b: string) => b.toLowerCase().includes(query.toLowerCase())) ||
        h.formulations.some((f: string) => f.toLowerCase().includes(query.toLowerCase()));

      const matchesDosha = dosha === 'All' || h.balances.includes(dosha);
      const matchesCategory = category === 'All' || h.category === category;

      return matchesSearch && matchesDosha && matchesCategory;
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      herbs: paginated,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      currentPage: page
    }, { status: 200 });

  } catch (error: any) {
    console.error('Herbs API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve herbs data' }, { status: 500 });
  }
}
