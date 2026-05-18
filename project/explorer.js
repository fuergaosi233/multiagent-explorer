/* Multi-Agent Explorer — engine.
   Renders nodes/edges from PATTERNS, plays per-step timeline animations,
   wires sidebar + controls. Auto-loops; users can pause / step / change speed.
*/

/* ─── i18n ─── */
const I18N = {
  zh: {
    'brand.tag': 'MULTIAGENT WIKI',
    'brand.title': 'MultiAgent',
    'brand.sub': '多 agent 协作模式、组件与实现 — 点击任一项查看动画演示。',
    'section.patterns': '13 种交互模式',
    'section.components': '核心组件',
    'section.impls': '主流实现',
    'section.protocols': '协议',
    'badge.soon': 'SOON',
    'grp.centralized': 'I · 中心化控制',
    'grp.flow': 'II · 流程与信息流',
    'grp.dialog': 'III · 对话与协作',
    'grp.decision': 'IV · 决策与质量',
    'grp.decentral': 'V · 去中心化 / 协议',
    'ph.components': 'Agent · Tool · Memory · Router · Aggregator · Blackboard · Critic · Selector — 文档构建中',
    'ph.impls': 'LangChain · AutoGen · CrewAI · OpenAI Agents SDK · Claude Code · ChatDev — 文档构建中',
    'ph.protocols': 'MCP · A2A · ANP — 详细规格构建中',
    'foot.deck': 'deck →',
    'lbl.mechanism': '核心机制 · MECHANISM',
    'lbl.aliases': '别名 · ALIASES',
    'lbl.fit': '适合 · FIT',
    'lbl.risks': '风险 · RISKS',
    'lbl.example': '示例 · IN PRACTICE',
    'lbl.variant': 'VARIANT',
    'lbl.speed': 'SPEED',
    'btn.restart': '重放',
    'btn.prev': '‹ 上一步',
    'btn.next': '下一步 ›',
    'btn.play': '播放',
    'btn.pause': '暂停',
    'code.toggle': '查看代码示意',
  },
  en: {
    'brand.tag': 'MULTIAGENT WIKI',
    'brand.title': 'MultiAgent',
    'brand.sub': 'Patterns, components & implementations — click any entry to watch it animate.',
    'section.patterns': '13 Interaction Patterns',
    'section.components': 'Core Components',
    'section.impls': 'Implementations',
    'section.protocols': 'Protocols',
    'badge.soon': 'SOON',
    'grp.centralized': 'I · Centralized Control',
    'grp.flow': 'II · Flow & Information',
    'grp.dialog': 'III · Dialog & Collaboration',
    'grp.decision': 'IV · Decision & Quality',
    'grp.decentral': 'V · Decentralized / Protocol',
    'ph.components': 'Agent · Tool · Memory · Router · Aggregator · Blackboard · Critic · Selector — docs in progress',
    'ph.impls': 'LangChain · AutoGen · CrewAI · OpenAI Agents SDK · Claude Code · ChatDev — docs in progress',
    'ph.protocols': 'MCP · A2A · ANP — detailed specs in progress',
    'foot.deck': 'deck →',
    'lbl.mechanism': 'MECHANISM',
    'lbl.aliases': 'ALIASES',
    'lbl.fit': 'FIT',
    'lbl.risks': 'RISKS',
    'lbl.example': 'IN PRACTICE',
    'lbl.variant': 'VARIANT',
    'lbl.speed': 'SPEED',
    'btn.restart': 'Replay',
    'btn.prev': '‹ Prev',
    'btn.next': 'Next ›',
    'btn.play': 'Play',
    'btn.pause': 'Pause',
    'code.toggle': 'View code',
  },
};
let LANG = localStorage.getItem('maw.lang') || 'zh';
function t(key) { return (I18N[LANG] && I18N[LANG][key]) || (I18N.zh[key]) || key; }
function applyI18n() {
  document.documentElement.setAttribute('lang', LANG);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // Update non-data-i18n labels that need it
  const mechK = document.querySelector('.mechanism .k');
  if (mechK) mechK.textContent = t('lbl.mechanism');
  document.querySelectorAll('.meta .card.fit .label').forEach(el => {
    el.firstChild.nodeValue = t('lbl.fit') + ' ';
  });
  document.querySelectorAll('.meta .card.risk .label').forEach(el => {
    el.firstChild.nodeValue = t('lbl.risks') + ' ';
  });
  const exLabel = document.querySelector('.meta .card.example .label');
  if (exLabel) {
    // first text node is the example label
    exLabel.firstChild.nodeValue = t('lbl.example') + ' ';
  }
  const varLabel = document.querySelector('#variants .label');
  if (varLabel) varLabel.textContent = t('lbl.variant');
  // controls
  const playLabel = document.getElementById('play-label');
  if (playLabel) playLabel.textContent = state.playing ? t('btn.pause') : t('btn.play');
  const btnPrev = document.getElementById('btn-prev');
  if (btnPrev) btnPrev.textContent = t('btn.prev');
  const btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.textContent = t('btn.next');
  // Restart button keeps icon + label  
  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    const labelNode = Array.from(btnRestart.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim());
    if (labelNode) labelNode.nodeValue = ' ' + t('btn.restart');
  }
  // Speed label
  const speedLabel = document.querySelector('.controls .speed-group label');
  if (speedLabel) speedLabel.textContent = t('lbl.speed');
  // Code details summary
  document.querySelectorAll('.meta .card.example details summary').forEach(s => {
    const lang = s.dataset.lang || '';
    s.textContent = t('code.toggle') + (lang ? ' · ' + lang : '');
  });
  // Aliases label
  const al = document.querySelector('.head .aliases b');
  if (al) al.textContent = t('lbl.aliases');
}

function wireSections() {
  document.querySelectorAll('aside .section-head').forEach(head => {
    head.addEventListener('click', () => {
      const sec = head.closest('.section');
      sec.classList.toggle('collapsed');
      const caret = head.querySelector('.caret');
      if (caret) caret.textContent = sec.classList.contains('collapsed') ? '▸' : '▾';
    });
  });
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.addEventListener('click', () => {
      LANG = b.dataset.lang;
      localStorage.setItem('maw.lang', LANG);
      document.querySelectorAll('.lang-switch button').forEach(x => {
        x.classList.toggle('active', x.dataset.lang === LANG);
      });
      applyI18n();
    });
  });
  // initial language state
  document.querySelectorAll('.lang-switch button').forEach(x => {
    x.classList.toggle('active', x.dataset.lang === LANG);
  });
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_DEFAULTS = { w: 140, h: 54 };
const ARROW_TRIM_EXTRA = 4;  // extra px past node edge so arrow tip isn't buried

/* ─── geometry helpers ─── */
function el(tag, attrs, parent) {
  const e = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) {
    if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
  }
  if (parent) parent.appendChild(e);
  return e;
}

function nodeCenter(n) {
  return { cx: n.x + (n.w||NODE_DEFAULTS.w)/2, cy: n.y + (n.h||NODE_DEFAULTS.h)/2 };
}

function trimToRectEdge(cx, cy, w, h, dx, dy) {
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return { x: cx, y: cy };
  const halfW = w/2, halfH = h/2;
  const len = Math.hypot(dx, dy);
  const ux = dx/len, uy = dy/len;
  const tx = Math.abs(ux) > 1e-6 ? halfW/Math.abs(ux) : Infinity;
  const ty = Math.abs(uy) > 1e-6 ? halfH/Math.abs(uy) : Infinity;
  const t = Math.min(tx, ty) + ARROW_TRIM_EXTRA;
  return { x: cx + ux*t, y: cy + uy*t };
}

function buildEdgePath(edge, nodesById) {
  const from = nodesById[edge.from], to = nodesById[edge.to];
  if (!from || !to) return '';
  const f = nodeCenter(from), t = nodeCenter(to);
  const fw = from.w||NODE_DEFAULTS.w, fh = from.h||NODE_DEFAULTS.h;
  const tw = to.w||NODE_DEFAULTS.w, th = to.h||NODE_DEFAULTS.h;
  const dx = t.cx - f.cx, dy = t.cy - f.cy;
  const start = trimToRectEdge(f.cx, f.cy, fw, fh, dx, dy);
  const end   = trimToRectEdge(t.cx, t.cy, tw, th, -dx, -dy);

  const curve = edge.curve || 0;
  if (curve === 0) {
    return `M${start.x},${start.y} L${end.x},${end.y}`;
  }
  const mx = (start.x + end.x)/2, my = (start.y + end.y)/2;
  const len = Math.hypot(end.x - start.x, end.y - start.y) || 1;
  const px = -(end.y - start.y)/len, py = (end.x - start.x)/len;
  const cx = mx + px*curve, cy = my + py*curve;
  return `M${start.x},${start.y} Q${cx},${cy} ${end.x},${end.y}`;
}

function midPointOfPath(pathEl) {
  const len = pathEl.getTotalLength();
  return pathEl.getPointAtLength(len/2);
}

/* ─── State ─── */
const state = {
  currentPattern: null,
  variantIdx: 0,
  step: 0,
  playing: false,
  speed: 1,
  timer: null,
  pathEls: {},      // edgeId → SVG path element
  nodeEls: {},      // nodeId → SVG <g> element
  bubbles: [],
  bubbleRAF: [],
};

function currentTimeline() {
  const p = state.currentPattern;
  if (p.variants && p.variants[state.variantIdx] && p.variants[state.variantIdx].timeline) {
    return p.variants[state.variantIdx].timeline;
  }
  return p.timeline;
}

/* ─── Sidebar build ─── */
function buildSidebar() {
  PATTERNS.forEach((p) => {
    const ul = document.querySelector(`ul[data-group="${p.group}"]`);
    if (!ul) return;
    const li = document.createElement('li');
    li.dataset.id = p.id;
    li.innerHTML = `<span class="num">${p.num}</span><span class="ttl">${p.title}</span>`;
    li.addEventListener('click', () => selectPattern(p.id));
    ul.appendChild(li);
  });
}

function escapeAttr(s){ return s.replace(/"/g,'&quot;'); }

function setActiveSidebar(id) {
  document.querySelectorAll('aside li').forEach(li => {
    li.classList.toggle('active', li.dataset.id === id);
  });
}

/* ─── Render diagram ─── */
function renderDiagram(pattern) {
  const svg = document.getElementById('diagram');
  // clear everything except <defs>
  Array.from(svg.children).forEach(c => { if (c.tagName !== 'defs') c.remove(); });

  state.pathEls = {};
  state.nodeEls = {};
  state.bubbles.forEach(b => b.remove());
  state.bubbles = [];

  // Layer groups: decorations → edges → bubbles → nodes
  const gDeco = el('g', { class:'deco-layer' }, svg);
  const gEdges = el('g', { class:'edges-layer' }, svg);
  const gBubbles = el('g', { class:'bubbles-layer' }, svg);
  const gNodes = el('g', { class:'nodes-layer' }, svg);
  state.layers = { gDeco, gEdges, gBubbles, gNodes };

  // Decorations (dashed boxes for "nested chat" etc.)
  (pattern.decorations || []).forEach(d => {
    if (d.type === 'rect') {
      el('rect', {
        x:d.x, y:d.y, width:d.w, height:d.h, rx:8, ry:8,
        fill:'none', stroke:'var(--accent)', 'stroke-width':1.2,
        'stroke-dasharray':'7 5', opacity:0.6
      }, gDeco);
      if (d.label) {
        const lblBg = el('rect', {
          x:d.x + 16, y:d.y - 10, width:96, height:20, rx:2, ry:2,
          fill:'var(--bg-ink)'
        }, gDeco);
        el('text', {
          x:d.x + 64, y:d.y + 1, 'text-anchor':'middle','dominant-baseline':'central',
          'font-family':'var(--mono)', 'font-size':11, fill:'var(--accent)',
          'letter-spacing':'0.18em',
        }, gDeco).textContent = d.label;
      }
    }
  });

  // Build node lookup
  const nodesById = {};
  pattern.nodes.forEach(n => nodesById[n.id] = n);
  state.nodesById = nodesById;

  // Edges
  Object.entries(pattern.edges).forEach(([eid, edge]) => {
    const d = buildEdgePath(edge, nodesById);
    const path = el('path', {
      d, class: 'edge' + (edge.dashed ? ' dashed' : ''),
      'data-eid': eid, fill:'none',
    }, gEdges);
    state.pathEls[eid] = path;

    if (edge.label) {
      const mid = midPointOfPath(path);
      // background pill behind label
      const fontSize = 11;
      const padX = 6, padY = 2;
      const charW = 6.5;
      const w = edge.label.length * charW + padX*2;
      const h = fontSize + padY*2;
      el('rect', {
        x: mid.x - w/2, y: mid.y - h/2, width:w, height:h, rx:2, ry:2,
        class:'edge-label-bg', 'data-eid':eid
      }, gEdges);
      el('text', {
        x: mid.x, y: mid.y, class:'edge-label', 'data-eid':eid,
        'text-anchor':'middle','dominant-baseline':'central',
      }, gEdges).textContent = edge.label;
    }
  });

  // Nodes
  pattern.nodes.forEach(n => {
    const w = n.w||NODE_DEFAULTS.w, h = n.h||NODE_DEFAULTS.h;
    const g = el('g', { class:`node kind-${n.kind||'plain'}`, 'data-id': n.id }, gNodes);
    state.nodeEls[n.id] = g;

    if (n.kind === 'store') {
      // circle
      el('circle', {
        cx: n.x + w/2, cy: n.y + h/2, r: w/2,
        class:'node-rect',  // reuses class for styling consistency
      }, g);
    } else {
      el('rect', {
        x:n.x, y:n.y, width:w, height:h, class:'node-rect',
      }, g);
    }

    if (n.sub) {
      el('text', {
        x: n.x + w/2, y: n.y + h/2 - 8, class:'node-label',
      }, g).textContent = n.label;
      el('text', {
        x: n.x + w/2, y: n.y + h/2 + 12, class:'node-sub',
      }, g).textContent = n.sub;
    } else {
      el('text', {
        x: n.x + w/2, y: n.y + h/2, class:'node-label',
      }, g).textContent = n.label;
    }
  });
}

/* ─── Animation ─── */
function clearEdgeStates() {
  document.querySelectorAll('svg.diagram .edge').forEach(p => {
    p.classList.remove('firing', 'done');
  });
  document.querySelectorAll('svg.diagram .edge-label').forEach(t => t.classList.remove('show'));
}

function clearNodeStates() {
  Object.values(state.nodeEls).forEach(n => {
    n.classList.remove('active','dim');
  });
}

function activateNodes(ids) {
  (ids || []).forEach(id => {
    if (state.nodeEls[id]) state.nodeEls[id].classList.add('active');
  });
}

function dimNodes(ids) {
  (ids || []).forEach(id => {
    if (state.nodeEls[id]) state.nodeEls[id].classList.add('dim');
  });
}

function spawnTokenStream(path, duration, reverse=false, count=5) {
  if (!path) return;
  const len = path.getTotalLength();
  const start = performance.now();
  const tokens = [];
  for (let i = 0; i < count; i++) {
    const tk = el('circle', {
      cx: 0, cy: 0, r: 3.5,
      class: 'msg-token' + (reverse ? ' return' : ''),
      opacity: 0,
    }, state.layers.gBubbles);
    tokens.push(tk);
    state.bubbles.push(tk);
  }

  // each token: starts at i*stagger fraction, takes (1 - stagger*(count-1)) fraction to traverse
  const stagger = 0.10;
  const traverseTime = duration * (1 - stagger * (count-1));
  const totalTime = duration;

  function tick(now) {
    const elapsed = now - start;
    let anyAlive = false;
    tokens.forEach((tk, i) => {
      const tStart = i * stagger * duration;
      const t = (elapsed - tStart) / traverseTime;
      if (t < 0 || t > 1) { tk.setAttribute('opacity', 0); return; }
      anyAlive = true;
      const u = reverse ? (1 - t) : t;
      const pt = path.getPointAtLength(u * len);
      tk.setAttribute('cx', pt.x);
      tk.setAttribute('cy', pt.y);
      // fade in/out: smooth bezier-ish opacity
      const fade = Math.min(t * 5, 1, (1-t) * 5);
      tk.setAttribute('opacity', Math.max(0, fade) * 0.95);
    });
    if (elapsed < totalTime + 200) {
      requestAnimationFrame(tick);
    } else {
      tokens.forEach(t => t.remove());
    }
  }
  requestAnimationFrame(tick);
}

/* legacy single-bubble — used for handoffs / special cases via edge.kind==='bubble' */
function spawnBubble(path, duration, reverse=false) {
  if (!path) return;
  const len = path.getTotalLength();
  const bubble = el('circle', {
    cx: 0, cy: 0, r: 7,
    class: 'msg-bubble' + (reverse ? ' return' : ''),
  }, state.layers.gBubbles);
  state.bubbles.push(bubble);

  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const u = reverse ? (1 - t) : t;
    const pt = path.getPointAtLength(u * len);
    bubble.setAttribute('cx', pt.x);
    bubble.setAttribute('cy', pt.y);
    if (t < 1 && bubble.parentNode) {
      state.bubbleRAF.push(requestAnimationFrame(tick));
    } else {
      setTimeout(() => bubble.remove(), 120);
    }
  }
  state.bubbleRAF.push(requestAnimationFrame(tick));
}

function fireEdge(edgeIdRaw, duration) {
  const reverse = edgeIdRaw.startsWith('!');
  const eid = reverse ? edgeIdRaw.slice(1) : edgeIdRaw;
  const path = state.pathEls[eid];
  if (!path) return;
  path.classList.add('firing');
  const lbl = document.querySelector(`svg.diagram .edge-label[data-eid="${eid}"]`);
  if (lbl) lbl.classList.add('show');

  // Choose animation: token stream (default) or single bubble (for control messages)
  const edge = state.currentPattern.edges[eid];
  const kind = edge && edge.anim;
  if (kind === 'bubble') {
    spawnBubble(path, duration, reverse);
  } else {
    spawnTokenStream(path, duration, reverse, kind === 'sparse' ? 3 : 5);
  }

  setTimeout(() => {
    path.classList.remove('firing');
    path.classList.add('done');
    if (lbl) lbl.classList.remove('show');
  }, duration);
}

function applyStep(step) {
  clearNodeStates();
  activateNodes(step.activate);
  dimNodes(step.dim);
  setCaption(step.caption);

  const baseDur = step.duration || 1500;
  const dur = baseDur / state.speed;
  // fire edges concurrently
  (step.fire || []).forEach(eid => fireEdge(eid, Math.min(dur * 0.85, 1400)));

  return dur;
}

function setCaption(text) {
  document.getElementById('caption').innerHTML = text || '—';
  const tl = currentTimeline();
  document.getElementById('step-cur').textContent = state.step + 1;
  document.getElementById('step-tot').textContent = tl.length;
  document.querySelectorAll('.controls .timeline .dot').forEach((d, i) => {
    d.classList.toggle('current', i === state.step);
    d.classList.toggle('done', i < state.step);
  });
}

function scheduleStep() {
  if (state.timer) { clearTimeout(state.timer); state.timer = null; }
  if (!state.currentPattern) return;
  const tl = currentTimeline();
  const step = tl[state.step];
  const dur = applyStep(step);
  state.timer = setTimeout(() => {
    state.step = (state.step + 1) % tl.length;
    if (state.step === 0) clearEdgeStates();
    if (state.playing) scheduleStep();
  }, dur);
}

function play() {
  if (state.playing) return;
  state.playing = true;
  setPlayIcon(true);
  scheduleStep();
}

function pause() {
  state.playing = false;
  if (state.timer) { clearTimeout(state.timer); state.timer = null; }
  setPlayIcon(false);
}

function setPlayIcon(playing) {
  const icon = document.getElementById('play-icon');
  const label = document.getElementById('play-label');
  if (playing) {
    icon.innerHTML = '<rect x="3" y="2" width="3.5" height="12" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor"/>';
    label.textContent = '暂停';
  } else {
    icon.innerHTML = '<path d="M3 2v12l11-6z" fill="currentColor"/>';
    label.textContent = '播放';
  }
}

function gotoStep(i) {
  pause();
  const tl = currentTimeline();
  state.step = ((i % tl.length) + tl.length) % tl.length;
  clearEdgeStates();
  clearNodeStates();
  for (let k = 0; k < state.step; k++) {
    (tl[k].fire || []).forEach(eraw => {
      const eid = eraw.startsWith('!') ? eraw.slice(1) : eraw;
      const path = state.pathEls[eid];
      if (path) path.classList.add('done');
    });
  }
  applyStep(tl[state.step]);
}

function nextStep() { gotoStep(state.step + 1); }
function prevStep() { gotoStep(state.step - 1); }
function restart() {
  pause();
  state.step = 0;
  clearEdgeStates();
  play();
}

/* ─── Pattern selection ─── */
function selectPattern(id) {
  const p = PATTERNS.find(x => x.id === id);
  if (!p) return;
  pause();
  state.currentPattern = p;
  state.step = 0;
  setActiveSidebar(id);

  // Head
  document.getElementById('grp-label').textContent = p.grpLabel;
  document.getElementById('pat-num').textContent = 'PATTERN ' + p.num;
  const titleEl = document.getElementById('pat-title');
  titleEl.firstChild.nodeValue = p.title;
  document.getElementById('pat-title-en').textContent = p.titleEn || '';
  document.getElementById('pat-aliases').textContent = p.aliases;
  document.getElementById('pat-mechanism').innerHTML = p.mechanism;

  // Meta cards
  document.getElementById('pat-fit').innerHTML = p.fit;
  document.getElementById('pat-risks').innerHTML = p.risks;
  document.getElementById('pat-ex-tag').textContent = p.example.tag;
  document.getElementById('pat-ex-body').innerHTML = p.example.body;

  // Code accordion
  renderCode(p);

  // Variants picker
  renderVariants(p);
  state.variantIdx = 0;

  // Diagram
  renderDiagram(p);

  // Timeline dots
  buildTimelineDots();

  // Re-apply i18n for dynamically created text
  applyI18n();

  if (location.hash !== '#' + id) {
    history.replaceState(null, '', '#' + id);
  }

  play();
}

/* ─── Helpers for selectPattern ─── */
function renderCode(p) {
  const exCard = document.querySelector('.meta .card.example');
  const old = exCard.querySelector('details');
  if (old) old.remove();
  if (!p.code) return;

  const det = document.createElement('details');
  const sum = document.createElement('summary');
  sum.dataset.lang = p.code.lang;
  sum.textContent = t('code.toggle') + ' · ' + p.code.lang;
  det.appendChild(sum);
  const pre = document.createElement('pre');
  pre.innerHTML = '<code>' + p.code.snippet + '</code>';
  det.appendChild(pre);
  exCard.appendChild(det);
}

function renderVariants(p) {
  const wrap = document.getElementById('variants');
  wrap.innerHTML = '';
  if (!p.variants || p.variants.length < 2) {
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = 'VARIANT';
  wrap.appendChild(label);
  p.variants.forEach((v, i) => {
    const chip = document.createElement('span');
    chip.className = 'chip' + (i === state.variantIdx ? ' active' : '');
    chip.innerHTML = v.label + (v.sub ? `<span class="alt">${v.sub}</span>` : '');
    chip.addEventListener('click', () => selectVariant(i));
    wrap.appendChild(chip);
  });
}

function selectVariant(i) {
  if (i === state.variantIdx) return;
  pause();
  state.variantIdx = i;
  // Update chip active state
  document.querySelectorAll('#variants .chip').forEach((c, idx) => {
    c.classList.toggle('active', idx === i);
  });
  state.step = 0;
  clearEdgeStates();
  clearNodeStates();
  buildTimelineDots();
  play();
}

function buildTimelineDots() {
  const tl = currentTimeline();
  const tlEl = document.getElementById('timeline');
  tlEl.innerHTML = '';
  tl.forEach((_, i) => {
    if (i > 0) {
      const fill = document.createElement('div');
      fill.className = 'dot-fill';
      tlEl.appendChild(fill);
    }
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.title = `Step ${i+1}`;
    dot.addEventListener('click', () => gotoStep(i));
    tlEl.appendChild(dot);
  });
}

/* ─── Wire controls ─── */
function wireControls() {
  document.getElementById('btn-play').addEventListener('click', () => {
    state.playing ? pause() : play();
  });
  document.getElementById('btn-restart').addEventListener('click', restart);
  document.getElementById('btn-prev').addEventListener('click', prevStep);
  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('speed').addEventListener('change', (e) => {
    state.speed = parseFloat(e.target.value);
    if (state.playing) {
      // restart current step timer with new speed
      clearTimeout(state.timer);
      scheduleStep();
    }
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); state.playing ? pause() : play(); }
    else if (e.key === 'ArrowRight' || e.key === 'l') nextStep();
    else if (e.key === 'ArrowLeft' || e.key === 'j') prevStep();
    else if (e.key === 'r') restart();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = PATTERNS.findIndex(p => p.id === state.currentPattern.id);
      selectPattern(PATTERNS[(i+1) % PATTERNS.length].id);
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = PATTERNS.findIndex(p => p.id === state.currentPattern.id);
      selectPattern(PATTERNS[(i-1+PATTERNS.length) % PATTERNS.length].id);
    }
  });
}

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  wireControls();
  wireSections();
  applyI18n();
  const initial = (location.hash || '#supervisor').slice(1);
  const found = PATTERNS.find(p => p.id === initial);
  selectPattern(found ? found.id : 'supervisor');
});
