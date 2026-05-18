'use client';
import { useState } from 'react';
import { PATTERNS } from '@/data/patterns';
import type { PatternGroup } from '@/types/pattern';

const GROUPS: { key: PatternGroup; label: string; i18n: string }[] = [
  { key: 'centralized', label: 'I · Centralized Control',    i18n: 'grp.centralized' },
  { key: 'flow',        label: 'II · Flow & Information',    i18n: 'grp.flow' },
  { key: 'dialog',      label: 'III · Dialog & Collaboration', i18n: 'grp.dialog' },
  { key: 'decision',    label: 'IV · Decision & Quality',    i18n: 'grp.decision' },
  { key: 'decentral',   label: 'V · Decentralized / Protocol', i18n: 'grp.decentral' },
];

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

export default function Sidebar({ activeId, onSelect }: Props) {
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    patterns: true,
    components: false,
    impls: false,
    protocols: false,
  });

  function toggleSection(key: string) {
    setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <aside className="rail">
      <div className="brand">
        <div className="eyebrow">
          <span className="dot" />
          <span>MULTIAGENT WIKI</span>
        </div>
        <h1>MultiAgent</h1>
        <div className="sub">
          Patterns, components &amp; implementations — click any entry to watch it animate.
        </div>
      </div>

      {/* Patterns section */}
      <div className={`section${sectionsOpen.patterns ? '' : ' collapsed'}`}>
        <h2 className="section-head" onClick={() => toggleSection('patterns')}>
          <span className="caret">{sectionsOpen.patterns ? '▾' : '▸'}</span>
          <span>13 Interaction Patterns</span>
          <span className="count">13</span>
        </h2>
        <div className="section-body">
          {GROUPS.map(grp => {
            const items = PATTERNS.filter(p => p.group === grp.key);
            return (
              <div className="group" key={grp.key}>
                <h3>{grp.label}</h3>
                <ul>
                  {items.map(p => (
                    <li
                      key={p.id}
                      className={p.id === activeId ? 'active' : ''}
                      onClick={() => onSelect(p.id)}
                    >
                      <span className="num">{p.num}</span>
                      <span className="ttl">{p.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Components section */}
      <div className={`section${sectionsOpen.components ? '' : ' collapsed'}`}>
        <h2 className="section-head" onClick={() => toggleSection('components')}>
          <span className="caret">{sectionsOpen.components ? '▾' : '▸'}</span>
          <span>Core Components</span>
          <span className="count soon">SOON</span>
        </h2>
        <div className="section-body">
          <div className="placeholder">
            Agent · Tool · Memory · Router · Aggregator · Blackboard · Critic · Selector — docs in progress
          </div>
        </div>
      </div>

      {/* Implementations section */}
      <div className={`section${sectionsOpen.impls ? '' : ' collapsed'}`}>
        <h2 className="section-head" onClick={() => toggleSection('impls')}>
          <span className="caret">{sectionsOpen.impls ? '▾' : '▸'}</span>
          <span>Implementations</span>
          <span className="count soon">SOON</span>
        </h2>
        <div className="section-body">
          <div className="placeholder">
            LangChain · AutoGen · CrewAI · OpenAI Agents SDK · Claude Code · ChatDev — docs in progress
          </div>
        </div>
      </div>

      {/* Protocols section */}
      <div className={`section${sectionsOpen.protocols ? '' : ' collapsed'}`}>
        <h2 className="section-head" onClick={() => toggleSection('protocols')}>
          <span className="caret">{sectionsOpen.protocols ? '▾' : '▸'}</span>
          <span>Protocols</span>
          <span className="count">3</span>
        </h2>
        <div className="section-body">
          <div className="placeholder">
            MCP · A2A · ANP — detailed specs in progress
          </div>
        </div>
      </div>

      <div className="foot">
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
          Multi-Agent Wiki
        </span>
      </div>
    </aside>
  );
}
