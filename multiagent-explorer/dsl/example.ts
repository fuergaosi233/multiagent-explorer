/**
 * Three existing patterns rewritten with the DSL, to demonstrate parity.
 *
 *   - supervisor : simple base case (with variants)
 *   - parallel   : fan-out/fan-in with a Map-Reduce variant
 *   - nested     : has a dashed decoration box
 *
 * Each `.build()` produces an object satisfying `Pattern`, drop-in compatible
 * with the existing `PATTERNS` array in `data/patterns.ts`.
 */

import { definePattern, edge, node, step } from './builder';

/* ──────────────────────────────────────────────────────────────────────── */
/* 01 · Supervisor / Manager                                                */
/* ──────────────────────────────────────────────────────────────────────── */

export const supervisor = definePattern('supervisor')
  .group('centralized', '01', 'CENTRALIZED CONTROL')
  .title('Supervisor / Manager', 'Agents-as-tools · centralized orchestration')
  .aliases('manager / subagents-as-tools / centralized orchestration')
  .mechanism(
    'One primary agent retains control, calling specialist agents as tools. Sub-agent intermediate steps do not enter the user conversation.'
  )
  .nodes({
    user: node.user('User', { at: [40, 240], w: 100 }),
    manager: node.accent('Manager', { at: [230, 230], w: 180, sub: 'supervisor' }),
    research: node.plain('Research', { at: [580, 50], w: 170, sub: 'specialist' }),
    coder: node.plain('Coder', { at: [580, 230], w: 170, sub: 'specialist' }),
    reviewer: node.plain('Reviewer', { at: [580, 410], w: 170, sub: 'specialist' }),
    final: node.dark('Final Answer', { at: [230, 430], w: 180 }),
  })
  .edges(($) => ({
    'u-m': edge($.user, $.manager, 'request'),
    'm-r': edge($.manager, $.research, 'call as tool', { curve: -20 }),
    'm-c': edge($.manager, $.coder, 'call'),
    'm-rv': edge($.manager, $.reviewer, 'call', { curve: 20 }),
    'm-f': edge($.manager, $.final),
  }))
  .timeline(($) => [
    step('<b>User</b> sends request; <b>Manager</b> takes control of the conversation.', {
      fire: [$.fwd('u-m')],
      activate: [$.user, $.manager],
    }),
    step('Manager delegates research to <b>Research specialist</b> (agent-as-tool).', {
      fire: [$.fwd('m-r')],
      activate: [$.manager, $.research],
    }),
    step('Research returns results; conversation stays with Manager.', {
      fire: [$.rev('m-r')],
      activate: [$.manager],
    }),
    step('Manager calls <b>Coder</b> to write / edit code.', {
      fire: [$.fwd('m-c')],
      activate: [$.manager, $.coder],
    }),
    step('Coder returns code snippet.', {
      fire: [$.rev('m-c')],
      activate: [$.manager],
    }),
    step('Manager calls <b>Reviewer</b> to check quality.', {
      fire: [$.fwd('m-rv')],
      activate: [$.manager, $.reviewer],
    }),
    step('Reviewer returns review verdict.', {
      fire: [$.rev('m-rv')],
      activate: [$.manager],
    }),
    step(
      'Manager aggregates all results, outputs <b>Final Answer</b>. Intermediate steps hidden from user.',
      { fire: [$.fwd('m-f')], activate: [$.manager, $.final] }
    ),
  ])
  .fit(
    'Production systems · customer support triage · internal CLI tool calls · <b>code tasks with reviewer/tester/searcher subagents</b>.'
  )
  .risks(
    'Routing errors cascade globally; supervisor can become a token and latency bottleneck on complex tasks.'
  )
  .example(
    'CLAUDE CODE',
    'Main conversation holds context and user interaction; complex actions delegated to <b>subagents</b>: <code>reviewer</code> checks changes, <code>tester</code> runs tests, <code>searcher</code> looks up docs. Only final conclusions surface to main conversation.'
  )
  .code(
    'python',
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
  )
  .variant('Sequential', 'one at a time', null)
  .variant('Parallel', 'concurrent calls', ($) => [
    step('<b>User</b> sends request; <b>Manager</b> takes control.', {
      fire: [$.fwd('u-m')],
      activate: [$.user, $.manager],
    }),
    step('Manager dispatches to all three specialists <b>simultaneously</b>.', {
      fire: [$.fwd('m-r'), $.fwd('m-c'), $.fwd('m-rv')],
      activate: [$.manager, $.research, $.coder, $.reviewer],
    }),
    step('All three specialists work in parallel (tasks must be independent).', {
      activate: [$.research, $.coder, $.reviewer],
    }),
    step('Results <b>return concurrently</b> to Manager.', {
      fire: [$.rev('m-r'), $.rev('m-c'), $.rev('m-rv')],
      activate: [$.manager],
    }),
    step('Manager aggregates and outputs <b>Final Answer</b>.', {
      fire: [$.fwd('m-f')],
      activate: [$.manager, $.final],
    }),
  ])
  .build();

/* ──────────────────────────────────────────────────────────────────────── */
/* 04 · Parallel Fan-out / Fan-in                                           */
/* ──────────────────────────────────────────────────────────────────────── */

export const parallel = definePattern('parallel')
  .group('flow', '04', 'FLOW')
  .title('Parallel Fan-out / Fan-in', 'Scatter-gather · concurrent · map-reduce')
  .aliases('scatter-gather / concurrent orchestration / map-reduce')
  .mechanism(
    'The same task (or split sub-tasks) is sent to multiple agents in parallel; an aggregator merges, votes, or synthesizes results.'
  )
  .nodes({
    in: node.dark('Input', { at: [30, 240], w: 90 }),
    disp: node.accent('Dispatcher', { at: [160, 230], w: 170 }),
    sec: node.plain('Security', { at: [400, 60], w: 170 }),
    perf: node.plain('Performance', { at: [400, 230], w: 170 }),
    corr: node.plain('Correctness', { at: [400, 410], w: 170 }),
    agg: node.accent('Aggregator', { at: [640, 230], w: 160 }),
  })
  .edges(($) => ({
    'in-d': edge($.in, $.disp),
    'd-sec': edge($.disp, $.sec, undefined, { curve: -20 }),
    'd-perf': edge($.disp, $.perf),
    'd-corr': edge($.disp, $.corr, undefined, { curve: 20 }),
    'sec-a': edge($.sec, $.agg, undefined, { curve: -20 }),
    'perf-a': edge($.perf, $.agg),
    'corr-a': edge($.corr, $.agg, undefined, { curve: 20 }),
  }))
  .timeline(($) => [
    step('Input enters Dispatcher.', {
      fire: [$.fwd('in-d')],
      activate: [$.in, $.disp],
    }),
    step('Dispatcher fires all 3 reviewers <b>simultaneously</b>.', {
      fire: [$.fwd('d-sec'), $.fwd('d-perf'), $.fwd('d-corr')],
      activate: [$.disp, $.sec, $.perf, $.corr],
    }),
    step('Three reviewers work in parallel (~2-3 s each).', {
      activate: [$.sec, $.perf, $.corr],
    }),
    step('All complete — <b>results arrive concurrently</b> at Aggregator.', {
      fire: [$.fwd('sec-a'), $.fwd('perf-a'), $.fwd('corr-a')],
      activate: [$.sec, $.perf, $.corr, $.agg],
    }),
    step('Aggregator deduplicates, sorts by severity, outputs consolidated verdict.', {
      activate: [$.agg],
    }),
  ])
  .fit(
    'Multi-perspective review · parallel retrieval · model comparison · code review · separate security/perf/correctness checks.'
  )
  .risks(
    'Aggregator quality is critical; concurrent writes may conflict; cost can rise significantly.'
  )
  .example(
    'PR REVIEW BOT',
    'Same diff sent simultaneously to <b>Security / Performance / Correctness</b> reviewers — all 3 done in ~3 s. Aggregator deduplicates and posts consolidated comment back to GitHub.'
  )
  .code(
    'python',
    `<span class="k">async def</span> review_pr(diff):
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
  )
  .variant('Scatter-gather', 'same task, multiple views', null)
  .variant('Map-Reduce', 'split then parallel', ($) => [
    step('Input is <b>split</b> into 3 independent chunks by Dispatcher.', {
      fire: [$.fwd('in-d')],
      activate: [$.in, $.disp],
    }),
    step('Each reviewer handles only its own chunk (map phase).', {
      fire: [$.fwd('d-sec'), $.fwd('d-perf'), $.fwd('d-corr')],
      activate: [$.disp, $.sec, $.perf, $.corr],
    }),
    step(
      'Three chunks process independently — not duplicate review of same input.',
      { activate: [$.sec, $.perf, $.corr] }
    ),
    step('<b>Reduce</b> phase: Aggregator joins the 3 chunk results.', {
      fire: [$.fwd('sec-a'), $.fwd('perf-a'), $.fwd('corr-a')],
      activate: [$.sec, $.perf, $.corr, $.agg],
    }),
    step('Aggregator outputs the full combined result.', { activate: [$.agg] }),
  ])
  .build();

/* ──────────────────────────────────────────────────────────────────────── */
/* 07 · Nested Chat / Inner Loop                                            */
/* ──────────────────────────────────────────────────────────────────────── */

export const nested = definePattern('nested')
  .group('dialog', '07', 'DIALOG')
  .title('Nested Chat / Inner Loop', 'Private sub-dialogue · wrapped workflow')
  .aliases('nested chat / inner loop / private sub-dialogue / wrapped workflow')
  .mechanism(
    'An outer agent triggers an internal agent dialogue before responding; the internal discussion is encapsulated as one outer response.'
  )
  .decoration({ type: 'rect', x: 380, y: 60, w: 280, h: 420, label: 'NESTED CHAT' })
  .nodes({
    user: node.user('User', { at: [40, 240], w: 100 }),
    outer: node.accent('Outer Agent', { at: [200, 230], w: 150 }),
    plan: node.plain('Planner', { at: [410, 90], w: 220 }),
    exec: node.plain('Tool Executor', { at: [410, 240], w: 220 }),
    crit: node.plain('Critic', { at: [410, 390], w: 220 }),
    reply: node.dark('Reply', { at: [710, 240], w: 140 }),
  })
  .edges(($) => ({
    'u-o': edge($.user, $.outer, 'request'),
    'o-plan': edge($.outer, $.plan),
    'plan-ex': edge($.plan, $.exec),
    'ex-crit': edge($.exec, $.crit),
    'crit-pl': edge($.crit, $.plan, undefined, { curve: -60 }),
    'o-reply': edge($.outer, $.reply, undefined, { curve: -100 }),
  }))
  .timeline(($) => [
    step('User sends request to Outer Agent.', {
      fire: [$.fwd('u-o')],
      activate: [$.user, $.outer],
    }),
    step('Outer Agent privately starts internal dialogue loop.', {
      fire: [$.fwd('o-plan')],
      activate: [$.outer, $.plan],
    }),
    step('Planner → Tool Executor — selects tools, executes calls.', {
      fire: [$.fwd('plan-ex')],
      activate: [$.plan, $.exec],
    }),
    step('Critic checks whether result is reasonable.', {
      fire: [$.fwd('ex-crit')],
      activate: [$.exec, $.crit],
    }),
    step('Critic feeds back to Planner — <b>another round</b> of correction.', {
      fire: [$.fwd('crit-pl')],
      activate: [$.crit, $.plan],
    }),
    step('After 2-3 rounds, Outer Agent aggregates and prepares output.', {
      fire: [$.fwd('plan-ex'), $.fwd('ex-crit')],
      activate: [$.plan, $.exec, $.crit],
    }),
    step('Outer delivers <b>one</b> final reply to User — internal dialogue invisible.', {
      fire: [$.fwd('o-reply')],
      activate: [$.outer, $.reply, $.user],
    }),
  ])
  .fit(
    'Hiding complex tool calls · reusing internal processes · wrapping multi-step reasoning as a single agent API.'
  )
  .risks(
    'Internal chain is opaque; debugging and attribution need extra tracing; cost is hard to estimate intuitively.'
  )
  .example(
    'WRAPPED WORKFLOW',
    '"Write docs" agent privately runs <b>planner → executor → critic</b> for 3 rounds; user sees only one final reply. <b>Externally a simple single-agent API</b>, internally complex but reusable.'
  )
  .code(
    'python',
    `<span class="k">class</span> <span class="f">DocWriterAgent</span>(Agent):
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
  )
  .build();

/* ──────────────────────────────────────────────────────────────────────── */
/* Tiny smoke-test runner — call from a script if you want to verify        */
/* the DSL still produces well-formed patterns. Not wired into the app.     */
/* ──────────────────────────────────────────────────────────────────────── */

export function runDslExamples(): void {
  const built = [supervisor, parallel, nested];
  for (const p of built) {
    // The `.build()` calls already validated; this just smoke-checks the result.
    if (!p.id || !p.title || p.nodes.length === 0 || p.timeline.length === 0) {
      throw new Error(`Pattern "${p.id}" looks malformed after build().`);
    }
    // eslint-disable-next-line no-console
    console.log(
      `[dsl] built "${p.id}" — ${p.nodes.length} nodes, ${
        Object.keys(p.edges).length
      } edges, ${p.timeline.length} timeline steps`
    );
  }
}
