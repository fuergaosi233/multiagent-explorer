import { getDocTitle } from './wiki';
import { PATTERN_CATEGORIES } from './pattern-map';

export interface NavLeaf {
  type: 'doc';
  slug: string[];
  href: string;
  label: string;
}

/** A non-clickable visual subheader rendered inside a category. */
export interface NavGroupLabel {
  type: 'group';
  label: string;
}

export interface NavCategory {
  type: 'category';
  label: string;
  /** Optional href — when set, the category label itself is a link
   *  (e.g. the "Patterns" header navigates to /patterns overview). */
  href?: string;
  items: (NavLeaf | NavGroupLabel)[];
}

export type NavItem = NavLeaf | NavCategory;

function leaf(slugStr: string, fallback?: string): NavLeaf {
  const slug = slugStr === '' ? [] : slugStr.split('/');
  const label = getDocTitle(slug) ?? fallback ?? slugStr;
  return {
    type: 'doc',
    slug,
    href: slugStr ? '/' + slugStr : '/',
    label,
  };
}

/**
 * Build the patterns category content: each category becomes a group header
 * followed by the patterns belonging to it. This mirrors how proper docs
 * sites (Stripe, Linear, shadcn) organize many siblings — group label →
 * items. The category label itself navigates to /patterns (the overview).
 */
function buildPatternItems(): (NavLeaf | NavGroupLabel)[] {
  const items: (NavLeaf | NavGroupLabel)[] = [];
  for (const cat of PATTERN_CATEGORIES) {
    items.push({ type: 'group', label: cat.label });
    for (const slug of cat.slugs) {
      items.push(leaf(`patterns/${slug}`));
    }
  }
  return items;
}

export function getNav(): NavItem[] {
  return [
    leaf('', 'Home'),
    leaf('taxonomy', 'Taxonomy'),
    leaf('decision-matrix', 'Decision Matrix'),
    {
      type: 'category',
      label: 'Patterns',
      href: '/patterns',
      items: buildPatternItems(),
    },
    {
      type: 'category',
      label: 'Implementation',
      items: [
        leaf('implementation/production-runtime'),
        leaf('implementation/orchestrator'),
        leaf('implementation/observability'),
        leaf('implementation/safety-guardrails'),
        leaf('implementation/content-model'),
        leaf('implementation/pattern-page-template'),
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        leaf('reference/glossary'),
        leaf('reference/references'),
      ],
    },
  ];
}

/** Flatten nav to its leaves in display order — for prev/next. */
export function flatNav(): NavLeaf[] {
  const out: NavLeaf[] = [];
  for (const item of getNav()) {
    if (item.type === 'doc') out.push(item);
    else for (const it of item.items) if (it.type === 'doc') out.push(it);
  }
  return out;
}

export function getNeighbors(slug: string[]): { prev?: NavLeaf; next?: NavLeaf } {
  const flat = flatNav();
  const key = slug.join('/');
  const idx = flat.findIndex(d => d.slug.join('/') === key);
  if (idx < 0) return {};
  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}
