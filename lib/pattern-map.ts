/**
 * Mapping between animation pattern id (in data/patterns.ts) and wiki slug
 * (under content/wiki/patterns), plus the category each pattern belongs to.
 *
 * Categories follow the taxonomy from `content/wiki/taxonomy.md`, with a
 * `Specialized` bucket for patterns that don't slot into one of the five
 * main dimensions (composition, organization, simulation, learning).
 */

export type PatternCategory =
  | 'Control'
  | 'Information'
  | 'Decision'
  | 'Environment'
  | 'Protocol'
  | 'Specialized';

export const PATTERN_TO_WIKI: Record<string, string> = {
  supervisor:  'supervisor-manager',
  router:      'handoff-router',
  hierarchy:   'hierarchical-decomposition',
  sequential:  'sequential-pipeline',
  parallel:    'parallel-fanout-gather',
  blackboard:  'blackboard-shared-memory',
  groupchat:   'group-chat',
  nested:      'nested-chat',
  roleplay:    'role-playing-sop',
  debate:      'debate-judge',
  auction:     'market-auction-contract-net',
  swarm:       'peer-swarm',
  protocol:    'protocol-mediated',
};

export const WIKI_TO_PATTERN: Record<string, string> = Object.fromEntries(
  Object.entries(PATTERN_TO_WIKI).map(([k, v]) => [v, k]),
);

export const PATTERN_CATEGORIES: { label: PatternCategory; slugs: string[] }[] = [
  {
    label: 'Control',
    slugs: [
      'supervisor-manager',
      'agents-as-tools',
      'handoff-router',
      'hierarchical-decomposition',
      'graph-workflow',
      'peer-swarm',
      'coordinator-dispatcher',
    ],
  },
  {
    label: 'Information',
    slugs: [
      'sequential-pipeline',
      'parallel-fanout-gather',
      'group-chat',
      'nested-chat',
      'blackboard-shared-memory',
      'event-bus-pubsub',
    ],
  },
  {
    label: 'Decision',
    slugs: [
      'debate-judge',
      'generator-critic',
      'refinement-loop',
      'market-auction-contract-net',
      'mixture-of-agents',
      'voting-ensemble',
      'clarification-at-edge',
    ],
  },
  {
    label: 'Environment',
    slugs: [
      'role-playing-sop',
      'human-in-the-loop',
      'workspace-isolation',
      'stigmergy-environment-mediated',
    ],
  },
  {
    label: 'Protocol',
    slugs: ['protocol-mediated'],
  },
  {
    label: 'Specialized',
    slugs: [
      'composite-pattern',
      'coalition-federation-holonic',
      'social-simulation',
      'marl-ctde',
    ],
  },
];

export const PATTERN_CATEGORY: Record<string, PatternCategory> = Object.fromEntries(
  PATTERN_CATEGORIES.flatMap(({ label, slugs }) => slugs.map(s => [s, label])),
);

/** Map category → a Tailwind color hint for badges. */
export const CATEGORY_TONE: Record<PatternCategory, string> = {
  Control:      'bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400',
  Information:  'bg-sky-500/10 text-sky-700 border-sky-500/25 dark:text-sky-300',
  Decision:     'bg-violet-500/10 text-violet-700 border-violet-500/25 dark:text-violet-300',
  Environment:  'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',
  Protocol:     'bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-300',
  Specialized:  'bg-zinc-500/10 text-zinc-700 border-zinc-500/25 dark:text-zinc-300',
};
