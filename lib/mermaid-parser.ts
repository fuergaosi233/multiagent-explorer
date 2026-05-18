/**
 * Tiny parser for the `flowchart` subset of mermaid syntax used in our wiki.
 *
 * Supports just enough to render every diagram we author by hand:
 *   - direction:  flowchart TD | LR | BT | RL
 *   - nodes:      id[Label] | id(Label) | id((Label)) | id[(Label)] | id{Label}
 *   - edges:      A --> B, A -.-> B (dashed), A --- B (no arrow)
 *   - edge label: A -->|label| B
 *   - implicit node declarations on either side of an edge
 *
 * Returns a structured graph for downstream rendering (React Flow + dagre),
 * or `null` if it can't confidently parse the source — caller should fall
 * back to the mermaid renderer in that case.
 */

export type FlowDirection = 'TB' | 'LR' | 'BT' | 'RL';
export type NodeShape = 'rect' | 'round' | 'circle' | 'cylinder' | 'diamond';

export interface ParsedNode {
  id: string;
  label: string;
  shape: NodeShape;
}

export interface ParsedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  dashed?: boolean;
  noArrow?: boolean;
}

export interface ParsedFlow {
  direction: FlowDirection;
  nodes: ParsedNode[];
  edges: ParsedEdge[];
}

// id[Label] / id(Label) / id((Label)) / id[(Label)] / id{Label}
const NODE_DECL = /^([A-Za-z_][\w-]*)(\[\(|\[|\(\(|\(|\{)([^)\]}]+)(\)\]|\]|\)\)|\)|\})$/;
// id (bare reference)
const NODE_REF = /^([A-Za-z_][\w-]*)$/;

function parseShape(open: string): NodeShape {
  if (open === '[(') return 'cylinder';
  if (open === '((') return 'circle';
  if (open === '(') return 'round';
  if (open === '{') return 'diamond';
  return 'rect';
}

function tryParseNode(token: string): ParsedNode | null {
  const m = NODE_DECL.exec(token);
  if (m) {
    return { id: m[1], label: m[3].trim(), shape: parseShape(m[2]) };
  }
  const ref = NODE_REF.exec(token);
  if (ref) {
    return { id: ref[1], label: ref[1], shape: 'rect' };
  }
  return null;
}

/** Split a line at the connector while keeping bracketed labels intact. */
function splitOnConnector(
  line: string,
): { left: string; conn: string; label?: string; right: string } | null {
  // Iterate so brackets aren't split across.
  // Connectors: `-.->`, `-->`, `---`, `-.-`
  const re = /\s*(-{2,3}>|-\.+>|-{2,3}|-\.+-)\s*/g;
  let depth = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '[' || c === '(' || c === '{') depth++;
    else if (c === ']' || c === ')' || c === '}') depth--;
    if (depth !== 0) continue;
    re.lastIndex = i;
    const m = re.exec(line);
    if (!m || m.index !== i) continue;
    const left = line.slice(0, i).trim();
    let after = line.slice(re.lastIndex);
    let label: string | undefined;
    // Optional `|label|` after the connector.
    const labelMatch = /^\|([^|]+)\|\s*/.exec(after);
    if (labelMatch) {
      label = labelMatch[1].trim();
      after = after.slice(labelMatch[0].length);
    }
    return { left, conn: m[1], label, right: after.trim() };
  }
  return null;
}

function parseDirection(token: string): FlowDirection | null {
  switch (token.toUpperCase()) {
    case 'TD':
    case 'TB':
      return 'TB';
    case 'LR':
      return 'LR';
    case 'BT':
      return 'BT';
    case 'RL':
      return 'RL';
    default:
      return null;
  }
}

export function parseFlowchart(source: string): ParsedFlow | null {
  const lines = source.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
  if (lines.length === 0) return null;

  let direction: FlowDirection = 'TB';
  let startIdx = 0;
  const head = lines[0].match(/^(?:flowchart|graph)\s+(\w+)/i);
  if (head) {
    const dir = parseDirection(head[1]);
    if (!dir) return null;
    direction = dir;
    startIdx = 1;
  }

  const nodes = new Map<string, ParsedNode>();
  const edges: ParsedEdge[] = [];

  function recordNode(token: string): string | null {
    const n = tryParseNode(token);
    if (!n) return null;
    // First declaration wins for label/shape; bare refs don't overwrite a real declaration.
    const existing = nodes.get(n.id);
    if (!existing || existing.label === existing.id) {
      nodes.set(n.id, n);
    }
    return n.id;
  }

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const parts = splitOnConnector(line);
    if (parts) {
      const a = recordNode(parts.left);
      const b = recordNode(parts.right);
      if (!a || !b) return null;
      edges.push({
        id: `e-${a}-${b}-${edges.length}`,
        source: a,
        target: b,
        label: parts.label,
        dashed: parts.conn.includes('.'),
        noArrow: !parts.conn.includes('>'),
      });
      continue;
    }
    // Standalone node declaration.
    if (recordNode(line) == null) return null;
  }

  if (nodes.size === 0) return null;
  return { direction, nodes: [...nodes.values()], edges };
}
