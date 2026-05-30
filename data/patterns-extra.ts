import type { Pattern } from '@/types/pattern';

/**
 * Animated counterparts for the wiki patterns that previously rendered as
 * static mermaid blocks. Visual conventions follow the originals in
 * `data/patterns.ts`:
 *
 *   • `user`    — the end-user / external trigger (always far-left)
 *   • `accent`  — the coordinator / router / gate of the pattern
 *   • `dark`    — the final output / accepted artifact
 *   • `store`   — shared state (blackboard, environment, registry)
 *   • `bus`     — event bus / market / mediator
 *
 * Canvas is 900×540. Captions use <b> for actors and <code> for tool /
 * protocol / function names.
 */

export const EXTRA_PATTERNS: Pattern[] = [
  /* ─── agents-as-tools ─── */
  {
    id: 'agents-as-tools', group: 'centralized', num: '02b', grpLabel: 'CENTRALIZED CONTROL',
    title: 'Agents-as-tools', titleEn: 'Specialists wrapped as callable tools',
    aliases: 'subagents-as-tools / tool-wrapped specialists',
    mechanism: 'Specialist agents are exposed as plain tool calls; the host keeps the conversation and decides when to invoke each tool.',
    nodes: [
      { id:'user', x:40,  y:240, w:100, label:'User', kind:'user' },
      { id:'host', x:230, y:230, w:180, label:'Host Agent', sub:'keeps control', kind:'accent' },
      { id:'t1',   x:580, y:70,  w:200, label:'search_agent', sub:'tool' },
      { id:'t2',   x:580, y:230, w:200, label:'review_agent', sub:'tool' },
      { id:'t3',   x:580, y:390, w:200, label:'doc_agent',    sub:'tool' },
    ],
    edges: {
      'u-h':  { from:'user', to:'host', label:'request' },
      'h-t1': { from:'host', to:'t1', label:'tool call', curve:-15 },
      'h-t2': { from:'host', to:'t2', label:'tool call' },
      'h-t3': { from:'host', to:'t3', label:'tool call', curve:15 },
    },
    timeline: [
      { caption:'<b>User</b> asks the <b>Host Agent</b>.', fire:['u-h'], activate:['user','host'] },
      { caption:'Host decides to invoke <code>search_agent</code> as a tool.', fire:['h-t1'], activate:['host','t1'] },
      { caption:'Tool returns evidence; <b>conversation stays with Host</b>.', fire:['!h-t1'], activate:['host'] },
      { caption:'Host then invokes <code>review_agent</code>.', fire:['h-t2'], activate:['host','t2'] },
      { caption:'Review returns; Host calls <code>doc_agent</code> for summary.', fire:['!h-t2','h-t3'], activate:['host','t3'] },
      { caption:'All tools done — Host synthesizes the reply back to <b>User</b>.', fire:['!h-t3','!u-h'], activate:['host','user'] },
    ],
    fit: 'Single-shot specialist queries · retrieval sub-tasks · code review · summarization tools the host stays in charge of.',
    risks: 'Tool descriptions too broad → host invokes indiscriminately. Sub-agents return long prose instead of structured results.',
    example: { tag:'TYPESCRIPT', body:'<code>tool({ name:"search_agent", schema, execute: q => searchAgent.run(q) })</code> exposes the specialist as a normal tool. The host\'s prompt declares <b>when</b> to call it.' },
  },

  /* ─── graph-workflow ─── */
  {
    id: 'graph-workflow', group:'centralized', num:'07', grpLabel:'CENTRALIZED CONTROL',
    title:'Graph / State Machine', titleEn:'Explicit workflow over LLM improvisation',
    aliases:'workflow / state machine / langgraph',
    mechanism:'The flow is a graph of nodes + edges + state. The LLM may pick an edge but cannot bypass the machine.',
    nodes: [
      { id:'plan',     x:40,  y:240, w:140, label:'Plan',  kind:'accent' },
      { id:'research', x:230, y:60,  w:150, label:'Research' },
      { id:'code',     x:230, y:420, w:150, label:'Code' },
      { id:'test',     x:420, y:420, w:140, label:'Test' },
      { id:'review',   x:600, y:240, w:150, label:'Review' },
      { id:'hitl',     x:420, y:60,  w:160, label:'Human Approval', sub:'risky branch' },
      { id:'final',    x:780, y:240, w:90,  label:'Final', kind:'dark' },
    ],
    edges: {
      'p-r':   { from:'plan', to:'research', label:'research', curve:-20 },
      'p-c':   { from:'plan', to:'code',     label:'code',     curve:20 },
      'r-rv':  { from:'research', to:'review' },
      'c-t':   { from:'code', to:'test' },
      't-c':   { from:'test', to:'code', label:'fail', dashed:true, curve:40 },
      't-rv':  { from:'test', to:'review', label:'pass' },
      'rv-h':  { from:'review', to:'hitl', label:'risky', dashed:true, curve:-20 },
      'h-f':   { from:'hitl', to:'final' },
      'rv-f':  { from:'review', to:'final', label:'safe' },
    },
    timeline: [
      { caption:'Enter the workflow at the <b>Plan</b> node.', activate:['plan'] },
      { caption:'Plan picks the <b>Code</b> branch (the LLM chose, but only among allowed edges).', fire:['p-c'], activate:['plan','code'] },
      { caption:'Code finishes → transition to <b>Test</b>.', fire:['c-t'], activate:['code','test'] },
      { caption:'Test fails → state machine routes back to <b>Code</b> deterministically.', fire:['t-c'], activate:['test','code'] },
      { caption:'Code revises and Test <b>passes</b> this time.', fire:['c-t','t-rv'], activate:['test','review'] },
      { caption:'Review flags the change as <b>risky</b> → goes to Human Approval.', fire:['rv-h'], activate:['review','hitl'] },
      { caption:'Approval granted → transition to <b>Final</b>; checkpoint persisted.', fire:['h-f'], activate:['hitl','final'] },
    ],
    fit:'Production systems · audit requirements · resumable long tasks · multi-stage pipelines with explicit gates.',
    risks:'Graph too rigid → loses LLM flexibility. Sloppy state design → tasks can\'t resume after restart.',
    example:{ tag:'LANGGRAPH', body:'<code>StateGraph</code> defines named nodes and conditional edges; checkpoints persist state between runs so tasks survive a crash.' },
  },

  /* ─── generator-critic ─── */
  {
    id: 'generator-critic', group:'decision', num:'11', grpLabel:'DECISION & EVAL',
    title:'Generator-Critic', titleEn:'Produce + verify, separate models',
    aliases:'critic / verifier / reviewer',
    mechanism:'One agent generates a draft; another, with different prompt and tools, critiques it. The generator revises against the feedback.',
    nodes: [
      { id:'task',   x:40,  y:240, w:120, label:'Task', kind:'user' },
      { id:'gen',    x:220, y:240, w:160, label:'Generator', kind:'accent' },
      { id:'draft',  x:440, y:80,  w:140, label:'Draft' },
      { id:'critic', x:440, y:400, w:160, label:'Critic', sub:'tests · lint · diff' },
      { id:'out',    x:680, y:240, w:160, label:'Accepted', kind:'dark' },
    ],
    edges: {
      't-g':   { from:'task', to:'gen' },
      'g-d':   { from:'gen', to:'draft', curve:-20 },
      'd-c':   { from:'draft', to:'critic', curve:20 },
      'c-g':   { from:'critic', to:'gen', label:'feedback', dashed:true, curve:30 },
      'c-out': { from:'critic', to:'out', label:'pass' },
    },
    timeline: [
      { caption:'A <b>Task</b> arrives at the <b>Generator</b>.', fire:['t-g'], activate:['task','gen'] },
      { caption:'Generator produces a <b>Draft</b>.', fire:['g-d'], activate:['gen','draft'] },
      { caption:'Draft moves to the <b>Critic</b> (different prompt, has tests / lint / diff).', fire:['d-c'], activate:['draft','critic'] },
      { caption:'Critic finds an issue and sends structured <b>feedback</b> back.', fire:['c-g'], activate:['critic','gen'] },
      { caption:'Generator revises the Draft.', fire:['g-d'], activate:['gen','draft'] },
      { caption:'Critic re-checks — this round it <b>passes</b>.', fire:['d-c','c-out'], activate:['critic','out'] },
    ],
    fit:'Code generation + review · document drafting + edit · plan + verify · test repair loops.',
    risks:'Critic only does style commentary, not verification. Generator + critic share the same context → correlated errors.',
    example:{ tag:'CODING AGENT', body:'<code>Coder</code> writes a diff; <code>TestRunner</code> executes the suite and returns failing assertions. The diff is rejected until the suite is green.' },
  },

  /* ─── refinement-loop ─── */
  {
    id: 'refinement-loop', group:'decision', num:'12', grpLabel:'DECISION & EVAL',
    title:'Refinement Loop', titleEn:'Generate → evaluate → revise',
    aliases:'evaluator-optimizer / self-improve / iterate-until',
    mechanism:'Repeat generate → evaluate → revise until an exit condition (score, tests, approval) or the budget runs out.',
    nodes: [
      { id:'in',   x:40,  y:240, w:100, label:'Input', kind:'user' },
      { id:'gen',  x:200, y:240, w:140, label:'Generate', kind:'accent' },
      { id:'eval', x:400, y:240, w:140, label:'Evaluate', sub:'rubric · tests' },
      { id:'fb',   x:400, y:80,  w:160, label:'Feedback', sub:'edits + scores' },
      { id:'out',  x:620, y:160, w:160, label:'Return', kind:'dark' },
      { id:'bud',  x:620, y:340, w:200, label:'Budget exceeded', sub:'return w/ warning' },
    ],
    edges: {
      'i-g':   { from:'in', to:'gen' },
      'g-e':   { from:'gen', to:'eval' },
      'e-fb':  { from:'eval', to:'fb', label:'fail', dashed:true, curve:-20 },
      'fb-g':  { from:'fb', to:'gen', dashed:true, curve:-30 },
      'e-o':   { from:'eval', to:'out', label:'pass', curve:-15 },
      'e-b':   { from:'eval', to:'bud', label:'over budget', dashed:true, curve:15 },
    },
    timeline: [
      { caption:'<b>Input</b> enters the loop.', fire:['i-g'], activate:['in','gen'] },
      { caption:'Round 1 — <b>Generate</b> a candidate → <b>Evaluate</b>.', fire:['g-e'], activate:['gen','eval'] },
      { caption:'Eval fails → emits structured <b>Feedback</b>.', fire:['e-fb'], activate:['eval','fb'] },
      { caption:'Feedback is applied; another generate round runs.', fire:['fb-g','g-e'], activate:['gen','eval'] },
      { caption:'Round 2 passes the rubric → <b>Return</b>.', fire:['e-o'], activate:['eval','out'] },
      { caption:'If budget had been hit first, the loop returns the current state with a warning.', dim:['out'], activate:['bud'], fire:['e-b'] },
    ],
    fit:'Test-driven code repair · document polishing · prompt tuning · plan iteration.',
    risks:'Vague exit conditions cause infinite loops. Each round can introduce new bugs. Optimizes evaluator score, not the real goal.',
    example:{ tag:'GOOGLE ADK', body:'<code>evaluator-optimizer</code> pattern: a worker proposes, an evaluator scores, the loop exits at threshold or after N rounds.' },
  },

  /* ─── event-bus-pubsub ─── */
  {
    id: 'event-bus-pubsub', group:'flow', num:'15', grpLabel:'INFORMATION FLOW',
    title:'Event Bus / Pub-Sub', titleEn:'Async messaging, not direct calls',
    aliases:'pub-sub / queue / topic / event log',
    mechanism:'Agents publish events to a bus; subscribers receive them asynchronously. Orchestrators recover state from the event log.',
    nodes: [
      { id:'a',   x:40,  y:80,  w:180, label:'Agent A', sub:'publisher' },
      { id:'b',   x:40,  y:400, w:180, label:'Agent B', sub:'publisher' },
      { id:'bus', x:340, y:240, w:200, label:'Event Bus', sub:'topics · queues', kind:'bus' },
      { id:'c',   x:660, y:80,  w:200, label:'Subscriber C' },
      { id:'d',   x:660, y:240, w:200, label:'Subscriber D' },
      { id:'o',   x:660, y:400, w:200, label:'Observability', sub:'trace · metrics' },
    ],
    edges: {
      'a-bus': { from:'a',   to:'bus', label:'publish', curve:20 },
      'b-bus': { from:'b',   to:'bus', label:'publish', curve:-20 },
      'bus-c': { from:'bus', to:'c',   label:'deliver', curve:-15 },
      'bus-d': { from:'bus', to:'d' },
      'bus-o': { from:'bus', to:'o',   label:'mirror', dashed:true, curve:15 },
    },
    timeline: [
      { caption:'<b>Agent A</b> publishes an event (<code>task.started</code>) to the <b>Event Bus</b>.', fire:['a-bus'], activate:['a','bus'] },
      { caption:'Bus fans out to all subscribers of the topic.', fire:['bus-c','bus-d'], activate:['bus','c','d'] },
      { caption:'Observability mirrors every event for trace + metrics.', fire:['bus-o'], activate:['bus','o'] },
      { caption:'Later, <b>Agent B</b> publishes a different event.', fire:['b-bus'], activate:['b','bus'] },
      { caption:'Subscribers process independently; failures land in a dead-letter queue, not the publisher.', activate:['c','d','o'] },
    ],
    fit:'Platform-scale async work · long-running tasks · observability · cross-service agent orchestration.',
    risks:'Events without schema; duplicate consumption causes duplicate side effects; debugging async pipelines is painful.',
    example:{ tag:'AGENT PLATFORM', body:'Every agent action emits a structured event; the orchestrator subscribes and the trace UI subscribes — no direct coupling.' },
  },

  /* ─── mixture-of-agents ─── */
  {
    id: 'mixture-of-agents', group:'decision', num:'18', grpLabel:'DECISION & EVAL',
    title:'Mixture-of-Agents', titleEn:'Layered ensemble',
    aliases:'MoA / layered ensemble',
    mechanism:'Multiple models or agents generate in layers; each subsequent layer reads several prior-layer outputs and improves on them.',
    nodes: [
      { id:'q',  x:40,  y:240, w:100, label:'Prompt', kind:'user' },
      { id:'l1a',x:200, y:60,  w:130, label:'L1·A' },
      { id:'l1b',x:200, y:240, w:130, label:'L1·B' },
      { id:'l1c',x:200, y:420, w:130, label:'L1·C' },
      { id:'l2a',x:430, y:140, w:130, label:'L2·A', kind:'accent' },
      { id:'l2b',x:430, y:340, w:130, label:'L2·B', kind:'accent' },
      { id:'agg',x:640, y:240, w:140, label:'Aggregator' },
      { id:'out',x:820, y:240, w:60,  label:'Final', kind:'dark' },
    ],
    edges: {
      'q-1a':   { from:'q',   to:'l1a', curve:-25 },
      'q-1b':   { from:'q',   to:'l1b' },
      'q-1c':   { from:'q',   to:'l1c', curve:25 },
      '1a-2a':  { from:'l1a', to:'l2a' },
      '1b-2a':  { from:'l1b', to:'l2a', curve:-10 },
      '1c-2a':  { from:'l1c', to:'l2a', curve:-25 },
      '1a-2b':  { from:'l1a', to:'l2b', curve:25 },
      '1b-2b':  { from:'l1b', to:'l2b', curve:10 },
      '1c-2b':  { from:'l1c', to:'l2b' },
      '2a-agg': { from:'l2a', to:'agg' },
      '2b-agg': { from:'l2b', to:'agg' },
      'agg-o':  { from:'agg', to:'out' },
    },
    timeline: [
      { caption:'<b>Prompt</b> is broadcast to <b>Layer 1</b> (diverse models / prompts).', fire:['q-1a','q-1b','q-1c'], activate:['q','l1a','l1b','l1c'] },
      { caption:'Each L1 agent produces a candidate independently.', activate:['l1a','l1b','l1c'] },
      { caption:'<b>Layer 2</b> reads all three L1 outputs and refines (each L2 agent sees them all).', fire:['1a-2a','1b-2a','1c-2a','1a-2b','1b-2b','1c-2b'], activate:['l2a','l2b'] },
      { caption:'The <b>Aggregator</b> deduplicates, ranks, and resolves conflicts across L2 outputs.', fire:['2a-agg','2b-agg'], activate:['agg'] },
      { caption:'Aggregator returns the <b>Final</b> answer — usually 2–3 layers is enough.', fire:['agg-o'], activate:['agg','out'] },
    ],
    fit:'Multi-model fusion · high-quality generation · creative tasks · answer synthesis.',
    risks:'Outputs too correlated → diminishing returns. Latency and cost scale with layers × agents.',
    example:{ tag:'PAPER', body:'<code>Mixture-of-Agents</code> stacks open models in two layers and outperforms a single frontier model on several benchmarks.' },
  },

  /* ─── human-in-the-loop ─── */
  {
    id: 'human-in-the-loop', group:'centralized', num:'19', grpLabel:'CENTRALIZED CONTROL',
    title:'Human-in-the-Loop', titleEn:'Approval, correction, final decision',
    aliases:'HITL / approval gate / oversight',
    mechanism:'Risky actions are routed through a human; the human can approve, reject (with feedback), or ask for clarification.',
    nodes: [
      { id:'act',  x:40,  y:240, w:180, label:'Agent Action', kind:'accent' },
      { id:'risk', x:260, y:240, w:160, label:'Risk Check', sub:'policy' },
      { id:'exec', x:480, y:80,  w:160, label:'Execute', kind:'dark' },
      { id:'h',    x:480, y:240, w:200, label:'Human Approval', kind:'user' },
      { id:'rev',  x:480, y:400, w:200, label:'Revise Plan', sub:'with feedback' },
    ],
    edges: {
      'a-r':   { from:'act',  to:'risk' },
      'r-e':   { from:'risk', to:'exec', label:'low risk', curve:-20 },
      'r-h':   { from:'risk', to:'h',    label:'risky' },
      'h-e':   { from:'h',    to:'exec', label:'approve', curve:-15 },
      'h-rev': { from:'h',    to:'rev',  label:'reject', dashed:true, curve:15 },
      'rev-a': { from:'rev',  to:'act',  dashed:true, curve:60 },
    },
    timeline: [
      { caption:'Agent proposes an <b>Action</b>; <b>Risk Check</b> classifies it.', fire:['a-r'], activate:['act','risk'] },
      { caption:'Low-risk path: execute directly with a logged trace.', fire:['r-e'], activate:['risk','exec'] },
      { caption:'Higher-risk action — gate it to <b>Human Approval</b>.', fire:['r-h'], activate:['risk','h'], dim:['exec'] },
      { caption:'Human approves → execute with full audit context.', fire:['h-e'], activate:['h','exec'] },
      { caption:'Or human rejects with feedback → agent goes back to <b>Revise Plan</b>.', fire:['h-rev','rev-a'], activate:['rev','act'], dim:['exec','h'] },
    ],
    fit:'Shell · file writes · commits · deploys · payments · privacy / legal actions.',
    risks:'Approval cards without scope, diff, rollback → human can\'t decide. Approve-everything devolves into rubber-stamping.',
    example:{ tag:'CLAUDE CODE', body:'Permissions prompt before <code>Bash</code>, before destructive file ops; you can approve once, allow always, or deny. The decision feeds the trace.' },
  },

  /* ─── clarification-at-edge ─── */
  {
    id: 'clarification-at-edge', group:'decision', num:'21', grpLabel:'DECISION & EVAL',
    title:'Clarification-at-edge', titleEn:'Ask before act',
    aliases:'ask-before-act / clarify boundary',
    mechanism:'At cross-agent boundaries or before uncertain actions, an ambiguity score triggers a clarification step instead of guessing.',
    nodes: [
      { id:'a',     x:40,  y:240, w:160, label:'Agent A', kind:'accent' },
      { id:'edge',  x:240, y:240, w:160, label:'Edge Check', sub:'ambiguity score' },
      { id:'clar',  x:430, y:60,  w:200, label:'Clarification', sub:'ask source / user' },
      { id:'user',  x:680, y:60,  w:160, label:'User', kind:'user' },
      { id:'b',     x:680, y:300, w:160, label:'Agent B' },
    ],
    edges: {
      'a-e':   { from:'a',    to:'edge', label:'message' },
      'e-b':   { from:'edge', to:'b',    label:'low ambiguity', curve:15 },
      'e-c':   { from:'edge', to:'clar', label:'ambiguous', dashed:true, curve:-20 },
      'c-u':   { from:'clar', to:'user', label:'?' },
      'c-a':   { from:'clar', to:'a',    dashed:true, curve:-40 },
      'c-b':   { from:'clar', to:'b',    dashed:true, curve:30 },
    },
    timeline: [
      { caption:'<b>Agent A</b> emits a message to <b>Agent B</b>.', fire:['a-e'], activate:['a','edge'] },
      { caption:'The <b>Edge Check</b> scores ambiguity / risk; if low, the message just flows to B.', fire:['e-b'], activate:['edge','b'] },
      { caption:'On the next message, the score is high → trigger <b>Clarification</b> instead of guessing.', fire:['e-c'], activate:['edge','clar'], dim:['b'] },
      { caption:'Clarification asks the <b>User</b> or the source agent a specific question.', fire:['c-u'], activate:['clar','user'] },
      { caption:'Answer is merged back; A and B receive the clarified payload.', fire:['c-a','c-b'], activate:['a','b'] },
    ],
    fit:'Vague requirements · agent handoffs · long tasks · multi-constraint tasks · ambiguous user intent.',
    risks:'Over-interrupting. Questions too abstract to answer. Clarification result not fed back into state.',
    example:{ tag:'PAPER', body:'<code>AgentAsk</code> inserts a learned clarifier at agent boundaries; downstream error rate drops without dramatic user-question overhead.' },
  },

  /* ─── coordinator-dispatcher ─── */
  {
    id: 'coordinator-dispatcher', group:'centralized', num:'22', grpLabel:'CENTRALIZED CONTROL',
    title:'Coordinator / Dispatcher', titleEn:'Engineering layer above the router',
    aliases:'dispatcher / scheduler / runtime',
    mechanism:'A service layer (not an LLM) creates task/run/session, applies policy, routes, schedules retries, and persists checkpoints.',
    nodes: [
      { id:'u',    x:40,  y:240, w:120, label:'User Request', kind:'user' },
      { id:'disp', x:200, y:240, w:170, label:'Dispatcher', sub:'service', kind:'accent' },
      { id:'pol',  x:410, y:60,  w:150, label:'Policy' },
      { id:'reg',  x:410, y:240, w:150, label:'Task Registry', sub:'checkpoints', kind:'store' },
      { id:'q',    x:410, y:420, w:150, label:'Queue' },
      { id:'a',    x:620, y:120, w:170, label:'Agent A' },
      { id:'b',    x:620, y:260, w:170, label:'Agent B' },
      { id:'w',    x:620, y:400, w:170, label:'Workflow' },
    ],
    edges: {
      'u-d':   { from:'u',    to:'disp' },
      'd-p':   { from:'disp', to:'pol',  label:'allowed?', curve:-15 },
      'd-r':   { from:'disp', to:'reg',  label:'persist' },
      'd-q':   { from:'disp', to:'q',    label:'enqueue', curve:15 },
      'd-a':   { from:'disp', to:'a',    curve:-25 },
      'd-b':   { from:'disp', to:'b' },
      'd-w':   { from:'disp', to:'w',    curve:25 },
    },
    timeline: [
      { caption:'<b>User Request</b> hits the <b>Dispatcher</b> (a service, not an LLM).', fire:['u-d'], activate:['u','disp'] },
      { caption:'Dispatcher consults <b>Policy</b> — what targets is this request allowed to reach?', fire:['d-p'], activate:['disp','pol'] },
      { caption:'A task is recorded in the <b>Task Registry</b> with a checkpoint.', fire:['d-r'], activate:['disp','reg'] },
      { caption:'For async work, the job is dropped on the <b>Queue</b>.', fire:['d-q'], activate:['disp','q'] },
      { caption:'Dispatcher routes to an <b>Agent</b> (sync) — retries, timeouts, budgets live here, not inside the agent.', fire:['d-b'], activate:['disp','b'] },
      { caption:'For complex jobs it picks a multi-step <b>Workflow</b> instead.', fire:['d-w'], activate:['disp','w'], dim:['b'] },
    ],
    fit:'Internal platforms · long tasks · multi-tenant agent services · anywhere resumable scheduling and unified policy matter.',
    risks:'Dispatcher starts writing prompts and turns into an opaque agent. Retry policy scattered across agents. No task/run/session layering.',
    example:{ tag:'AGENT PLATFORM', body:'A FastAPI / gRPC service creates a run, picks a target, persists a checkpoint, returns a stream — the agents themselves only do their specialty.' },
  },

  /* ─── voting-ensemble ─── */
  {
    id: 'voting-ensemble', group:'decision', num:'23', grpLabel:'DECISION & EVAL',
    title:'Voting / Ensemble', titleEn:'Score multiple candidates, pick one',
    aliases:'ensemble / ranker / self-consistency',
    mechanism:'Multiple agents produce independent candidates; a vote, ranker, or verifier picks the final result.',
    nodes: [
      { id:'q',  x:40,  y:240, w:100, label:'Question', kind:'user' },
      { id:'a',  x:200, y:80,  w:160, label:'Agent A', sub:'model 1' },
      { id:'b',  x:200, y:240, w:160, label:'Agent B', sub:'model 2' },
      { id:'c',  x:200, y:400, w:160, label:'Agent C', sub:'temp=0.9' },
      { id:'v',  x:430, y:240, w:170, label:'Ranker', sub:'rubric', kind:'accent' },
      { id:'ver',x:640, y:120, w:160, label:'Verifier', sub:'tool check' },
      { id:'w',  x:640, y:360, w:160, label:'Winner', kind:'dark' },
    ],
    edges: {
      'q-a':   { from:'q', to:'a', curve:-20 },
      'q-b':   { from:'q', to:'b' },
      'q-c':   { from:'q', to:'c', curve:20 },
      'a-v':   { from:'a', to:'v', curve:20 },
      'b-v':   { from:'b', to:'v' },
      'c-v':   { from:'c', to:'v', curve:-20 },
      'v-ver': { from:'v', to:'ver', label:'top', curve:-15 },
      'v-w':   { from:'v', to:'w',   curve:15 },
      'ver-w': { from:'ver', to:'w', label:'verified' },
    },
    timeline: [
      { caption:'The same <b>Question</b> goes to several agents — different models, prompts, temperatures.', fire:['q-a','q-b','q-c'], activate:['q','a','b','c'] },
      { caption:'Each candidate carries reasoning + evidence; the <b>Ranker</b> scores them against a rubric.', fire:['a-v','b-v','c-v'], activate:['v'] },
      { caption:'For verifiable tasks, the top candidate goes through a tool-based <b>Verifier</b>.', fire:['v-ver'], activate:['v','ver'] },
      { caption:'Verifier confirms → <b>Winner</b>.', fire:['ver-w'], activate:['ver','w'] },
      { caption:'For non-verifiable tasks the Ranker\'s pick is the Winner directly.', fire:['v-w'], activate:['v','w'] },
    ],
    fit:'Classification · reasoning problems · multiple plans · fact checks · model fusion · benchmarks.',
    risks:'Majority isn\'t correct. Candidates too similar. Ranker fooled by fluent prose. Verify with tools whenever possible.',
    example:{ tag:'SELF-CONSISTENCY', body:'Sample N reasoning chains, vote on the answer, ship the most consistent one — a cheap accuracy lift for math / logic tasks.' },
  },

  /* ─── composite-pattern ─── */
  {
    id: 'composite-pattern', group:'flow', num:'24', grpLabel:'INFORMATION FLOW',
    title:'Composite Pattern', titleEn:'Production stack = many patterns wired up',
    aliases:'composition / blended pattern / production stack',
    mechanism:'Real systems combine pipeline, parallel, handoff, critic, HITL, blackboard, and protocol layers into one business flow.',
    nodes: [
      { id:'u',   x:40,  y:240, w:90,  label:'User', kind:'user' },
      { id:'d',   x:150, y:240, w:130, label:'Dispatcher', kind:'accent' },
      { id:'p',   x:300, y:240, w:120, label:'Planner' },
      { id:'f',   x:430, y:80,  w:140, label:'Fan-out' },
      { id:'g',   x:430, y:400, w:140, label:'Gather' },
      { id:'c',   x:600, y:240, w:130, label:'Critic' },
      { id:'h',   x:760, y:80,  w:120, label:'HITL', sub:'if risky' },
      { id:'r',   x:760, y:400, w:120, label:'Final', kind:'dark' },
    ],
    edges: {
      'u-d':   { from:'u', to:'d' },
      'd-p':   { from:'d', to:'p' },
      'p-f':   { from:'p', to:'f', curve:-20 },
      'f-g':   { from:'f', to:'g', curve:60 },
      'g-c':   { from:'g', to:'c', curve:-20 },
      'c-r':   { from:'c', to:'r', label:'pass', curve:15 },
      'c-h':   { from:'c', to:'h', label:'risky', dashed:true, curve:-15 },
      'h-r':   { from:'h', to:'r', dashed:true, curve:30 },
      'c-g':   { from:'c', to:'g', label:'fail · loop', dashed:true, curve:60 },
    },
    timeline: [
      { caption:'<b>User</b> request enters the <b>Dispatcher</b>.', fire:['u-d'], activate:['u','d'] },
      { caption:'Dispatcher hands to the <b>Planner</b> — the central workflow.', fire:['d-p'], activate:['d','p'] },
      { caption:'Planner runs <b>Parallel Fan-out</b> across specialists.', fire:['p-f'], activate:['p','f'] },
      { caption:'Results aggregate at <b>Gather</b>.', fire:['f-g'], activate:['f','g'] },
      { caption:'<b>Critic</b> reviews the aggregated draft.', fire:['g-c'], activate:['g','c'] },
      { caption:'Critic finds issues → loops back to Gather (refinement loop).', fire:['c-g'], activate:['c','g'] },
      { caption:'On the next pass, critic flags the change as <b>risky</b> → routes to <b>HITL</b>.', fire:['g-c','c-h'], activate:['c','h'], dim:['r'] },
      { caption:'Human approves → <b>Final</b>. Every layer shared one state, one event log, one task registry.', fire:['h-r'], activate:['h','r'] },
    ],
    fit:'Enterprise agent platforms · coding agents · support agents · research agents — anywhere stable delivery matters.',
    risks:'Don\'t compose until single patterns are validated. Without shared state / trace, you can\'t tell which layer broke.',
    example:{ tag:'CODING AGENT', body:'<code>Plan → parallel search → draft → critic → optional HITL → ship</code> — all atop one task registry, one event log, one workspace manager.' },
  },

  /* ─── workspace-isolation ─── */
  {
    id: 'workspace-isolation', group:'centralized', num:'25', grpLabel:'CENTRALIZED CONTROL',
    title:'Workspace Isolation', titleEn:'Each agent gets its own sandbox',
    aliases:'worktree / sandbox / container per agent',
    mechanism:'Each agent runs in its own workspace (git worktree, container, sandbox). Outputs return as patches reviewed before merge.',
    nodes: [
      { id:'o',    x:40,  y:240, w:160, label:'Orchestrator', kind:'accent' },
      { id:'a',    x:240, y:120, w:130, label:'Agent A' },
      { id:'b',    x:240, y:360, w:130, label:'Agent B' },
      { id:'w1',   x:410, y:120, w:170, label:'Worktree A', sub:'isolated', kind:'store' },
      { id:'w2',   x:410, y:360, w:170, label:'Worktree B', sub:'isolated', kind:'store' },
      { id:'m',    x:620, y:240, w:150, label:'Merge / Review' },
      { id:'main', x:800, y:240, w:80,  label:'Main', kind:'dark' },
    ],
    edges: {
      'o-a':   { from:'o', to:'a', curve:-15 },
      'o-b':   { from:'o', to:'b', curve:15 },
      'a-w1':  { from:'a', to:'w1' },
      'b-w2':  { from:'b', to:'w2' },
      'w1-m':  { from:'w1', to:'m', label:'diff', curve:-15 },
      'w2-m':  { from:'w2', to:'m', label:'diff', curve:15 },
      'm-main':{ from:'m',  to:'main' },
    },
    timeline: [
      { caption:'<b>Orchestrator</b> spins up two agents.', fire:['o-a','o-b'], activate:['o','a','b'] },
      { caption:'Each agent gets its own <b>Worktree</b> — file writes and shells happen there, not in main.', fire:['a-w1','b-w2'], activate:['a','b','w1','w2'] },
      { caption:'Agents work concurrently without stepping on each other.', activate:['w1','w2'] },
      { caption:'Each returns a <b>diff</b> instead of plain text.', fire:['w1-m','w2-m'], activate:['m'] },
      { caption:'<b>Merge / Review</b> resolves conflicts, runs tests, and lands changes into <b>Main</b>.', fire:['m-main'], activate:['m','main'] },
    ],
    fit:'Coding agents · concurrent code changes · experimental approaches · dangerous commands · test isolation.',
    risks:'Multiple agents writing the same dir. Text-only summaries without diff. Sandbox permissions too broad. No cleanup → resource leaks.',
    example:{ tag:'CLAUDE CODE', body:'<code>git worktree</code> per agent; each runs <code>npm test</code> in isolation; merge to main only after the suite is green.' },
  },

  /* ─── stigmergy-environment-mediated ─── */
  {
    id: 'stigmergy-environment-mediated', group:'decentral', num:'26', grpLabel:'DECENTRALIZED',
    title:'Stigmergy', titleEn:'Collaborate by changing the environment',
    aliases:'environment-mediated / trace-driven / ant-colony',
    mechanism:'Agents do not message each other directly. They modify a shared environment; other agents observe and react to those traces.',
    nodes: [
      { id:'a',   x:40,  y:80,  w:160, label:'Agent A' },
      { id:'b',   x:40,  y:400, w:160, label:'Agent B' },
      { id:'env', x:300, y:240, w:200, label:'Environment', sub:'TODO · diff · tests', kind:'store' },
      { id:'c',   x:600, y:80,  w:170, label:'Agent C' },
      { id:'d',   x:600, y:400, w:170, label:'Agent D' },
      { id:'em',  x:600, y:240, w:170, label:'Emergent Coord.' },
    ],
    edges: {
      'a-env':  { from:'a',   to:'env', label:'leave trace', curve:25 },
      'env-c':  { from:'env', to:'c',   label:'observe',     curve:-15 },
      'c-env':  { from:'c',   to:'env', label:'leave trace', dashed:true, curve:60 },
      'env-d':  { from:'env', to:'d',   label:'observe',     curve:15 },
      'env-em': { from:'env', to:'em',  dashed:true },
      'b-env':  { from:'b',   to:'env', label:'leave trace', curve:-25 },
    },
    timeline: [
      { caption:'<b>Agent A</b> writes a <code>TODO</code> entry and a failing test into the <b>Environment</b>.', fire:['a-env'], activate:['a','env'] },
      { caption:'<b>Agent C</b> observes the new trace on its next scan.', fire:['env-c'], activate:['env','c'] },
      { caption:'C reacts — writes a patch into the Environment.', fire:['c-env'], activate:['c','env'] },
      { caption:'Meanwhile <b>Agent B</b> drops an issue tagged for D.', fire:['b-env'], activate:['b','env'] },
      { caption:'<b>Agent D</b> picks it up; coordination <b>emerges</b> without direct messaging.', fire:['env-d','env-em'], activate:['env','d','em'] },
    ],
    fit:'Robotics · simulation · shared coding workspaces · async research collaboration · open environments without dialog.',
    risks:'Environment pollution. Agents read stale traces. Coordination is implicit — debugging needs explicit trace types and timestamps.',
    example:{ tag:'CODING AGENTS', body:'A repo full of <code>TODO.md</code>, test reports, and open PRs is a stigmergic environment — many agents observe and act on what others left behind.' },
  },

  /* ─── coalition-federation-holonic ─── */
  {
    id: 'coalition-federation-holonic', group:'decentral', num:'27', grpLabel:'DECENTRALIZED',
    title:'Coalition / Federation', titleEn:'Temporary organizations of agents',
    aliases:'coalition / federation / holon / agent team',
    mechanism:'Agents form temporary coalitions / federations / holons around a task. The focus is governance, membership, and autonomy boundaries — not a single call.',
    nodes: [
      { id:'org', x:40,  y:240, w:140, label:'Org Registry', kind:'accent' },
      { id:'co',  x:220, y:80,  w:160, label:'Coalition A' },
      { id:'fed', x:220, y:240, w:160, label:'Federation B' },
      { id:'hol', x:220, y:400, w:160, label:'Holon C' },
      { id:'a1',  x:430, y:40,  w:120, label:'Agent 1' },
      { id:'a2',  x:430, y:120, w:120, label:'Agent 2' },
      { id:'a3',  x:430, y:240, w:120, label:'Agent 3' },
      { id:'a4',  x:430, y:400, w:120, label:'Sub-team' },
    ],
    edges: {
      'o-co':   { from:'org', to:'co',  label:'form', curve:-20 },
      'o-fed':  { from:'org', to:'fed', label:'register' },
      'o-hol':  { from:'org', to:'hol', label:'spawn', curve:20 },
      'co-a1':  { from:'co',  to:'a1',  curve:-10 },
      'co-a2':  { from:'co',  to:'a2',  curve:10 },
      'fed-a3': { from:'fed', to:'a3' },
      'hol-a4': { from:'hol', to:'a4' },
    },
    timeline: [
      { caption:'The <b>Org Registry</b> tracks agents, capabilities, and trust levels.', activate:['org'] },
      { caption:'For a task, agents form a <b>Coalition</b> with a shared contract.', fire:['o-co','co-a1','co-a2'], activate:['org','co','a1','a2'] },
      { caption:'A different task is owned by a <b>Federation</b> — locally autonomous, globally coordinated.', fire:['o-fed','fed-a3'], activate:['fed','a3'] },
      { caption:'A <b>Holon</b> spawns its own sub-team and acts as a single member upward.', fire:['o-hol','hol-a4'], activate:['hol','a4'] },
      { caption:'When the task finishes, membership dissolves — the registry persists.', dim:['co','fed','hol','a1','a2','a3','a4'], activate:['org'] },
    ],
    fit:'Cross-team collaboration · open agent networks · multi-org tasks · interconnected internal platforms.',
    risks:'Member permissions unclear. Coalition vs individual goals conflict. Organizational state never cleaned up.',
    example:{ tag:'RESEARCH', body:'Holonic manufacturing — every "agent" is itself a team with its own sub-agents, visible to the outside as one actor.' },
  },

  /* ─── social-simulation ─── */
  {
    id: 'social-simulation', group:'decentral', num:'28', grpLabel:'DECENTRALIZED',
    title:'Social Simulation', titleEn:'Agent society with memory and emergence',
    aliases:'generative agents / agent society',
    mechanism:'Use multiple agents to simulate a population. Focus on long-term memory, planning, relationships, and emergent behavior.',
    nodes: [
      { id:'world', x:40,  y:240, w:140, label:'World', sub:'state · clock', kind:'store' },
      { id:'a',     x:240, y:80,  w:140, label:'Alice' },
      { id:'b',     x:240, y:240, w:140, label:'Bob' },
      { id:'c',     x:240, y:400, w:140, label:'Carol' },
      { id:'ma',    x:430, y:80,  w:130, label:'Memory A', kind:'store' },
      { id:'mb',    x:430, y:240, w:130, label:'Memory B', kind:'store' },
      { id:'mc',    x:430, y:400, w:130, label:'Memory C', kind:'store' },
      { id:'tick',  x:620, y:240, w:200, label:'observe · reflect · plan · act', kind:'accent' },
    ],
    edges: {
      'w-a':   { from:'world', to:'a' },
      'w-b':   { from:'world', to:'b' },
      'w-c':   { from:'world', to:'c' },
      'a-ma':  { from:'a', to:'ma' },
      'b-mb':  { from:'b', to:'mb' },
      'c-mc':  { from:'c', to:'mc' },
      'a-t':   { from:'a', to:'tick', curve:-15 },
      'b-t':   { from:'b', to:'tick' },
      'c-t':   { from:'c', to:'tick', curve:15 },
      't-w':   { from:'tick', to:'world', label:'apply', dashed:true, curve:80 },
    },
    timeline: [
      { caption:'The <b>World</b> publishes observations on each tick.', fire:['w-a','w-b','w-c'], activate:['world','a','b','c'] },
      { caption:'Each agent stores observations in its own long-term <b>Memory</b>.', fire:['a-ma','b-mb','c-mc'], activate:['ma','mb','mc'] },
      { caption:'Agents <b>observe → reflect → plan → act</b>.', fire:['a-t','b-t','c-t'], activate:['tick'] },
      { caption:'Actions feed back into <b>World</b> state — relationships, locations, events update.', fire:['t-w'], activate:['tick','world'] },
      { caption:'Over many ticks, social structure and behavior <b>emerge</b>; the focus is credibility, not single-task success.', activate:['world','a','b','c'] },
    ],
    fit:'User research · product validation · social-behavior simulation · game NPCs · org modeling · info propagation.',
    risks:'Treating simulation as real prediction. Personas convincing but unverified. Long-term memory pollutes future runs.',
    example:{ tag:'GENERATIVE AGENTS', body:'25 LLM-driven villagers organize a Valentine\'s party through messages, memories, and reflections — a Stanford / Google demo of emergent behavior.' },
  },

  /* ─── marl-ctde ─── */
  {
    id: 'marl-ctde', group:'decentral', num:'29', grpLabel:'DECENTRALIZED',
    title:'MARL / CTDE', titleEn:'Centralized training, decentralized execution',
    aliases:'multi-agent RL / CTDE',
    mechanism:'Multiple agents learn policies in an environment. Training uses global state; execution uses each agent\'s local observation.',
    nodes: [
      { id:'env',  x:40,  y:240, w:140, label:'Environment', kind:'store' },
      { id:'o1',   x:220, y:120, w:130, label:'Obs Agent 1' },
      { id:'o2',   x:220, y:360, w:130, label:'Obs Agent 2' },
      { id:'p1',   x:390, y:120, w:130, label:'Policy 1', kind:'accent' },
      { id:'p2',   x:390, y:360, w:130, label:'Policy 2', kind:'accent' },
      { id:'a1',   x:560, y:120, w:130, label:'Action 1' },
      { id:'a2',   x:560, y:360, w:130, label:'Action 2' },
      { id:'r',    x:740, y:240, w:130, label:'Reward' },
      { id:'tr',   x:560, y:240, w:130, label:'Trainer', sub:'central · sees all' },
    ],
    edges: {
      'e-o1': { from:'env', to:'o1', curve:-15 },
      'e-o2': { from:'env', to:'o2', curve:15 },
      'o-p1': { from:'o1', to:'p1' },
      'o-p2': { from:'o2', to:'p2' },
      'p-a1': { from:'p1', to:'a1' },
      'p-a2': { from:'p2', to:'a2' },
      'a-e1': { from:'a1', to:'env', dashed:true, curve:80 },
      'a-e2': { from:'a2', to:'env', dashed:true, curve:-80 },
      'e-r':  { from:'env', to:'r', dashed:true, curve:30 },
      'r-t':  { from:'r',   to:'tr', label:'reward' },
      't-p1': { from:'tr', to:'p1', label:'update', dashed:true, curve:-30 },
      't-p2': { from:'tr', to:'p2', label:'update', dashed:true, curve:30 },
    },
    timeline: [
      { caption:'<b>Environment</b> emits local observations to each agent.', fire:['e-o1','e-o2'], activate:['env','o1','o2'] },
      { caption:'Each agent\'s <b>Policy</b> picks an Action from its own observation only.', fire:['o-p1','o-p2','p-a1','p-a2'], activate:['p1','p2','a1','a2'] },
      { caption:'Actions are applied to the Environment; a shared <b>Reward</b> comes back.', fire:['a-e1','a-e2','e-r'], activate:['env','r'] },
      { caption:'During training, the <b>centralized Trainer</b> sees all observations and rewards.', fire:['r-t'], activate:['tr','r'] },
      { caption:'Trainer updates every policy together — <b>centralized training</b>.', fire:['t-p1','t-p2'], activate:['tr','p1','p2'] },
      { caption:'At deployment the trainer is removed — each policy acts on its <b>own local observation</b> (decentralized execution).', dim:['tr'], activate:['p1','p2'] },
    ],
    fit:'Robotics · games · traffic · scheduling · control · research on collaborative / competitive decision making.',
    risks:'Misspecified reward. Sim-to-real gap. Conflating MARL with general LLM orchestration.',
    example:{ tag:'PAPER', body:'<code>MAPPO</code> / <code>QMIX</code> — train cooperative agents with shared critic, deploy decentralized.' },
  },

  /* ─── dynamic-workflow ─── */
  {
    id: 'dynamic-workflow',
    group: 'flow',
    num: '30',
    grpLabel: 'WORKFLOW ORCHESTRATION',
    title: 'Dynamic Workflow',
    titleEn: 'Plan-in-code · script orchestrates subagents',
    titleZh: '动态工作流：把编排逻辑写进代码',
    aliases: 'Claude Code dynamic workflows / code-orchestrated subagents / script-held plan / workflow runtime',
    mechanism:
      'Claude writes an orchestration script for a large task. The script holds loops, branches, fan-out, intermediate variables, cross-checking, and convergence logic while subagents perform the actual reading, editing, shell, web, or MCP work.',
    mechanismZh:
      'Claude 为大任务生成一段编排脚本。脚本持有循环、分支、扇出、中间变量、交叉验证和收敛逻辑；真正读写文件、跑命令、查资料、调用 MCP 的工作由子智能体执行。',
    nodes: [
      { id: 'user',       x: 28,  y: 250, w: 100, label: 'User', kind: 'user' },
      { id: 'claude',     x: 180, y: 85,  w: 170, label: 'Claude', sub: 'writes workflow', kind: 'accent' },
      { id: 'approve',    x: 180, y: 250, w: 170, label: 'Approval', sub: 'phases · cost', kind: 'plain' },
      { id: 'script',     x: 395, y: 85,  w: 190, label: 'Workflow Script', sub: 'loop · branch · fan-out', kind: 'accent' },
      { id: 'runtime',    x: 395, y: 250, w: 190, label: 'Runtime', sub: 'background runner', kind: 'bus' },
      { id: 'pool',       x: 640, y: 70,  w: 190, label: 'Worker Agents', sub: '10s–100s' },
      { id: 'verify',     x: 640, y: 250, w: 190, label: 'Verifier Agents', sub: 'cross-check · refute' },
      { id: 'synth',      x: 415, y: 405, w: 190, label: 'Synthesis Agent', sub: 'writes report' },
      { id: 'checkpoint', x: 640, y: 420, w: 190, label: 'Checkpoint', sub: 'cached results', kind: 'store' },
      { id: 'final',      x: 805, y: 250, w: 78,  label: 'Report', kind: 'dark' },
    ],
    edges: {
      'u-c':  { from: 'user', to: 'claude', label: 'large task', curve: -24 },
      'u-a':  { from: 'user', to: 'approve', label: 'confirm' },
      'c-a':  { from: 'claude', to: 'approve', label: 'phase plan' },
      'c-s':  { from: 'claude', to: 'script', label: 'write JS', curve: -18 },
      'a-r':  { from: 'approve', to: 'runtime', label: 'allow run' },
      's-r':  { from: 'script', to: 'runtime', label: 'execute' },
      'r-p':  { from: 'runtime', to: 'pool', label: 'spawn', curve: -20 },
      'p-r':  { from: 'pool', to: 'runtime', label: 'findings', curve: 20 },
      'r-v':  { from: 'runtime', to: 'verify', label: 'spawn', curve: -14 },
      'v-r':  { from: 'verify', to: 'runtime', label: 'checked', curve: 20 },
      'r-sy': { from: 'runtime', to: 'synth', label: 'spawn', curve: -16 },
      'sy-r': { from: 'synth', to: 'runtime', label: 'report', curve: 16 },
      'r-cp': { from: 'runtime', to: 'checkpoint', label: 'persist', curve: 20 },
      'cp-r': { from: 'checkpoint', to: 'runtime', label: 'resume', dashed: true, curve: -20 },
      'r-f':  { from: 'runtime', to: 'final', label: 'finalize / return', curve: 18 },
    },
    timeline: [
      {
        caption: '<b>User</b> asks for a task too large for one conversational pass.',
        captionZh: '<b>用户</b>提出一个单轮对话难以稳定完成的大任务。',
        fire: ['u-c'],
        activate: ['user', 'claude'],
      },
      {
        caption: '<b>Claude</b> turns the plan into a workflow script instead of coordinating everything turn by turn.',
        captionZh: '<b>Claude</b>不再逐轮临场调度，而是把计划写成 workflow 脚本。',
        fire: ['c-s'],
        activate: ['claude', 'script'],
      },
      {
        caption: 'Before the run starts, the <b>user</b> confirms phases, scope, and cost at the approval gate.',
        captionZh: '运行前，<b>用户</b>在审批门确认阶段、范围和成本，再开始执行。',
        fire: ['c-a', 'u-a'],
        activate: ['claude', 'user', 'approve'],
      },
      {
        caption: '<b>Runtime</b> executes the script in the background; the main session stays responsive.',
        captionZh: '<b>Runtime</b>在后台执行脚本，主会话保持可响应。',
        fire: ['a-r', 's-r'],
        activate: ['approve', 'script', 'runtime'],
      },
      {
        caption: 'The script fans out many <b>subagents</b>. Agents do the actual reading, editing, shell, web, or MCP work.',
        captionZh: '脚本扇出多个<b>子智能体</b>；真正读写、命令、Web、MCP 调用由子智能体完成。',
        fire: ['r-p'],
        activate: ['runtime', 'pool'],
      },
      {
        caption: 'Intermediate results return to script variables and runtime state, not directly into the main conversation.',
        captionZh: '中间结果先回到脚本变量和 runtime 状态，而不是全部塞进主上下文。',
        fire: ['p-r', 'r-cp'],
        activate: ['pool', 'runtime', 'checkpoint'],
      },
      {
        caption: 'The runtime spawns <b>verifier agents</b> over the collected findings; they cross-check and try to refute weak claims.',
        captionZh: 'Runtime 基于收集到的发现派生<b>verifier agents</b>，交叉检查并在综合前反驳不稳的结论。',
        fire: ['r-v', 'v-r'],
        activate: ['runtime', 'verify'],
      },
      {
        caption: 'The workflow iterates until results converge or the budget / stop condition is reached.',
        captionZh: 'Workflow 持续迭代，直到结果收敛或触达预算 / 停止条件。',
        fire: ['r-p', 'p-r', 'r-v', 'v-r'],
        activate: ['runtime', 'pool', 'verify'],
      },
      {
        caption: 'A <b>synthesis agent</b> (spawned like any other) writes the report from the surviving findings; the runtime returns it to the user-facing session.',
        captionZh: '<b>综合 agent</b>（与其他 agent 一样被 runtime 派生）基于通过校验的发现撰写报告；runtime 把它返回用户会话。',
        fire: ['r-sy', 'sy-r', 'r-f'],
        activate: ['runtime', 'synth', 'final'],
      },
    ],
    fit:
      'Codebase-wide audits · large migrations · cross-checked research · plan stress tests · repeated engineering workflows you want to save and rerun.',
    fitZh:
      '全代码库审计、大规模迁移、交叉验证研究、方案压力测试，以及需要保存并复跑的工程流程。',
    risks:
      'Token and rate-limit cost multiply quickly. Poor decomposition creates correlated failures. Permissions, allowlists, trace logs, checkpoints, and rollback must be designed before long runs.',
    risksZh:
      'Token 和 rate limit 成本会快速放大；拆解差会导致相关性失败；长任务前必须设计权限、allowlist、trace、checkpoint 和 rollback。',
    example: {
      tag: 'CONCEPTUAL WORKFLOW',
      body:
        '<code>workflow</code> writes the orchestration; <code>agent()</code> calls spawn workers; <code>parallel()</code> waits at a barrier; <code>pipeline()</code> streams items across stages; verifiers filter claims before the final report.',
    },
    exampleZh: {
      tag: '概念伪代码',
      body:
        '<code>workflow</code> 保存编排；<code>agent()</code> 生成 worker；<code>parallel()</code> 形成 barrier；<code>pipeline()</code> 让 item 流水线穿过阶段；verifier 在最终报告前过滤结论。',
    },
    code: {
      lang: 'ts',
      snippet:
`// Conceptual pseudo-code, not a public Claude API contract.
export default async function workflow(ctx) {
  const files = await ctx.agent("map-codebase", ctx.goal)

  const findings = await ctx.parallel(
    files.map(file => ctx.agent("audit-file", { file }))
  )

  const checked = await ctx.parallel(
    findings.map(f => ctx.agent("adversarial-review", f))
  )

  return ctx.synthesize(checked.filter(x => x.verified))
}`,
    },
    variants: [
      { label: 'Default', labelZh: '默认', sub: 'script → fan-out → verify', subZh: '脚本 → 扇出 → 验证', timeline: null },
      {
        label: 'Parallel barrier', labelZh: '并行屏障', sub: 'wait for all', subZh: '等待全部完成',
        timeline: [
          { caption: 'Runtime creates one batch of independent subtasks.', captionZh: 'Runtime 创建一批互相独立的子任务。', activate: ['runtime'] },
          { caption: 'All workers start together.', captionZh: '所有 worker 同时开始。', fire: ['r-p'], activate: ['runtime', 'pool'] },
          { caption: 'Barrier semantics: aggregation waits for every worker to finish.', captionZh: 'Barrier 语义：聚合必须等待所有 worker 完成。', activate: ['pool'], duration: 1800 },
          { caption: 'The batch returns to runtime for dedupe and merge.', captionZh: '整批结果回到 runtime 做去重与合并。', fire: ['p-r'], activate: ['pool', 'runtime'] },
          { caption: 'Merged claims go through verifier agents.', captionZh: '合并后的 claims 进入 verifier agents。', fire: ['p-v', 'v-r'], activate: ['runtime', 'verify'] },
          { caption: 'Final report contains only claims that survive cross-checking.', captionZh: '最终报告只保留通过交叉验证的结论。', fire: ['r-f', 'v-f'], activate: ['final'] },
        ],
      },
      {
        label: 'Pipeline stream', labelZh: '流水线', sub: 'item by item', subZh: '逐 item 流动',
        timeline: [
          { caption: 'The script creates a multi-stage pipeline: discover → audit → verify → synthesize.', captionZh: '脚本创建多阶段流水线：discover → audit → verify → synthesize。', activate: ['script', 'runtime'] },
          { caption: 'Item A enters stage 1 while later items are still being discovered.', captionZh: 'Item A 进入第一阶段时，后续 item 仍在发现中。', fire: ['r-p'], activate: ['runtime', 'pool'] },
          { caption: 'Completed items flow to verifier without waiting for the entire batch.', captionZh: '已完成 item 直接流向 verifier，不等待整批结束。', fire: ['p-v'], activate: ['pool', 'verify'] },
          { caption: 'Runtime keeps partial state and checkpoints progress as items move.', captionZh: 'Runtime 持有部分状态，并随着 item 流动 checkpoint。', fire: ['v-r', 'r-cp'], activate: ['verify', 'runtime', 'checkpoint'] },
          { caption: 'Pipeline improves latency when slow items should not block fast items.', captionZh: '当慢 item 不应阻塞快 item 时，pipeline 降低尾部等待。', activate: ['runtime', 'pool', 'verify'] },
          { caption: 'Synthesis starts from verified partial results.', captionZh: '综合可以从已验证的部分结果开始。', fire: ['r-f'], activate: ['runtime', 'final'] },
        ],
      },
      {
        label: 'Adversarial review', labelZh: '对抗验证', sub: 'break weak claims', subZh: '反驳弱结论',
        timeline: [
          { caption: 'Workers produce independent findings from different slices of the task.', captionZh: 'Workers 从不同切片产出相互独立的发现。', fire: ['r-p', 'p-r'], activate: ['runtime', 'pool'] },
          { caption: 'Each finding is sent to a verifier that tries to disprove it.', captionZh: '每个 finding 发送给 verifier，由 verifier 尝试反驳。', fire: ['p-v'], activate: ['pool', 'verify'] },
          { caption: 'Weak or unsupported claims are filtered before they reach the final context.', captionZh: '薄弱或无依据的 claims 在进入最终上下文前被过滤。', fire: ['v-r'], activate: ['verify', 'runtime'] },
          { caption: 'Runtime reruns disputed areas or asks for narrower evidence.', captionZh: 'Runtime 对争议区域复跑，或要求更窄的证据。', fire: ['r-p', 'p-v'], activate: ['runtime', 'pool', 'verify'] },
          { caption: 'Converged claims are synthesized into a single answer.', captionZh: '收敛后的 claims 被综合成单一答案。', fire: ['r-f', 'v-f'], activate: ['runtime', 'verify', 'final'] },
        ],
      },
    ],
  },
];
