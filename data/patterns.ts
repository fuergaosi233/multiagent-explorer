import type { Pattern } from '@/types/pattern';
import { EXTRA_PATTERNS } from './patterns-extra';

const BASE_PATTERNS: Pattern[] = [
  /* ─── I · CENTRALIZED CONTROL ─── */
  {
    id: 'supervisor', group: 'centralized', num: '01', grpLabel: 'CENTRALIZED CONTROL',
    title: 'Supervisor / Manager', titleEn: 'Agents-as-tools · centralized orchestration',
    aliases: 'manager / subagents-as-tools / centralized orchestration',
    mechanism: 'One primary agent retains control, calling specialist agents as tools. Sub-agent intermediate steps do not enter the user conversation.',
    nodes: [
      { id:'user',     x:40,  y:240, w:100, label:'User', kind:'user' },
      { id:'manager',  x:230, y:230, w:180, label:'Manager', sub:'supervisor', kind:'accent' },
      { id:'research', x:580, y:50,  w:170, label:'Research', sub:'specialist' },
      { id:'coder',    x:580, y:230, w:170, label:'Coder', sub:'specialist' },
      { id:'reviewer', x:580, y:410, w:170, label:'Reviewer', sub:'specialist' },
      { id:'final',    x:230, y:430, w:180, label:'Final Answer', kind:'dark' },
    ],
    edges: {
      'u-m':  { from:'user',     to:'manager',  label:'request' },
      'm-r':  { from:'manager',  to:'research', label:'call as tool', curve:-20 },
      'm-c':  { from:'manager',  to:'coder',    label:'call' },
      'm-rv': { from:'manager',  to:'reviewer', label:'call', curve:20 },
      'm-f':  { from:'manager',  to:'final' },
    },
    timeline: [
      { caption:'<b>User</b> sends request; <b>Manager</b> takes control of the conversation.', fire:['u-m'], activate:['user','manager'] },
      { caption:'Manager delegates research to <b>Research specialist</b> (agent-as-tool).', fire:['m-r'], activate:['manager','research'] },
      { caption:'Research returns results; conversation stays with Manager.', fire:['!m-r'], activate:['manager'] },
      { caption:'Manager calls <b>Coder</b> to write / edit code.', fire:['m-c'], activate:['manager','coder'] },
      { caption:'Coder returns code snippet.', fire:['!m-c'], activate:['manager'] },
      { caption:'Manager calls <b>Reviewer</b> to check quality.', fire:['m-rv'], activate:['manager','reviewer'] },
      { caption:'Reviewer returns review verdict.', fire:['!m-rv'], activate:['manager'] },
      { caption:'Manager aggregates all results, outputs <b>Final Answer</b>. Intermediate steps hidden from user.', fire:['m-f'], activate:['manager','final'] },
    ],
    fit:'Production systems · customer support triage · internal CLI tool calls · <b>code tasks with reviewer/tester/searcher subagents</b>.',
    risks:'Routing errors cascade globally; supervisor can become a token and latency bottleneck on complex tasks.',
    example:{ tag:'CLAUDE CODE', body:'Main conversation holds context and user interaction; complex actions delegated to <b>subagents</b>: <code>reviewer</code> checks changes, <code>tester</code> runs tests, <code>searcher</code> looks up docs. Only final conclusions surface to main conversation.' },
    code: { lang:'python', snippet:
`<span class="k">from</span> agents <span class="k">import</span> Agent, Tool

manager = Agent(
    role=<span class="s">"supervisor"</span>,
    model=<span class="s">"claude-sonnet"</span>,
    tools=[
        Tool.subagent(<span class="s">"researcher"</span>, role=<span class="s">"research"</span>),
        Tool.subagent(<span class="s">"coder"</span>,      role=<span class="s">"write code"</span>),
        Tool.subagent(<span class="s">"reviewer"</span>,   role=<span class="s">"check quality"</span>),
    ],
)

<span class="c"># Manager decides autonomously when to call each subagent.</span>
<span class="c"># Sub-agent tokens don't enter the main conversation context.</span>
answer = <span class="f">await</span> manager.run(<span class="s">"Refactor this code"</span>)`
    },
    variants: [
      { label:'Sequential', sub:'one at a time', timeline:null },
      { label:'Parallel', sub:'concurrent calls',
        timeline:[
          { caption:'<b>User</b> sends request; <b>Manager</b> takes control.', fire:['u-m'], activate:['user','manager'] },
          { caption:'Manager dispatches to all three specialists <b>simultaneously</b>.', fire:['m-r','m-c','m-rv'], activate:['manager','research','coder','reviewer'] },
          { caption:'All three specialists work in parallel (tasks must be independent).', activate:['research','coder','reviewer'] },
          { caption:'Results <b>return concurrently</b> to Manager.', fire:['!m-r','!m-c','!m-rv'], activate:['manager'] },
          { caption:'Manager aggregates and outputs <b>Final Answer</b>.', fire:['m-f'], activate:['manager','final'] },
        ],
      },
    ],
  },

  {
    id: 'router', group:'centralized', num:'02', grpLabel:'CENTRALIZED CONTROL',
    title:'Router / Handoff', titleEn:'Transfer · specialist takes over',
    aliases:'router / transfer / transfer_to_xxx / specialist takeover',
    mechanism:'The current agent transfers control to another agent based on task type; the receiving agent fully owns the subsequent interaction.',
    nodes: [
      { id:'user',    x:40,  y:240, w:100, label:'User', kind:'user' },
      { id:'triage',  x:230, y:230, w:180, label:'Triage', sub:'router', kind:'accent' },
      { id:'billing', x:580, y:70,  w:200, label:'Billing Agent' },
      { id:'eng',     x:580, y:230, w:200, label:'Engineering', sub:'tech support' },
      { id:'policy',  x:580, y:400, w:200, label:'Policy Agent' },
    ],
    edges: {
      'u-t':  { from:'user', to:'triage', label:'request' },
      't-b':  { from:'triage', to:'billing', label:'billing', curve:-15 },
      't-e':  { from:'triage', to:'eng',     label:'tech' },
      't-p':  { from:'triage', to:'policy',  label:'legal', curve:15 },
      'u-e':  { from:'user', to:'eng', curve:-90, dashed:true },
    },
    timeline: [
      { caption:'User: <b>"My account is locked"</b>', fire:['u-t'], activate:['user','triage'] },
      { caption:'Triage evaluates intent — billing? tech? legal?', activate:['triage'] },
      { caption:'Identified as tech — triggers <b>transfer_to(engineering)</b>.', fire:['t-e'], activate:['triage','eng'] },
      { caption:'Key difference vs Supervisor: <b>control truly transfers</b>. Triage exits.', activate:['eng'], dim:['triage','billing','policy'] },
      { caption:'Subsequent conversation goes directly to Engineering — no Triage needed.', fire:['u-e'], activate:['user','eng'], dim:['triage','billing','policy'] },
      { caption:'Engineering handles the full session like a specialist agent, re-transferring if needed.', fire:['!u-e'], activate:['user','eng'], dim:['triage','billing','policy'] },
    ],
    fit:'Multi-domain support · enterprise process routing · approval flows · cases where a specialist needs to own context long-term.',
    risks:'Easy to create handoff loops; cross-agent context trimming and permission propagation are critical.',
    example:{ tag:'OPENAI AGENTS SDK', body:'<code>Triage Agent</code> sees "I want a refund" and calls <code>transfer_to(billing_agent)</code> — billing takes over the complete conversation until closed. <b>Control migrates</b>, not a tool call.' },
    code:{ lang:'python', snippet:`<span class="k">from</span> openai_agents <span class="k">import</span> Agent, handoff

billing = Agent(name=<span class="s">"billing"</span>,     instructions=...)
eng     = Agent(name=<span class="s">"engineering"</span>, instructions=...)
policy  = Agent(name=<span class="s">"policy"</span>,      instructions=...)

triage = Agent(
    name=<span class="s">"triage"</span>,
    handoffs=[
        handoff(billing, condition=<span class="s">"billing question"</span>),
        handoff(eng,     condition=<span class="s">"technical issue"</span>),
        handoff(policy,  condition=<span class="s">"legal / policy"</span>),
    ],
)

<span class="c"># Control truly transfers — subsequent conversation bypasses triage.</span>
session.run(triage, <span class="s">"I want a refund"</span>)`
    },
  },

  {
    id:'hierarchy', group:'centralized', num:'05', grpLabel:'CENTRALIZED CONTROL',
    title:'Hierarchical Manager-Worker', titleEn:'Corporate-style tree organization',
    aliases:'Director–manager–worker tree / multi-level nesting / corporate hierarchy',
    mechanism:'Agents organized in tiers: upper levels plan, delegate, and review; lower levels execute. Can be deeply nested.',
    nodes: [
      { id:'dir',    x:370, y:50,  w:180, label:'Director', kind:'dark' },
      { id:'fe',     x:150, y:220, w:170, label:'Frontend Mgr', sub:'manager', kind:'accent' },
      { id:'be',     x:610, y:220, w:170, label:'Backend Mgr', sub:'manager', kind:'accent' },
      { id:'ui',     x:30,  y:410, w:140, label:'UI Agent' },
      { id:'ux',     x:200, y:410, w:140, label:'UX Review' },
      { id:'api',    x:430, y:410, w:140, label:'API Agent' },
      { id:'test',   x:600, y:410, w:140, label:'Test Agent' },
    ],
    edges:{
      'd-fe':   { from:'dir', to:'fe' },
      'd-be':   { from:'dir', to:'be' },
      'fe-ui':  { from:'fe', to:'ui' },
      'fe-ux':  { from:'fe', to:'ux' },
      'be-api': { from:'be', to:'api' },
      'be-test':{ from:'be', to:'test' },
    },
    timeline:[
      { caption:'Director receives top-level goal and splits into two sub-plans.', activate:['dir'] },
      { caption:'Dispatches simultaneously to <b>Frontend Mgr</b> and <b>Backend Mgr</b>.', fire:['d-fe','d-be'], activate:['dir','fe','be'] },
      { caption:'Each Manager receives their sub-plan and begins further decomposition.', activate:['fe','be'] },
      { caption:'Managers dispatch to workers (parallel).', fire:['fe-ui','fe-ux','be-api','be-test'], activate:['fe','be','ui','ux','api','test'] },
      { caption:'Workers execute their tasks in parallel.', activate:['ui','ux','api','test'] },
      { caption:'Results <b>bubble up</b>: workers → managers.', fire:['!fe-ui','!fe-ux','!be-api','!be-test'], activate:['fe','be'] },
      { caption:'Managers review and report to Director.', fire:['!d-fe','!d-be'], activate:['dir'] },
      { caption:'Director aggregates all deliverables for final acceptance.', activate:['dir'] },
    ],
    fit:'Large engineering tasks · complex research · cross-module work · enterprise automation needing <b>phased acceptance</b>.',
    risks:'Deep hierarchies cause latency and token bloat; planning errors at the top propagate systematically.',
    example:{ tag:'CREWAI HIERARCHICAL', body:'Director gets "build a login page" → splits frontend/backend → Frontend/Backend Managers assign to UI Agent, Test Agent — each reviews and escalates. Two layers usually enough; deeper increases rework cost.' },
    code:{ lang:'python', snippet:`<span class="k">from</span> crewai <span class="k">import</span> Crew, Agent, Process

director = Agent(role=<span class="s">"Director"</span>, goal=<span class="s">"Deliver login page"</span>)
fe_mgr   = Agent(role=<span class="s">"Frontend Mgr"</span>)
be_mgr   = Agent(role=<span class="s">"Backend Mgr"</span>)
ui, ux   = Agent(role=<span class="s">"UI"</span>),  Agent(role=<span class="s">"UX"</span>)
api, tst = Agent(role=<span class="s">"API"</span>), Agent(role=<span class="s">"Test"</span>)

crew = Crew(
    process=Process.hierarchical,
    manager=director,
    agents=[fe_mgr, be_mgr, ui, ux, api, tst],
)
result = crew.kickoff()  <span class="c"># director decomposes, delegates, reviews</span>`
    },
  },

  /* ─── II · FLOW ─── */
  {
    id:'sequential', group:'flow', num:'03', grpLabel:'FLOW',
    title:'Sequential Pipeline', titleEn:'Chain · pipeline · linear DAG',
    aliases:'chain / pipeline / linear DAG',
    mechanism:'Multiple agents execute in fixed order; the output of each step becomes the input for the next. Each step has a clear input/output contract.',
    nodes:[
      { id:'in',  x:20,  y:240, w:90,  label:'Input',   kind:'dark' },
      { id:'pl',  x:140, y:230, w:130, label:'Planner', kind:'accent' },
      { id:'re',  x:300, y:230, w:140, label:'Researcher', kind:'accent' },
      { id:'wr',  x:470, y:230, w:130, label:'Writer', sub:'coder', kind:'accent' },
      { id:'rv',  x:630, y:230, w:140, label:'Reviewer', kind:'accent' },
      { id:'out', x:800, y:240, w:80,  label:'Output',  kind:'dark' },
    ],
    edges:{
      'in-pl': { from:'in', to:'pl' },
      'pl-re': { from:'pl', to:'re', label:'plan' },
      're-wr': { from:'re', to:'wr', label:'evidence' },
      'wr-rv': { from:'wr', to:'rv', label:'draft' },
      'rv-out':{ from:'rv', to:'out' },
    },
    timeline:[
      { caption:'Input enters the pipeline.', fire:['in-pl'], activate:['in','pl'] },
      { caption:'<b>Planner</b> drafts an outline.', fire:['pl-re'], activate:['pl','re'] },
      { caption:'<b>Researcher</b> gathers evidence and citations.', fire:['re-wr'], activate:['re','wr'] },
      { caption:'<b>Writer</b> produces the complete draft.', fire:['wr-rv'], activate:['wr','rv'] },
      { caption:'<b>Reviewer</b> outputs revision list and final result.', fire:['rv-out'], activate:['rv','out'] },
      { caption:'Each step checkpointed to disk — any failure can be resumed from the prior step.', activate:['in','pl','re','wr','rv','out'] },
    ],
    fit:'Structured workflows · document generation · code pipelines · fixed approval chains · stable enterprise SOPs.',
    risks:'Upstream errors cascade; total latency is the sum of all steps; low adaptability to change.',
    example:{ tag:'RFC PIPELINE', body:'Stable RFC generation pipeline: Planner drafts outline → Researcher adds evidence → Writer writes body → Reviewer produces revision list. Each step checkpointed — the most common form of enterprise SOP automation.' },
    code:{ lang:'python', snippet:`pipeline = Sequential([
    Planner(),
    Researcher(tools=[web_search, db]),
    Writer(),
    Reviewer(criteria=[<span class="s">"clarity"</span>, <span class="s">"factual"</span>]),
])

<span class="c"># Each step auto-checkpointed; output feeds next input.</span>
result = pipeline.run(
    input=task,
    checkpoint_dir=<span class="s">"./runs/{task_id}"</span>,
)

<span class="c"># Any step failure can resume from the last checkpoint.</span>
pipeline.resume_from(<span class="s">"./runs/abc/step3"</span>)`
    },
  },

  {
    id:'parallel', group:'flow', num:'04', grpLabel:'FLOW',
    title:'Parallel Fan-out / Fan-in', titleEn:'Scatter-gather · concurrent · map-reduce',
    aliases:'scatter-gather / concurrent orchestration / map-reduce',
    mechanism:'The same task (or split sub-tasks) is sent to multiple agents in parallel; an aggregator merges, votes, or synthesizes results.',
    nodes:[
      { id:'in',   x:30,  y:240, w:90,  label:'Input', kind:'dark' },
      { id:'disp', x:160, y:230, w:170, label:'Dispatcher', kind:'accent' },
      { id:'sec',  x:400, y:60,  w:170, label:'Security' },
      { id:'perf', x:400, y:230, w:170, label:'Performance' },
      { id:'corr', x:400, y:410, w:170, label:'Correctness' },
      { id:'agg',  x:640, y:230, w:160, label:'Aggregator', kind:'accent' },
    ],
    edges:{
      'in-d':   { from:'in', to:'disp' },
      'd-sec':  { from:'disp', to:'sec', curve:-20 },
      'd-perf': { from:'disp', to:'perf' },
      'd-corr': { from:'disp', to:'corr', curve:20 },
      'sec-a':  { from:'sec',  to:'agg', curve:-20 },
      'perf-a': { from:'perf', to:'agg' },
      'corr-a': { from:'corr', to:'agg', curve:20 },
    },
    timeline:[
      { caption:'Input enters Dispatcher.', fire:['in-d'], activate:['in','disp'] },
      { caption:'Dispatcher fires all 3 reviewers <b>simultaneously</b>.', fire:['d-sec','d-perf','d-corr'], activate:['disp','sec','perf','corr'] },
      { caption:'Three reviewers work in parallel (~2-3 s each).', activate:['sec','perf','corr'] },
      { caption:'All complete — <b>results arrive concurrently</b> at Aggregator.', fire:['sec-a','perf-a','corr-a'], activate:['sec','perf','corr','agg'] },
      { caption:'Aggregator deduplicates, sorts by severity, outputs consolidated verdict.', activate:['agg'] },
    ],
    fit:'Multi-perspective review · parallel retrieval · model comparison · code review · separate security/perf/correctness checks.',
    risks:'Aggregator quality is critical; concurrent writes may conflict; cost can rise significantly.',
    example:{ tag:'PR REVIEW BOT', body:'Same diff sent simultaneously to <b>Security / Performance / Correctness</b> reviewers — all 3 done in ~3 s. Aggregator deduplicates and posts consolidated comment back to GitHub.' },
    code:{ lang:'python', snippet:`<span class="k">async def</span> review_pr(diff):
    <span class="c"># fan-out — all three reviewers run concurrently</span>
    sec, perf, corr = <span class="k">await</span> asyncio.gather(
        security_agent.review(diff),
        performance_agent.review(diff),
        correctness_agent.review(diff),
    )
    <span class="c"># aggregator deduplicates + sorts by severity</span>
    comments = aggregator.merge([sec, perf, corr])
    <span class="k">return</span> deduped_by_severity(comments)

@app.on(<span class="s">"pull_request"</span>)
<span class="k">async def</span> on_pr(pr):
    <span class="k">await</span> pr.post_comment(review_pr(pr.diff))`
    },
    variants:[
      { label:'Scatter-gather', sub:'same task, multiple views', timeline:null },
      { label:'Map-Reduce', sub:'split then parallel',
        timeline:[
          { caption:'Input is <b>split</b> into 3 independent chunks by Dispatcher.', fire:['in-d'], activate:['in','disp'] },
          { caption:'Each reviewer handles only its own chunk (map phase).', fire:['d-sec','d-perf','d-corr'], activate:['disp','sec','perf','corr'] },
          { caption:'Three chunks process independently — not duplicate review of same input.', activate:['sec','perf','corr'] },
          { caption:'<b>Reduce</b> phase: Aggregator joins the 3 chunk results.', fire:['sec-a','perf-a','corr-a'], activate:['sec','perf','corr','agg'] },
          { caption:'Aggregator outputs the full combined result.', activate:['agg'] },
        ],
      },
    ],
  },

  {
    id:'blackboard', group:'flow', num:'10', grpLabel:'FLOW',
    title:'Blackboard / Shared Workspace', titleEn:'Shared memory · event bus · pub-sub',
    aliases:'blackboard / shared memory / event bus / pub-sub',
    mechanism:'Agents read/write a shared space rather than messaging each other directly; current shared state determines which agent acts next.',
    nodes:[
      { id:'ret',  x:50,  y:60,  w:170, label:'Retriever' },
      { id:'rea',  x:680, y:60,  w:170, label:'Reasoner' },
      { id:'data', x:50,  y:410, w:170, label:'Data Agent' },
      { id:'ver',  x:680, y:410, w:170, label:'Verifier' },
      { id:'bb',   x:380, y:200, w:140, h:140, label:'Blackboard', sub:'shared state', kind:'store' },
    ],
    edges:{
      'ret-bb':  { from:'ret',  to:'bb' },
      'rea-bb':  { from:'rea',  to:'bb' },
      'data-bb': { from:'data', to:'bb' },
      'ver-bb':  { from:'ver',  to:'bb' },
    },
    timeline:[
      { caption:'<b>Retriever</b> writes page summaries + source URLs to the Blackboard.', fire:['ret-bb'], activate:['ret','bb'] },
      { caption:'<b>Reasoner</b> sees new evidence, reads from BB and begins inference.', fire:['!rea-bb'], activate:['rea','bb'] },
      { caption:'Reasoner writes conclusion draft <b>back</b> to Blackboard.', fire:['rea-bb'], activate:['rea','bb'] },
      { caption:'<b>Data Agent</b> supplements with structured data.', fire:['data-bb'], activate:['data','bb'] },
      { caption:'<b>Verifier</b> checks each claim — stamps ✅ or ❌.', fire:['!ver-bb'], activate:['ver','bb'] },
      { caption:'Verifier writes verification results back.', fire:['ver-bb'], activate:['ver','bb'] },
      { caption:'Whoever sees "all claims verified" first finalizes — fully async.', activate:['bb'] },
    ],
    fit:'Async research · long-running tasks · data lake retrieval · multi-agent evidence aggregation · shared-state workflows.',
    risks:'Requires strong schema, versioning, locks, TTL, and provenance — otherwise becomes a <b>dirty context pool</b>.',
    example:{ tag:'DEEP RESEARCH', body:'Retriever writes summaries + URLs to blackboard; Reasoner updates conclusion draft on new evidence; Verifier stamps claims ✅/❌. All agents <b>advance asynchronously</b> — whoever sees "all verified" finalizes.' },
    code:{ lang:'python', snippet:`bb = Blackboard(
    schema=ResearchSchema,
    versioned=<span class="k">True</span>,
    ttl=<span class="n">3600</span>,           <span class="c"># claims expire after 1h</span>
)

retriever.subscribe(bb, on=[<span class="s">"query"</span>])
reasoner.subscribe(bb,  on=[<span class="s">"evidence_added"</span>])
verifier.subscribe(bb,  on=[<span class="s">"claim_drafted"</span>])

<span class="c"># agents contribute asynchronously on events they care about</span>
bb.publish(<span class="s">"query"</span>, {<span class="s">"q"</span>: <span class="s">"Explore X"</span>})

<span class="k">while not</span> bb.query(<span class="s">"all_claims_verified"</span>):
    <span class="k">await</span> asyncio.sleep(<span class="n">1</span>)
finalize(bb.snapshot())`
    },
  },

  /* ─── III · DIALOG ─── */
  {
    id:'groupchat', group:'dialog', num:'06', grpLabel:'DIALOG',
    title:'Group Chat / Round-robin', titleEn:'Shared topic · speaker selection · meeting room',
    aliases:'group chat / round-robin / selector meeting / shared topic',
    mechanism:'Multiple agents share one message thread or topic; a rule, LLM selector, or human decides who speaks next.',
    nodes:[
      { id:'topic',  x:380, y:230, w:160, h:90, label:'Shared Topic', sub:'conversation', kind:'bus' },
      { id:'arch',   x:50,  y:60,  w:170, label:'Architect' },
      { id:'eng',    x:50,  y:410, w:170, label:'Engineer' },
      { id:'rev',    x:680, y:60,  w:170, label:'Reviewer' },
      { id:'human',  x:680, y:410, w:170, label:'Human', sub:'moderator' },
      { id:'sel',    x:720, y:240, w:120, label:'Selector', kind:'dark' },
    ],
    edges:{
      'arch-t':  { from:'arch',  to:'topic' },
      'eng-t':   { from:'eng',   to:'topic' },
      'rev-t':   { from:'rev',   to:'topic' },
      'human-t': { from:'human', to:'topic' },
      'sel-t':   { from:'sel',   to:'topic', dashed:true },
    },
    timeline:[
      { caption:'<b>Architect</b> proposes a design.', fire:['arch-t'], activate:['arch','topic'] },
      { caption:'Selector decides who speaks next based on the last message.', fire:['sel-t'], activate:['sel','topic'] },
      { caption:'<b>Engineer</b> receives proposal and raises implementation questions.', fire:['!eng-t'], activate:['eng','topic'] },
      { caption:'Engineer writes questions back to the topic.', fire:['eng-t'], activate:['eng','topic'] },
      { caption:'<b>Reviewer</b> comments on design risks.', fire:['rev-t'], activate:['rev','topic'] },
      { caption:'<b>Human moderator</b> steers the discussion.', fire:['human-t'], activate:['human','topic'] },
      { caption:'Everyone shares one history — transparent multi-perspective, but easy to drift.', activate:['topic','arch','eng','rev','human'] },
    ],
    fit:'Brainstorming · architecture review · expert panel · scenarios requiring explicit multi-party dialogue.',
    risks:'Easy to go off-topic; message history bloats; speaker selection strategy affects quality.',
    example:{ tag:'AUTOGEN GROUP CHAT', body:'Architecture review: proposal posted to a shared topic, <b>Architect / Engineer / Reviewer</b> discuss in one thread; LLM selector picks next speaker based on context; human moderator intervenes to redirect.' },
    code:{ lang:'python', snippet:`<span class="k">from</span> autogen <span class="k">import</span> GroupChat, LLMSelector

architect = AssistantAgent(name=<span class="s">"architect"</span>, ...)
engineer  = AssistantAgent(name=<span class="s">"engineer"</span>,  ...)
reviewer  = AssistantAgent(name=<span class="s">"reviewer"</span>,  ...)
human     = UserProxyAgent(name=<span class="s">"moderator"</span>)

chat = GroupChat(
    agents=[architect, engineer, reviewer, human],
    speaker_selection=LLMSelector(  <span class="c"># picks next based on last message</span>
        model=<span class="s">"claude-haiku"</span>),
    max_round=<span class="n">12</span>,
)
chat.initiate(<span class="s">"Design review: ..."</span>)`
    },
  },

  {
    id:'nested', group:'dialog', num:'07', grpLabel:'DIALOG',
    title:'Nested Chat / Inner Loop', titleEn:'Private sub-dialogue · wrapped workflow',
    aliases:'nested chat / inner loop / private sub-dialogue / wrapped workflow',
    mechanism:'An outer agent triggers an internal agent dialogue before responding; the internal discussion is encapsulated as one outer response.',
    decorations:[ { type:'rect', x:380, y:60, w:280, h:420, label:'NESTED CHAT' } ],
    nodes:[
      { id:'user',  x:40,  y:240, w:100, label:'User', kind:'user' },
      { id:'outer', x:200, y:230, w:150, label:'Outer Agent', kind:'accent' },
      { id:'plan',  x:410, y:90,  w:220, label:'Planner' },
      { id:'exec',  x:410, y:240, w:220, label:'Tool Executor' },
      { id:'crit',  x:410, y:390, w:220, label:'Critic' },
      { id:'reply', x:710, y:240, w:140, label:'Reply', kind:'dark' },
    ],
    edges:{
      'u-o':     { from:'user', to:'outer', label:'request' },
      'o-plan':  { from:'outer', to:'plan' },
      'plan-ex': { from:'plan', to:'exec' },
      'ex-crit': { from:'exec', to:'crit' },
      'crit-pl': { from:'crit', to:'plan', curve:-60 },
      'o-reply': { from:'outer', to:'reply', curve:-100 },
    },
    timeline:[
      { caption:'User sends request to Outer Agent.', fire:['u-o'], activate:['user','outer'] },
      { caption:'Outer Agent privately starts internal dialogue loop.', fire:['o-plan'], activate:['outer','plan'] },
      { caption:'Planner → Tool Executor — selects tools, executes calls.', fire:['plan-ex'], activate:['plan','exec'] },
      { caption:'Critic checks whether result is reasonable.', fire:['ex-crit'], activate:['exec','crit'] },
      { caption:'Critic feeds back to Planner — <b>another round</b> of correction.', fire:['crit-pl'], activate:['crit','plan'] },
      { caption:'After 2-3 rounds, Outer Agent aggregates and prepares output.', fire:['plan-ex','ex-crit'], activate:['plan','exec','crit'] },
      { caption:'Outer delivers <b>one</b> final reply to User — internal dialogue invisible.', fire:['o-reply'], activate:['outer','reply','user'] },
    ],
    fit:'Hiding complex tool calls · reusing internal processes · wrapping multi-step reasoning as a single agent API.',
    risks:'Internal chain is opaque; debugging and attribution need extra tracing; cost is hard to estimate intuitively.',
    example:{ tag:'WRAPPED WORKFLOW', body:'"Write docs" agent privately runs <b>planner → executor → critic</b> for 3 rounds; user sees only one final reply. <b>Externally a simple single-agent API</b>, internally complex but reusable.' },
    code:{ lang:'python', snippet:`<span class="k">class</span> <span class="f">DocWriterAgent</span>(Agent):
    inner = NestedChat(
        agents=[
            Agent(role=<span class="s">"planner"</span>),
            Agent(role=<span class="s">"executor"</span>, tools=[search, edit]),
            Agent(role=<span class="s">"critic"</span>),
        ],
        max_rounds=<span class="n">3</span>,
    )

    <span class="k">async def</span> reply(self, msg):
        <span class="c"># user only sees return value; internal dialogue is hidden</span>
        result = <span class="k">await</span> self.inner.run(msg)
        <span class="k">return</span> result.final_answer`
    },
  },

  {
    id:'roleplay', group:'dialog', num:'09', grpLabel:'DIALOG',
    title:'Role-playing / Virtual Org', titleEn:'Personas · virtual organization · inception prompting',
    aliases:'role-playing / virtual organization / personas / inception prompting',
    mechanism:'Each agent is given a clear role, goal, communication style, and responsibility boundary; tasks are completed through role-based communication.',
    nodes:[
      { id:'task',    x:40,  y:60,  w:120, label:'Task', kind:'user' },
      { id:'pm',      x:230, y:50,  w:170, label:'Product Mgr', sub:'PM', kind:'accent' },
      { id:'arch',    x:450, y:50,  w:170, label:'Architect', kind:'accent' },
      { id:'dev',     x:450, y:220, w:170, label:'Developer', kind:'accent' },
      { id:'test',    x:450, y:390, w:170, label:'Tester', sub:'QA', kind:'accent' },
      { id:'review',  x:230, y:400, w:170, label:'Review', sub:'feedback' },
      { id:'pmc',     x:40,  y:400, w:120, label:'PM check' },
      { id:'release', x:660, y:400, w:160, label:'Release', kind:'dark' },
    ],
    edges:{
      't-pm':     { from:'task', to:'pm' },
      'pm-arch':  { from:'pm',   to:'arch' },
      'arch-dev': { from:'arch', to:'dev' },
      'dev-test': { from:'dev',  to:'test' },
      'test-rv':  { from:'test', to:'review' },
      'rv-pmc':   { from:'review', to:'pmc' },
      'pmc-task': { from:'pmc', to:'task', dashed:true },
      'test-rel': { from:'test', to:'release' },
    },
    timeline:[
      { caption:'Task lands with the <b>PM</b>.', fire:['t-pm'], activate:['task','pm'] },
      { caption:'PM writes PRD, hands to <b>Architect</b>.', fire:['pm-arch'], activate:['pm','arch'] },
      { caption:'Architect produces tech spec, hands to <b>Developer</b>.', fire:['arch-dev'], activate:['arch','dev'] },
      { caption:'Developer writes code, hands to <b>Tester</b>.', fire:['dev-test'], activate:['dev','test'] },
      { caption:'Tester produces review report.', fire:['test-rv'], activate:['test','review'] },
      { caption:'Review feedback routed to <b>PM check</b>.', fire:['rv-pmc'], activate:['review','pmc'] },
      { caption:'If not approved → back to Task for another cycle (dashed).', fire:['pmc-task'], activate:['pmc','task'] },
      { caption:'If approved → Tester triggers <b>Release</b>.', fire:['test-rel'], activate:['test','release'] },
    ],
    fit:'Software development · product design · teaching simulation · corporate process simulation · responsibility decomposition.',
    risks:'Easy to produce lots of procedural dialogue with little real output; role definition ≠ capability guarantee.',
    example:{ tag:'CHATDEV', body:'ChatDev virtual software company: <b>CEO</b> receives requirement → <b>CTO</b> picks stack → <b>PM</b> writes PRD → <b>Programmer</b> codes → <b>Tester</b> runs tests. Waterfall-style deliverable passing. Studies show role-playing <b>significantly improves code accuracy</b>.' },
    code:{ lang:'python', snippet:`<span class="c"># each role has persona + responsibility boundary</span>
ceo = Agent(role=<span class="s">"CEO"</span>,
            persona=<span class="s">"Business-sharp, decisive"</span>)
cto = Agent(role=<span class="s">"CTO"</span>,
            persona=<span class="s">"Deep technical, architecture focus"</span>)
pm  = Agent(role=<span class="s">"PM"</span>,  persona=<span class="s">"User-first"</span>)
dev = Agent(role=<span class="s">"Programmer"</span>)
qa  = Agent(role=<span class="s">"Tester"</span>)

<span class="c"># deliverables pass through waterfall chain</span>
chain = ceo >> cto >> pm >> dev >> qa
release = chain.run(<span class="s">"Build a course registration system"</span>)`
    },
  },

  /* ─── IV · DECISION ─── */
  {
    id:'debate', group:'decision', num:'08', grpLabel:'DECISION',
    title:'Debate / Critic-Judge / Voting', titleEn:'Red/blue team · proposer-skeptic-judge',
    aliases:'debate / red team-blue team / majority vote / proposer-skeptic-judge',
    mechanism:'Multiple agents propose different arguments or answers, critique each other, then a judge, vote, or aggregator gives the final conclusion.',
    nodes:[
      { id:'q',     x:40,  y:230, w:130, label:'Question', kind:'user' },
      { id:'a',     x:260, y:100, w:160, label:'Agent A', sub:'proposer', kind:'accent' },
      { id:'b',     x:260, y:370, w:160, label:'Agent B', sub:'skeptic', kind:'accent' },
      { id:'judge', x:520, y:230, w:170, label:'Judge', sub:'aggregator', kind:'dark' },
      { id:'final', x:730, y:240, w:130, label:'Final' },
    ],
    edges:{
      'q-a':  { from:'q', to:'a' },
      'q-b':  { from:'q', to:'b' },
      'a-b':  { from:'a', to:'b', curve:25 },
      'b-a':  { from:'b', to:'a', curve:25 },
      'a-j':  { from:'a', to:'judge' },
      'b-j':  { from:'b', to:'judge' },
      'j-f':  { from:'judge', to:'final' },
    },
    timeline:[
      { caption:'Question sent simultaneously to Agent A and Agent B.', fire:['q-a','q-b'], activate:['q','a','b'] },
      { caption:'<b>Agent A</b> (proposer) gives answer + reasoning.', activate:['a'] },
      { caption:'<b>Agent B</b> (skeptic) uses web search to find counter-examples.', fire:['a-b'], activate:['a','b'] },
      { caption:'Agent A responds to B\'s critique.', fire:['b-a'], activate:['a','b'] },
      { caption:'Another round — multiple rounds of debate expose blind spots.', fire:['a-b','b-a'], activate:['a','b'] },
      { caption:'Both submit full arguments to <b>Judge</b>.', fire:['a-j','b-j'], activate:['a','b','judge'] },
      { caption:'Judge synthesizes evidence from both sides, produces <b>Final</b> answer.', fire:['j-f'], activate:['judge','final'] },
    ],
    fit:'High-uncertainty reasoning · option evaluation · fact-checking · architecture review · code review · model output quality improvement.',
    risks:'Majority vote ≠ correct; judge bias gets amplified; multi-round debate is costly.',
    example:{ tag:'EMNLP 2024 · MULTI-AGENT DEBATE', body:'Fact checking: Proposer gives answer, Skeptic uses <b>web search</b> for counter-examples, 2-3 rounds of cross-debate; Judge reviews full transcript and finalizes. Studies show <b>significant error reduction</b> in math reasoning and factual tasks at 2-3× token cost.' },
    code:{ lang:'python', snippet:`proposer = Agent(role=<span class="s">"proposer"</span>)
skeptic  = Agent(role=<span class="s">"skeptic"</span>,
                 tools=[web_search])
judge    = Agent(role=<span class="s">"judge"</span>)

answer = <span class="k">await</span> proposer.answer(question)
transcript = [answer]
<span class="k">for</span> _ <span class="k">in</span> <span class="f">range</span>(<span class="n">2</span>):
    critique = <span class="k">await</span> skeptic.critique(answer)
    answer   = <span class="k">await</span> proposer.revise(critique)
    transcript += [critique, answer]

final = <span class="k">await</span> judge.adjudicate(question, transcript)`
    },
    variants:[
      { label:'Critic-Judge debate', sub:'multi-round', timeline:null },
      { label:'Majority vote', sub:'independent answers',
        timeline:[
          { caption:'Question sent simultaneously to Agent A and B (can scale to more).', fire:['q-a','q-b'], activate:['q','a','b'] },
          { caption:'All agents answer <b>independently</b> — no cross-interaction.', activate:['a','b'] },
          { caption:'Answers (optionally weighted by confidence) submitted to Judge.', fire:['a-j','b-j'], activate:['a','b','judge'] },
          { caption:'Judge aggregates: <b>majority vote</b> or weighted average.', activate:['judge'] },
          { caption:'Outputs <b>Final</b>. No debate — lower latency, parallelizable.', fire:['j-f'], activate:['judge','final'] },
        ],
      },
    ],
  },

  {
    id:'auction', group:'decision', num:'11', grpLabel:'DECISION',
    title:'Market / Auction / Contract Net', titleEn:'Market · bidding · Contract Net Protocol',
    aliases:'market / auction / bidding / CNP (Smith 1980)',
    mechanism:'Tasks or resources are allocated through bidding / pricing / negotiation; agents submit bids based on capability, cost, confidence, or utility function.',
    nodes:[
      { id:'mgr', x:40,  y:230, w:170, label:'Manager', sub:'announce', kind:'dark' },
      { id:'aa',  x:350, y:60,  w:160, label:'Agent A', sub:'bid 0.6' },
      { id:'ab',  x:350, y:230, w:160, label:'Agent B', sub:'bid 0.4' },
      { id:'ac',  x:350, y:400, w:160, label:'Agent C', sub:'bid 0.8' },
      { id:'win', x:620, y:230, w:180, label:'Selection', sub:'winner', kind:'accent' },
    ],
    edges:{
      'm-a': { from:'mgr', to:'aa', curve:-15 },
      'm-b': { from:'mgr', to:'ab' },
      'm-c': { from:'mgr', to:'ac', curve:15 },
      'a-w': { from:'aa', to:'win', curve:-15 },
      'b-w': { from:'ab', to:'win' },
      'c-w': { from:'ac', to:'win', curve:15 },
    },
    timeline:[
      { caption:'Manager announces task: "Retrieve 1 box from shelf 3".', activate:['mgr'] },
      { caption:'Broadcast to all candidate agents simultaneously.', fire:['m-a','m-b','m-c'], activate:['mgr','aa','ab','ac'] },
      { caption:'Each agent estimates cost based on <b>position + battery + workload</b>.', activate:['aa','ab','ac'] },
      { caption:'Each submits a bid (lower = more willing to take the task).', fire:['a-w','b-w','c-w'], activate:['aa','ab','ac','win'] },
      { caption:'Selection collects all bids, picks the lowest — <b>Agent B</b>.', activate:['win'] },
      { caption:'Agent B wins, begins execution; reports back to Manager on completion.', activate:['ab','win'] },
    ],
    fit:'Resource scheduling · robot task allocation · compute/tool budget optimization · optimal allocation among competing agents.',
    risks:'Bids may be untrustworthy; negotiation overhead is high; objective function design is hard.',
    example:{ tag:'CONTRACT NET · SMITH 1980', body:'Warehouse multi-robot picking: Manager announces task, each robot bids based on current position + battery + load; manager selects lowest bid. Classic 40-year protocol — most applicable when resources are scarce and capabilities are heterogeneous.' },
    code:{ lang:'python', snippet:`<span class="k">class</span> <span class="f">Manager</span>:
    <span class="k">async def</span> assign(self, task):
        <span class="c"># broadcast + collect bids</span>
        bids = <span class="k">await</span> asyncio.gather(*[
            agent.evaluate(task) <span class="k">for</span> agent <span class="k">in</span> self.fleet
        ])
        <span class="c"># bid = (cost, eta, confidence)</span>
        winner_idx = <span class="f">min</span>(
            <span class="f">range</span>(<span class="f">len</span>(bids)),
            key=<span class="k">lambda</span> i: bids[i].cost,
        )
        <span class="k">return</span> <span class="k">await</span> self.fleet[winner_idx].execute(task)`
    },
    variants:[
      { label:'Lowest cost wins', sub:'simple auction', timeline:null },
      { label:'Weighted score', sub:'multi-criteria',
        timeline:[
          { caption:'Manager announces task + <b>scoring weights</b> (cost: 0.5, eta: 0.3, conf: 0.2).', activate:['mgr'] },
          { caption:'Broadcasts task to all candidate agents.', fire:['m-a','m-b','m-c'], activate:['mgr','aa','ab','ac'] },
          { caption:'Each agent submits (cost, eta, confidence) triple.', activate:['aa','ab','ac'] },
          { caption:'Selection computes weighted composite score.', fire:['a-w','b-w','c-w'], activate:['aa','ab','ac','win'] },
          { caption:'Best composite score wins — <b>Agent A</b> (not necessarily lowest cost).', activate:['aa','win'] },
        ],
      },
    ],
  },

  /* ─── V · DECENTRALIZED / PROTOCOL ─── */
  {
    id:'swarm', group:'decentral', num:'12', grpLabel:'DECENTRALIZED',
    title:'Peer-to-peer / Swarm', titleEn:'P2P · decentralized autonomous network',
    aliases:'P2P / swarm / flat architecture / decentralized autonomy',
    mechanism:'No fixed central controller; agents communicate directly, hand off dynamically, or act based on environment state.',
    nodes:[
      { id:'a', x:140, y:90,  w:160, label:'Agent A' },
      { id:'b', x:600, y:90,  w:160, label:'Agent B' },
      { id:'c', x:600, y:370, w:160, label:'Agent C' },
      { id:'d', x:140, y:370, w:160, label:'Agent D' },
    ],
    edges:{
      'a-b': { from:'a', to:'b' },
      'b-c': { from:'b', to:'c' },
      'c-d': { from:'c', to:'d' },
      'd-a': { from:'d', to:'a' },
      'a-c': { from:'a', to:'c' },
      'b-d': { from:'b', to:'d' },
    },
    timeline:[
      { caption:'Agent A discovers new task, <b>broadcasts</b> to B.', fire:['a-b'], activate:['a','b'] },
      { caption:'B sees it\'s within its capability, forwards to C to collaborate.', fire:['b-c'], activate:['b','c'] },
      { caption:'C contacts A directly to confirm parameters — <b>no manager</b>.', fire:['!a-c'], activate:['c','a'] },
      { caption:'D sees P2P message, autonomously joins to help.', fire:['d-a','b-d'], activate:['d','a','b'] },
      { caption:'Multiple agents form temporary collaboration mesh.', fire:['a-c','c-d'], activate:['a','b','c','d'] },
      { caption:'Any node failure — others continue working. But <b>hard to converge, hard to debug</b>.', activate:['a','b','c','d'] },
    ],
    fit:'Open environments · autonomous networks · dynamic task allocation · scenarios where central control is unavailable or too costly.',
    risks:'Hard to converge; duplicated work; security and governance complexity; very hard to debug.',
    example:{ tag:'DECENTRALIZED CRAWLER', body:'Centerless crawler cluster: each crawler picks uncrawled URLs from shared dedup table; broadcasts new links to P2P network. <b>Any node failure — others continue</b>, no manager. Tradeoff: everyone knows it\'s hard to debug.' },
    code:{ lang:'python', snippet:`<span class="k">class</span> <span class="f">PeerAgent</span>:
    <span class="k">async def</span> on_message(self, msg, ctx):
        <span class="k">if</span> self.can_handle(msg):
            <span class="k">return</span> <span class="k">await</span> self.process(msg)
        <span class="c"># can't handle — pick a peer in the P2P network</span>
        peer = ctx.network.pick_peer(
            criteria=msg.required_capability,
        )
        <span class="k">return</span> <span class="k">await</span> peer.forward(msg)

<span class="c"># no manager; each node is both client and server</span>
node = PeerAgent(id=<span class="s">"a"</span>).join(swarm)`
    },
  },

  {
    id:'protocol', group:'decentral', num:'13', grpLabel:'PROTOCOL',
    title:'Protocol-mediated · A2A / MCP / ANP', titleEn:'Cross-framework · cross-vendor · ecosystem interop',
    aliases:'A2A · agent-to-agent / MCP · Model Context Protocol / ANP · Agent Network Protocol',
    mechanism:'Not a single topology — lets agents, tools, and services across different frameworks, vendors, and ecosystems interconnect via standard protocols.',
    nodes:[
      { id:'local', x:50,  y:230, w:200, label:'Local Agent', kind:'accent' },
      { id:'rem',   x:410, y:60,  w:200, label:'Remote Agent' },
      { id:'mcp',   x:410, y:330, w:200, label:'MCP Server' },
      { id:'tools', x:680, y:210, w:140, label:'Tools' },
      { id:'res',   x:680, y:330, w:140, label:'Resources' },
      { id:'pr',    x:680, y:450, w:140, label:'Prompts' },
    ],
    edges:{
      'l-r':   { from:'local', to:'rem',  label:'A2A · ANP' },
      'l-mcp': { from:'local', to:'mcp',  label:'MCP client' },
      'mcp-t': { from:'mcp',   to:'tools' },
      'mcp-r': { from:'mcp',   to:'res' },
      'mcp-p': { from:'mcp',   to:'pr' },
    },
    timeline:[
      { caption:'Local Agent prepares to call external capabilities.', activate:['local'] },
      { caption:'Calls a partner company\'s Remote Agent via <b>A2A protocol</b>.', fire:['l-r'], activate:['local','rem'] },
      { caption:'Remote Agent processes and <b>responds per protocol</b>.', fire:['!l-r'], activate:['local','rem'] },
      { caption:'Same Local Agent connects to an MCP Server via <b>MCP client</b>.', fire:['l-mcp'], activate:['local','mcp'] },
      { caption:'MCP server exposes <b>Tools</b> — GitHub <code>list_issues</code>, <code>create_pr</code>…', fire:['mcp-t'], activate:['mcp','tools'] },
      { caption:'Also exposes <b>Resources</b> — datasets, files, database tables.', fire:['mcp-r'], activate:['mcp','res'] },
      { caption:'Also exposes <b>Prompts</b> — reusable prompt templates.', fire:['mcp-p'], activate:['mcp','pr'] },
      { caption:'Protocol layer handles auth, capability discovery, error semantics; business code only cares about schema.', activate:['local','mcp','rem'] },
    ],
    fit:'Cross-team / cross-company agent collaboration · enterprise system integration · tool ecosystem access · standardized discovery and communication.',
    risks:'Security perimeter expands; auth, authorization, auditing, schema versioning become <b>core complexity</b>.',
    example:{ tag:'CLAUDE · MCP · A2A', body:'Claude calls GitHub\'s <code>list_issues</code> / <code>create_pr</code> via <code>MCP server</code>; enterprise internally queries a partner company\'s sales agent via <b>A2A</b> protocol. Protocol layer handles <b>identity, capability discovery, error semantics</b> — business code only cares about schema.' },
    code:{ lang:'python', snippet:`<span class="c"># MCP — connect to tool ecosystem</span>
<span class="k">from</span> mcp <span class="k">import</span> Client
github = <span class="k">await</span> Client.connect(<span class="s">"mcp://github.com"</span>)
issues = <span class="k">await</span> github.tools.list_issues(repo=<span class="s">"acme/api"</span>)

<span class="c"># A2A — cross-agent / cross-company calls</span>
<span class="k">from</span> a2a <span class="k">import</span> RemoteAgent
sales = <span class="k">await</span> RemoteAgent.discover(
    <span class="s">"https://partner.co/.well-known/agent.json"</span>,
)
quote = <span class="k">await</span> sales.send({
    <span class="s">"type"</span>: <span class="s">"rfq"</span>,
    <span class="s">"items"</span>: [...],
})`
    },
  },
];

export const PATTERNS: Pattern[] = [...BASE_PATTERNS, ...EXTRA_PATTERNS];
