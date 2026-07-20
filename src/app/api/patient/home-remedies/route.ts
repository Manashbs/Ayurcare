import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const query = searchParams.get('query') || '';
    const symptom = searchParams.get('symptom') || 'All';

    const jsonPath = path.join(process.cwd(), 'src', 'app', 'patient', 'home-remedies', 'remedies-large.json');
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'Home remedies database not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const remedies = JSON.parse(fileContent);

    // Filter server-side
    const filtered = remedies.filter((r: any) => {
      const matchesSearch =
        !query ||
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.symptom.toLowerCase().includes(query.toLowerCase()) ||
        r.desc.toLowerCase().includes(query.toLowerCase()) ||
        r.ingredients.some((i: string) => i.toLowerCase().includes(query.toLowerCase())) ||
        r.preparation.some((p: string) => p.toLowerCase().includes(query.toLowerCase())) ||
        r.usage.toLowerCase().includes(query.toLowerCase());

      const matchesSymptom = symptom === 'All' || r.symptom === symptom;

      return matchesSearch && matchesSymptom;
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      remedies: paginated,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      currentPage: page
    }, { status: 200 });

  } catch (error: any) {
    console.error('Home Remedies API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve home remedies data' }, { status: 500 });
  }
}
