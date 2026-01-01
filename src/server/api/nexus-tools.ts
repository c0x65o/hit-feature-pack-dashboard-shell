import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { extractUserFromRequest } from '../auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function loadCapabilities(projectRoot: string): any | null {
  try {
    const p = path.join(projectRoot, '.hit', 'generated', 'capabilities.json');
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = extractUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pack = (searchParams.get('pack') || '').trim();
  if (!pack) {
    return NextResponse.json({ error: "Missing required query param: 'pack'" }, { status: 400 });
  }

  const projectRoot = process.cwd();
  const caps = loadCapabilities(projectRoot);
  const endpoints = Array.isArray((caps as any)?.endpoints) ? (caps as any).endpoints : [];

  // Tool surface is simply endpoints belonging to the feature pack.
  const tools = endpoints.filter((ep: any) => String(ep?._featurePack || '') === pack);

  return NextResponse.json({
    generated: Boolean((caps as any)?.generated),
    kind: 'hit-nexus-tools',
    pack,
    tools,
  });
}

