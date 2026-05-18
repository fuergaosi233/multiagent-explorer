/** Mapping between animation pattern id (in data/patterns.ts) and wiki slug (under content/wiki/patterns). */
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
