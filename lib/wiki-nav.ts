import { getDocTitle } from './wiki';

export interface NavLeaf {
  type: 'doc';
  slug: string[];
  href: string;
  label: string;
}

export interface NavCategory {
  type: 'category';
  label: string;
  items: NavLeaf[];
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
 * The wiki navigation tree, mirroring the upstream Docusaurus `sidebars.js`.
 * Labels are pulled from each doc's frontmatter `title` at build time.
 */
export function getNav(): NavItem[] {
  return [
    leaf('', 'Home'),
    leaf('taxonomy', 'Taxonomy'),
    leaf('decision-matrix', 'Decision Matrix'),
    {
      type: 'category',
      label: 'Patterns',
      items: [
        leaf('patterns', '模式总览'),
        leaf('patterns/supervisor-manager'),
        leaf('patterns/agents-as-tools'),
        leaf('patterns/handoff-router'),
        leaf('patterns/sequential-pipeline'),
        leaf('patterns/parallel-fanout-gather'),
        leaf('patterns/hierarchical-decomposition'),
        leaf('patterns/graph-workflow'),
        leaf('patterns/group-chat'),
        leaf('patterns/nested-chat'),
        leaf('patterns/debate-judge'),
        leaf('patterns/generator-critic'),
        leaf('patterns/refinement-loop'),
        leaf('patterns/role-playing-sop'),
        leaf('patterns/blackboard-shared-memory'),
        leaf('patterns/event-bus-pubsub'),
        leaf('patterns/market-auction-contract-net'),
        leaf('patterns/peer-swarm'),
        leaf('patterns/mixture-of-agents'),
        leaf('patterns/human-in-the-loop'),
        leaf('patterns/protocol-mediated'),
        leaf('patterns/clarification-at-edge'),
        leaf('patterns/coordinator-dispatcher'),
        leaf('patterns/voting-ensemble'),
        leaf('patterns/composite-pattern'),
        leaf('patterns/workspace-isolation'),
        leaf('patterns/stigmergy-environment-mediated'),
        leaf('patterns/coalition-federation-holonic'),
        leaf('patterns/social-simulation'),
        leaf('patterns/marl-ctde'),
      ],
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

/** Flatten nav to just leaves, in display order — for prev/next links. */
export function flatNav(): NavLeaf[] {
  const out: NavLeaf[] = [];
  for (const item of getNav()) {
    if (item.type === 'doc') out.push(item);
    else out.push(...item.items);
  }
  return out;
}

/** Find adjacent docs for the prev/next nav at the bottom of each page. */
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
