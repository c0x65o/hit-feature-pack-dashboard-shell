import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { extractUserFromRequest } from '../auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type PackMeta = {
  name: string;
  title?: string | null;
  description?: string | null;
  ai?: { agentPrompt?: string | null } | null;
};

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

function getDashboardShellConfigFromUser(user: any): Record<string, any> | null {
  const packs = user?.featurePacks;
  if (!packs || typeof packs !== 'object') return null;
  const cfg = (packs as any)['dashboard-shell'];
  return cfg && typeof cfg === 'object' ? cfg : null;
}

function isAdminUser(user: any): boolean {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.some((r: any) => String(r || '').toLowerCase() === 'admin' || String(r || '').toLowerCase() === 'superadmin');
}

export async function GET(request: NextRequest) {
  const user = extractUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectRoot = process.cwd();
  const caps = loadCapabilities(projectRoot);
  const packs: PackMeta[] = Array.isArray((caps as any)?.featurePacksDetailed) ? (caps as any).featurePacksDetailed : [];

  const shellCfg = getDashboardShellConfigFromUser(user);
  const nexusPrompt =
    (shellCfg && typeof shellCfg.nexus_prompt === 'string' && shellCfg.nexus_prompt.trim()) ||
    null;

  const debugFlag = shellCfg?.nexus_debug === true;
  const debugEnabled = Boolean(debugFlag && isAdminUser(user));

  return NextResponse.json({
    generated: Boolean((caps as any)?.generated),
    kind: 'hit-nexus-options',
    nexusPrompt,
    debugEnabled,
    packs,
  });
}

