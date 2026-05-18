import { ImageResponse } from 'next/og';
import { listAllSlugs, loadDoc } from '@/lib/wiki';
import { PATTERN_CATEGORY, CATEGORY_HEX } from '@/lib/pattern-map';
import { SITE_NAME } from '@/lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return listAllSlugs()
    .filter(slug => slug.length > 0)
    .map(slug => ({ slug }));
}

const SECTION_LABEL: Record<string, string> = {
  patterns: 'Patterns',
  implementation: 'Implementation',
  reference: 'Reference',
};

const SIZE = { width: 1200, height: 630 };

interface Ctx { params: Promise<{ slug: string[] }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const doc = loadDoc(slug);
  if (!doc) return new Response('not found', { status: 404 });

  const section = SECTION_LABEL[slug[0]] ?? 'Wiki';
  const isPattern = slug[0] === 'patterns' && slug.length === 2;
  const category = isPattern ? PATTERN_CATEGORY[slug[1]] : undefined;
  const accent = category ? CATEGORY_HEX[category] : '#ff7b39';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 72,
          background: 'linear-gradient(135deg, #0f1218 0%, #1a1d23 55%, #232838 100%)',
          color: '#f4f4f5',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ position:'absolute', top:0, left:0, right:0, height:6, background: accent }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 9,
              background: '#f4f4f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accent, fontSize: 22, fontWeight: 700,
            }}
          >
            ✦
          </div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{SITE_NAME}</div>
          <div
            style={{
              marginLeft: 16, padding: '4px 10px', borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 14, opacity: 0.75, fontFamily: 'monospace',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}
          >
            {section}
          </div>
          {category && (
            <div
              style={{
                marginLeft: 8, padding: '4px 10px', borderRadius: 6,
                color: accent, background: `${accent}1a`, border: `1px solid ${accent}55`,
                fontSize: 14, fontFamily: 'monospace',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}
            >
              {category}
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              fontSize: doc.title.length > 28 ? 68 : 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: 1020,
            }}
          >
            {doc.title}
          </div>
          {doc.description && (
            <div style={{ fontSize: 26, lineHeight: 1.35, opacity: 0.72, maxWidth: 980 }}>
              {doc.description}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 40,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 16,
            opacity: 0.6,
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
          }}
        >
          <span>multi-agent.wiki/{slug.join('/')}</span>
          <span>{section.toUpperCase()}</span>
        </div>
      </div>
    ),
    { ...SIZE },
  );
}
