import { getDocTitle } from './wiki';
import { PATTERN_CATEGORIES, getCategoryLabel } from './pattern-map';

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

function leaf(slugStr: string, fallback?: string, locale?: string): NavLeaf {
  const slug = slugStr === '' ? [] : slugStr.split('/');
  const label = getDocTitle(slug, locale) ?? fallback ?? slugStr;
  return {
    type: 'doc',
    slug,
    href: slugStr ? '/' + slugStr : '/',
    label,
  };
}

/**
 * Build the patterns category content: each category becomes a group header
 * followed by the patterns belonging to it.
 */
function buildPatternItems(locale?: string): (NavLeaf | NavGroupLabel)[] {
  const items: (NavLeaf | NavGroupLabel)[] = [];
  for (const cat of PATTERN_CATEGORIES) {
    items.push({ type: 'group', label: getCategoryLabel(cat.label, locale) });
    for (const slug of cat.slugs) {
      items.push(leaf(`patterns/${slug}`, undefined, locale));
    }
  }
  return items;
}

const NAV_LABELS: Record<string, Record<string, string>> = {
  en: {
    home: 'Home',
    taxonomy: 'Taxonomy',
    decisionMatrix: 'Decision Matrix',
    patterns: 'Patterns',
    implementation: 'Implementation',
    reference: 'Reference',
  },
  zh: {
    home: '首页',
    taxonomy: '分类体系',
    decisionMatrix: '决策矩阵',
    patterns: '模式',
    implementation: '实现',
    reference: '参考',
  },
};

export function getNav(locale?: string): NavItem[] {
  const L = NAV_LABELS[locale ?? 'en'] ?? NAV_LABELS.en;
  return [
    leaf('', L.home, locale),
    leaf('taxonomy', L.taxonomy, locale),
    leaf('decision-matrix', L.decisionMatrix, locale),
    {
      type: 'category',
      label: L.patterns,
      href: '/patterns',
      items: buildPatternItems(locale),
    },
    {
      type: 'category',
      label: L.implementation,
      items: [
        leaf('implementation/production-runtime', undefined, locale),
        leaf('implementation/orchestrator', undefined, locale),
        leaf('implementation/observability', undefined, locale),
        leaf('implementation/safety-guardrails', undefined, locale),
        leaf('implementation/content-model', undefined, locale),
        leaf('implementation/pattern-page-template', undefined, locale),
      ],
    },
    {
      type: 'category',
      label: L.reference,
      items: [
        leaf('reference/glossary', undefined, locale),
        leaf('reference/references', undefined, locale),
      ],
    },
  ];
}

/** Flatten nav to its leaves in display order — for prev/next. */
export function flatNav(locale?: string): NavLeaf[] {
  const out: NavLeaf[] = [];
  for (const item of getNav(locale)) {
    if (item.type === 'doc') out.push(item);
    else for (const it of item.items) if (it.type === 'doc') out.push(it);
  }
  return out;
}

export function getNeighbors(slug: string[], locale?: string): { prev?: NavLeaf; next?: NavLeaf } {
  const flat = flatNav(locale);
  const key = slug.join('/');
  const idx = flat.findIndex(d => d.slug.join('/') === key);
  if (idx < 0) return {};
  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}
