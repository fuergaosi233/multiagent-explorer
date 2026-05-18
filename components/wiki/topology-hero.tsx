import { Badge } from '../ui/badge';
import { Mermaid } from './mermaid';

interface Props {
  chart: string;
}

/**
 * Static topology hero — used at the top of pattern pages that don't have an
 * animated counterpart. Visually matches the AnimatedPattern widget so every
 * pattern page leads with a topology diagram.
 */
export function TopologyHero({ chart }: Props) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-4 shadow-sm">
      <header className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-border bg-muted/50 text-muted-foreground">
          Topology
        </Badge>
        <span className="text-[12px] text-muted-foreground">
          Structural sketch — the live animation is not (yet) implemented for this pattern.
        </span>
      </header>
      <Mermaid chart={chart} />
    </section>
  );
}
