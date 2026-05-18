/* All 13 Multi-Agent interaction patterns — data + animation timelines.
   Nodes: { id, x, y, w?, h?, label, sub?, kind? } — kind: '' | 'accent' | 'dark' | 'user' | 'store' | 'bus'
   Edges: { from, to, label?, dashed?, curve? }  — curve: signed perpendicular offset (px); + = clockwise
   Timeline step: { caption, fire?, activate?, dim?, decorate?, duration? }
     fire: ['edgeId', '!edgeId' (reverse), ...]  — multiple edges in one step fire concurrently
   Decorations: optional dashed rectangles drawn first (for "nested chat" box, etc.)
*/

const PATTERNS = [
  /* ─── I · CENTRALIZED CONTROL ─── */
  {
    id: 'supervisor', group: 'centralized', num: '01', grpLabel: 'CENTRALIZED CONTROL',
    title: 'Supervisor / Manager', titleEn: 'Agents-as-tools · 主控代理把专家当作工具调用',
    aliases: '主控 agent / manager / subagents-as-tools / centralized orchestration',
    mechanism: '一个主 agent 保留最终控制权，把其他专业 agent 当作工具调用；子 agent 的中间过程通常不进入用户对话。',
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
      { caption:'<b>User</b> 发起请求，<b>Manager</b> 接收并保留对话主控权。', fire:['u-m'], activate:['user','manager'] },
      { caption:'Manager 把研究子任务派给 <b>Research specialist</b>（agent-as-tool）。', fire:['m-r'], activate:['manager','research'] },
      { caption:'Research 完成后<b>返回结果</b>，主对话仍由 Manager 持有。', fire:['!m-r'], activate:['manager'] },
      { caption:'Manager 接着派 <b>Coder</b> 写代码 / 改代码。', fire:['m-c'], activate:['manager','coder'] },
      { caption:'Coder 返回代码片段。', fire:['!m-c'], activate:['manager'] },
      { caption:'Manager 派 <b>Reviewer</b> 检查质量与正确性。', fire:['m-rv'], activate:['manager','reviewer'] },
      { caption:'Reviewer 返回评审结论。', fire:['!m-rv'], activate:['manager'] },
      { caption:'Manager 汇总三方结果，输出 <b>最终答案</b>。中间过程不暴露给用户。', fire:['m-f'], activate:['manager','final'] },
    ],
    fit:'生产系统 · 客服分诊 · 内部 CLI 工具调用 · <b>代码任务中"主 agent + reviewer/tester/searcher"</b>。',
    risks:'主 agent 路由错误会导致全局错误；复杂任务中主控可能成为 token 和延迟瓶颈。',
    example:{ tag:'CLAUDE CODE', body:'主对话维持上下文与用户交互；复杂动作派给 <b>subagent</b>：<code>reviewer</code> 检查改动、<code>tester</code> 跑测试、<code>searcher</code> 翻文档。只有最终结论浮回主对话，中间工具调用不污染主 context。' },
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

<span class="c"># manager 自主决定在什么时机调用哪个 subagent。</span>
<span class="c"># 子 agent 的中间 token 不进入主对话 context。</span>
answer = <span class="f">await</span> manager.run(<span class="s">"帮我重构这段代码"</span>)`
    },
    variants: [
      { label:'顺序调用', sub:'sequential', timeline:null },
      { label:'并行调用', sub:'parallel',
        timeline:[
          { caption:'<b>User</b> 发起请求，<b>Manager</b> 接收。', fire:['u-m'], activate:['user','manager'] },
          { caption:'Manager <b>同时</b>派给三个 specialist。', fire:['m-r','m-c','m-rv'], activate:['manager','research','coder','reviewer'] },
          { caption:'三个 specialist 并行处理（需任务能拆分为独立子任务时）。', activate:['research','coder','reviewer'] },
          { caption:'结果<b>同时返回</b>给 Manager。', fire:['!m-r','!m-c','!m-rv'], activate:['manager'] },
          { caption:'Manager 汇总，输出 <b>最终答案</b>。', fire:['m-f'], activate:['manager','final'] },
        ],
      },
    ],
  },

  {
    id: 'router', group:'centralized', num:'02', grpLabel:'CENTRALIZED CONTROL',
    title:'Router / Handoff', titleEn:'Transfer · specialist 接管控制权',
    aliases:'路由器 / 转交 / transfer_to_xxx / specialist 接管',
    mechanism:'当前 agent 根据任务类型把控制权转交给另一个 agent；后续交互由被转交的 agent 接管。',
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
      { caption:'User：<b>「我账户被锁了」</b>', fire:['u-t'], activate:['user','triage'] },
      { caption:'Triage 评估意图 — billing? tech? legal?', activate:['triage'] },
      { caption:'识别为 tech，触发 <b>transfer_to(engineering)</b>。', fire:['t-e'], activate:['triage','eng'] },
      { caption:'关键区别：跟 Supervisor 不同，<b>控制权真的走了</b>。Triage 退场。', activate:['eng'], dim:['triage','billing','policy'] },
      { caption:'后续对话由 Engineering 直接接管，无需经过 Triage。', fire:['u-e'], activate:['user','eng'], dim:['triage','billing','policy'] },
      { caption:'Engineering 像专业客服一样处理整个会话，必要时再转交。', fire:['!u-e'], activate:['user','eng'], dim:['triage','billing','policy'] },
    ],
    fit:'多领域客服 · 企业流程分流 · 审批 / 报销 / 技术支持 · 需要长期由某个 specialist 维护上下文。',
    risks:'容易循环交接；handoff 判定需要约束；跨 agent 的<b>上下文裁剪和权限传递</b>比较关键。',
    example:{ tag:'OPENAI AGENTS SDK', body:'<code>Triage Agent</code> 看到「我要退款」就调用 <code>transfer_to(billing_agent)</code>，billing 接管完整对话直到问题关闭，必要时再交回或转给 Engineering。<b>控制权迁移</b>，不是工具调用。' },
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

<span class="c"># 控制权真的走了 — 后续对话不再经过 triage。</span>
session.run(triage, <span class="s">"我要退款"</span>)`
    },
  },

  {
    id:'hierarchy', group:'centralized', num:'05', grpLabel:'CENTRALIZED CONTROL',
    title:'Hierarchical Manager-Worker', titleEn:'公司式层级 · 树状组织',
    aliases:'Director–manager–worker 树 / 多级嵌套 / corporate hierarchy',
    mechanism:'Agent 按层级组织，上级负责规划 / 分派 / 审核，下级负责执行；可多层嵌套。',
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
      { caption:'Director 拿到顶层目标，拆分为两条子计划。', activate:['dir'] },
      { caption:'同时下发给 <b>Frontend Mgr</b> 和 <b>Backend Mgr</b>。', fire:['d-fe','d-be'], activate:['dir','fe','be'] },
      { caption:'各 Manager 收到子计划，开始进一步拆分。', activate:['fe','be'] },
      { caption:'Manager 继续向下分派给 worker（并行）。', fire:['fe-ui','fe-ux','be-api','be-test'], activate:['fe','be','ui','ux','api','test'] },
      { caption:'Worker 并行执行各自任务。', activate:['ui','ux','api','test'] },
      { caption:'结果<b>逐级回交</b>：worker → manager。', fire:['!fe-ui','!fe-ux','!be-api','!be-test'], activate:['fe','be'] },
      { caption:'Manager 验收后上报 Director。', fire:['!d-fe','!d-be'], activate:['dir'] },
      { caption:'Director 汇总所有交付物，做最终验收。', activate:['dir'] },
    ],
    fit:'大型工程 · 复杂研究 · 跨模块任务 · 需要<b>分阶段验收</b>的企业自动化。',
    risks:'层级深导致延迟和 token 膨胀；上级规划错误会系统性扩散。',
    example:{ tag:'CREWAI HIERARCHICAL', body:'Director 收到「做一个登录页」，拆成前端 / 后端两条子计划，交给 <b>Frontend / Backend Manager</b>；下一层 UI Agent、Test Agent 各自执行，逐级回交 review。一般 2 层就够，再深返工成本高。' },
    code:{ lang:'python', snippet:`<span class="k">from</span> crewai <span class="k">import</span> Crew, Agent, Process

director = Agent(role=<span class="s">"Director"</span>, goal=<span class="s">"交付登录页"</span>)
fe_mgr   = Agent(role=<span class="s">"Frontend Mgr"</span>)
be_mgr   = Agent(role=<span class="s">"Backend Mgr"</span>)
ui, ux   = Agent(role=<span class="s">"UI"</span>),  Agent(role=<span class="s">"UX"</span>)
api, tst = Agent(role=<span class="s">"API"</span>), Agent(role=<span class="s">"Test"</span>)

crew = Crew(
    process=Process.hierarchical,
    manager=director,
    agents=[fe_mgr, be_mgr, ui, ux, api, tst],
)
result = crew.kickoff()  <span class="c"># director 拆任务、分派、验收</span>`
    },
  },

  /* ─── II · FLOW ─── */
  {
    id:'sequential', group:'flow', num:'03', grpLabel:'FLOW',
    title:'Sequential Pipeline', titleEn:'顺序链 · 流水线 · 线性 DAG',
    aliases:'chain / pipeline / linear DAG / 流水线',
    mechanism:'多个 agent 按固定顺序执行，前一步输出作为后一步输入；每一步有明确输入输出契约。',
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
      { caption:'Input 进入流水线。', fire:['in-pl'], activate:['in','pl'] },
      { caption:'<b>Planner</b> 起草大纲。', fire:['pl-re'], activate:['pl','re'] },
      { caption:'<b>Researcher</b> 补充证据和引用。', fire:['re-wr'], activate:['re','wr'] },
      { caption:'<b>Writer</b> 把它写成完整稿件。', fire:['wr-rv'], activate:['wr','rv'] },
      { caption:'<b>Reviewer</b> 出修改清单并输出最终结果。', fire:['rv-out'], activate:['rv','out'] },
      { caption:'每一步落盘做 <b>checkpoint</b>，任一步失败可从上一步重放。', activate:['in','pl','re','wr','rv','out'] },
    ],
    fit:'结构化流程 · 文档生成 · 代码生成流水线 · 固定审批链 · 稳定的企业 SOP。',
    risks:'上游错误会级联；整体延迟为各步骤之和；对变化适应性弱。',
    example:{ tag:'RFC PIPELINE', body:'稳定的 RFC 生成流水线：Planner 起草大纲 → Researcher 补证据 → Writer 写正文 → Reviewer 出修改清单。每步落盘做 checkpoint，是企业 SOP 自动化最常见的形态。' },
    code:{ lang:'python', snippet:`pipeline = Sequential([
    Planner(),
    Researcher(tools=[web_search, db]),
    Writer(),
    Reviewer(criteria=[<span class="s">"clarity"</span>, <span class="s">"factual"</span>]),
])

<span class="c"># 每步自动落盘 checkpoint，输出是下一步的输入。</span>
result = pipeline.run(
    input=task,
    checkpoint_dir=<span class="s">"./runs/{task_id}"</span>,
)

<span class="c"># 任一步失败可从上一个 checkpoint 重放。</span>
pipeline.resume_from(<span class="s">"./runs/abc/step3"</span>)`
    },
  },

  {
    id:'parallel', group:'flow', num:'04', grpLabel:'FLOW',
    title:'Parallel Fan-out / Fan-in', titleEn:'Scatter-gather · concurrent · map-reduce',
    aliases:'scatter-gather / concurrent orchestration / map-reduce',
    mechanism:'同一个任务或拆分后的子任务并行发给多个 agent，再由 aggregator 汇总、投票或合成。',
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
      { caption:'Input 进入 Dispatcher。', fire:['in-d'], activate:['in','disp'] },
      { caption:'Dispatcher <b>同时</b>把任务发给 3 个 reviewer。', fire:['d-sec','d-perf','d-corr'], activate:['disp','sec','perf','corr'] },
      { caption:'三个 reviewer 并行处理（各自约 2-3 秒）。', activate:['sec','perf','corr'] },
      { caption:'各自完成，<b>结果同时返回</b>给 Aggregator。', fire:['sec-a','perf-a','corr-a'], activate:['sec','perf','corr','agg'] },
      { caption:'Aggregator 去重、按风险等级排序，输出综合结论。', activate:['agg'] },
    ],
    fit:'多视角评审 · 并行检索 · 多模型对比 · 代码审查 · 安全 / 性能 / 可读性分别检查。',
    risks:'聚合器质量关键；并发状态写入可能冲突；成本可能显著上升。',
    example:{ tag:'PR REVIEW BOT', body:'同一份 diff 同时发给 <b>Security / Performance / Correctness</b> 三个 reviewer，并行跑、最快 3 秒拿到全部结果；Aggregator 去重、按风险等级排序，把综合 comment 写回 GitHub。' },
    code:{ lang:'python', snippet:`<span class="k">async def</span> review_pr(diff):
    <span class="c"># fan-out — 三个 reviewer 同时跑</span>
    sec, perf, corr = <span class="k">await</span> asyncio.gather(
        security_agent.review(diff),
        performance_agent.review(diff),
        correctness_agent.review(diff),
    )
    <span class="c"># aggregator 去重 + 按严重性排序</span>
    comments = aggregator.merge([sec, perf, corr])
    <span class="k">return</span> deduped_by_severity(comments)

@app.on(<span class="s">"pull_request"</span>)
<span class="k">async def</span> on_pr(pr):
    <span class="k">await</span> pr.post_comment(review_pr(pr.diff))`
    },
    variants:[
      { label:'同任务 · 多视角', sub:'scatter-gather', timeline:null },
      { label:'Map-Reduce', sub:'拆分后并行',
        timeline:[
          { caption:'输入被 Dispatcher <b>拆分</b>为 3 个独立块。', fire:['in-d'], activate:['in','disp'] },
          { caption:'每个 reviewer 只处理自己的 chunk（map 阶段）。', fire:['d-sec','d-perf','d-corr'], activate:['disp','sec','perf','corr'] },
          { caption:'三个 chunk 独立处理（不是重复评审同一份输入）。', activate:['sec','perf','corr'] },
          { caption:'<b>reduce</b> 阶段：Aggregator 拼接 / 汇总三个 chunk。', fire:['sec-a','perf-a','corr-a'], activate:['sec','perf','corr','agg'] },
          { caption:'Aggregator 输出拼接后的全量结果。', activate:['agg'] },
        ],
      },
    ],
  },

  {
    id:'blackboard', group:'flow', num:'10', grpLabel:'FLOW',
    title:'Blackboard / Shared Workspace', titleEn:'黑板 · 共享记忆 · 事件总线',
    aliases:'blackboard / shared memory / event bus / pub-sub',
    mechanism:'Agent 不一定直接对话，而是读写共享空间；当前共享状态决定下一步哪个 agent 行动。',
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
      { caption:'<b>Retriever</b> 把搜到的网页摘要 + 来源 URL 写进 Blackboard。', fire:['ret-bb'], activate:['ret','bb'] },
      { caption:'<b>Reasoner</b> 看到新证据，从 BB 读取并开始推理。', fire:['!rea-bb'], activate:['rea','bb'] },
      { caption:'Reasoner 把结论草稿<b>写回</b> Blackboard。', fire:['rea-bb'], activate:['rea','bb'] },
      { caption:'<b>Data Agent</b> 补充结构化数据。', fire:['data-bb'], activate:['data','bb'] },
      { caption:'<b>Verifier</b> 来核对每条 claim — 打 ✅ 或 ❌ 标签。', fire:['!ver-bb'], activate:['ver','bb'] },
      { caption:'Verifier 写回验证结果。', fire:['ver-bb'], activate:['ver','bb'] },
      { caption:'谁先看到「所有 claim 已验证」，谁就 finalize — 完全异步。', activate:['bb'] },
    ],
    fit:'异步研究 · 长期任务 · 数据湖检索 · 多 agent 贡献局部证据 · 需要共享状态和复盘。',
    risks:'需要强 schema、版本、锁、TTL 和 provenance；否则会变成<b>脏上下文池</b>。',
    example:{ tag:'DEEP RESEARCH', body:'Retriever 把搜到的网页摘要 + 来源 URL 写进 blackboard；Reasoner 看到新证据就更新结论草稿；Verifier 给任何 claim 打 ✅ / ❌ 标签。所有 agent <b>异步推进</b>，谁先看到「全部 claim 已验证」谁就 finalize。' },
    code:{ lang:'python', snippet:`bb = Blackboard(
    schema=ResearchSchema,
    versioned=<span class="k">True</span>,
    ttl=<span class="n">3600</span>,           <span class="c"># claim 1h 后过期</span>
)

retriever.subscribe(bb, on=[<span class="s">"query"</span>])
reasoner.subscribe(bb,  on=[<span class="s">"evidence_added"</span>])
verifier.subscribe(bb,  on=[<span class="s">"claim_drafted"</span>])

<span class="c"># agents 异步贡献，看到关心的事件才干活</span>
bb.publish(<span class="s">"query"</span>, {<span class="s">"q"</span>: <span class="s">"探讨 X"</span>})

<span class="k">while not</span> bb.query(<span class="s">"all_claims_verified"</span>):
    <span class="k">await</span> asyncio.sleep(<span class="n">1</span>)
finalize(bb.snapshot())`
    },
  },

  /* ─── III · DIALOG ─── */
  {
    id:'groupchat', group:'dialog', num:'06', grpLabel:'DIALOG',
    title:'Group Chat / Round-robin', titleEn:'群聊 · 会议室 · speaker selection',
    aliases:'group chat / round-robin / selector meeting / shared topic',
    mechanism:'多个 agent 共享同一个消息线程或 topic；由规则、LLM selector 或人类决定下一位发言者。',
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
      { caption:'<b>Architect</b> 提出方案。', fire:['arch-t'], activate:['arch','topic'] },
      { caption:'Selector 根据上一句话决定下一位发言者。', fire:['sel-t'], activate:['sel','topic'] },
      { caption:'<b>Engineer</b> 收到方案，提出实现细节问题。', fire:['!eng-t'], activate:['eng','topic'] },
      { caption:'Engineer 把问题写回 topic。', fire:['eng-t'], activate:['eng','topic'] },
      { caption:'<b>Reviewer</b> 点评方案的风险。', fire:['rev-t'], activate:['rev','topic'] },
      { caption:'<b>Human moderator</b> 介入引导讨论方向。', fire:['human-t'], activate:['human','topic'] },
      { caption:'所有人共享同一历史，多视角透明 — 但容易跑题。', activate:['topic','arch','eng','rev','human'] },
    ],
    fit:'头脑风暴 · 架构评审 · 专家会诊 · 需要显式多方对话的场景。',
    risks:'容易跑题；消息历史膨胀；speaker 选择策略会影响质量。',
    example:{ tag:'AUTOGEN GROUP CHAT', body:'架构评审：把方案丢到一个 topic 里，<b>Architect / Engineer / Reviewer</b> 在同一线程发言；LLM selector 根据上一轮内容决定该谁接话，人类 moderator 随时插入纠偏。适合<b>多视角透明化</b>的评审场景。' },
    code:{ lang:'python', snippet:`<span class="k">from</span> autogen <span class="k">import</span> GroupChat, LLMSelector

architect = AssistantAgent(name=<span class="s">"architect"</span>, ...)
engineer  = AssistantAgent(name=<span class="s">"engineer"</span>,  ...)
reviewer  = AssistantAgent(name=<span class="s">"reviewer"</span>,  ...)
human     = UserProxyAgent(name=<span class="s">"moderator"</span>)

chat = GroupChat(
    agents=[architect, engineer, reviewer, human],
    speaker_selection=LLMSelector(  <span class="c"># 看上一句决定下一位</span>
        model=<span class="s">"claude-haiku"</span>),
    max_round=<span class="n">12</span>,
)
chat.initiate(<span class="s">"设计方案讨论: ..."</span>)`
    },
  },

  {
    id:'nested', group:'dialog', num:'07', grpLabel:'DIALOG',
    title:'Nested Chat / Inner Loop', titleEn:'内嵌对话 · agent 的 private sub-dialogue',
    aliases:'nested chat / inner loop / private sub-dialogue / wrapped workflow',
    mechanism:'外层 agent 在回复前触发一组内部 agent 对话；内部讨论结果被封装成外层 agent 的一次响应。',
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
      { caption:'User 向 Outer Agent 发起请求。', fire:['u-o'], activate:['user','outer'] },
      { caption:'Outer Agent <b>私下</b>启动内部对话循环。', fire:['o-plan'], activate:['outer','plan'] },
      { caption:'Planner → Tool Executor — 选工具、执行调用。', fire:['plan-ex'], activate:['plan','exec'] },
      { caption:'Critic 检查结果是否合理。', fire:['ex-crit'], activate:['exec','crit'] },
      { caption:'Critic 反馈给 Planner，<b>再来一轮</b>修正。', fire:['crit-pl'], activate:['crit','plan'] },
      { caption:'循环 2-3 轮后，Outer Agent 汇总输出。', fire:['plan-ex','ex-crit'], activate:['plan','exec','crit'] },
      { caption:'Outer 给 User <b>一次</b>最终回复，用户看不到内部对话。', fire:['o-reply'], activate:['outer','reply','user'] },
    ],
    fit:'需要隐藏复杂工具调用 · 复用内部流程 · 把多步骤推理包装成单一 agent API。',
    risks:'内部链路容易不可见；调试和归因需要额外 trace；成本不容易直觉估计。',
    example:{ tag:'WRAPPED WORKFLOW', body:'「写文档」agent 接到请求后私下启动 <b>planner → executor → critic</b> 3 轮内部循环；用户只看到一次最终回复，看不到内部对话。<b>对外像普通单 agent API</b>，对内可以复杂但可复用。' },
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
        <span class="c"># 用户只看到返回值，内部对话不暴露</span>
        result = <span class="k">await</span> self.inner.run(msg)
        <span class="k">return</span> result.final_answer`
    },
  },

  {
    id:'roleplay', group:'dialog', num:'09', grpLabel:'DIALOG',
    title:'Role-playing / Virtual Org', titleEn:'角色扮演 · 虚拟公司 · personas',
    aliases:'role-playing / virtual organization / personas / inception prompting',
    mechanism:'每个 agent 被赋予明确角色、目标、话语风格和职责边界，通过角色化通信完成任务。',
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
      { caption:'Task 落到 <b>PM</b> 手上。', fire:['t-pm'], activate:['task','pm'] },
      { caption:'PM 写好 PRD，交给 <b>Architect</b>。', fire:['pm-arch'], activate:['pm','arch'] },
      { caption:'Architect 出技术方案，交给 <b>Developer</b>。', fire:['arch-dev'], activate:['arch','dev'] },
      { caption:'Developer 写代码，交给 <b>Tester</b> 跑测试。', fire:['dev-test'], activate:['dev','test'] },
      { caption:'Tester 出 review 报告。', fire:['test-rv'], activate:['test','review'] },
      { caption:'Review 反馈交给 <b>PM check</b>。', fire:['rv-pmc'], activate:['review','pmc'] },
      { caption:'若不通过 → 回到 Task 再走一轮（dashed）。', fire:['pmc-task'], activate:['pmc','task'] },
      { caption:'若通过 → Tester 触发 <b>Release</b>。', fire:['test-rel'], activate:['test','release'] },
    ],
    fit:'软件开发 · 产品设计 · 教学模拟 · 企业流程模拟 · 复杂任务的职责拆解。',
    risks:'容易形式化对话多、有效产出少；角色设定不等于能力保证。',
    example:{ tag:'CHATDEV', body:'ChatDev 虚拟软件公司：<b>CEO</b> 接需求 → <b>CTO</b> 选技术栈 → <b>PM</b> 写 PRD → <b>Programmer</b> 写代码 → <b>Tester</b> 跑测试。按 waterfall 把交付物逐级传递。实验表明角色化能<b>明显提高代码准确度</b>。' },
    code:{ lang:'python', snippet:`<span class="c"># 每个角色有 persona + 职责边界</span>
ceo = Agent(role=<span class="s">"CEO"</span>,
            persona=<span class="s">"商业敏锐，决策果断"</span>)
cto = Agent(role=<span class="s">"CTO"</span>,
            persona=<span class="s">"技术深度，关注架构"</span>)
pm  = Agent(role=<span class="s">"PM"</span>,  persona=<span class="s">"用户优先"</span>)
dev = Agent(role=<span class="s">"Programmer"</span>)
qa  = Agent(role=<span class="s">"Tester"</span>)

<span class="c"># 交付物逐级传递 (waterfall)</span>
chain = ceo >> cto >> pm >> dev >> qa
release = chain.run(<span class="s">"做一个课程报名系统"</span>)`
    },
  },

  /* ─── IV · DECISION ─── */
  {
    id:'debate', group:'decision', num:'08', grpLabel:'DECISION',
    title:'Debate / Critic-Judge / Voting', titleEn:'辩论 · 红 / 蓝队 · proposer-skeptic-judge',
    aliases:'debate / red team-blue team / majority vote / proposer-skeptic-judge',
    mechanism:'多个 agent 提出不同论点或答案，互相批评 / 反驳，最后由 judge、投票或聚合器给出结论。',
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
      { caption:'Question 同时发给 Agent A 和 Agent B。', fire:['q-a','q-b'], activate:['q','a','b'] },
      { caption:'<b>Agent A</b>（proposer）给出答案 + 论据。', activate:['a'] },
      { caption:'<b>Agent B</b>（skeptic）用 web search 找反例，反驳 A。', fire:['a-b'], activate:['a','b'] },
      { caption:'Agent A 回应 B 的质疑。', fire:['b-a'], activate:['a','b'] },
      { caption:'再来一轮 — 多轮辩论暴露盲点。', fire:['a-b','b-a'], activate:['a','b'] },
      { caption:'双方把完整论证提交给 <b>Judge</b>。', fire:['a-j','b-j'], activate:['a','b','judge'] },
      { caption:'Judge 综合两边证据，给出 <b>Final</b> 答案。', fire:['j-f'], activate:['judge','final'] },
    ],
    fit:'高不确定推理 · 方案取舍 · 事实核查 · 架构评审 · 代码 review · 模型输出质量提升。',
    risks:'多数票不等于正确；judge 偏差会被放大；多轮辩论成本高。',
    example:{ tag:'EMNLP 2024 · MULTI-AGENT DEBATE', body:'事实核查：Proposer 给答案，Skeptic 用 <b>web search</b> 找反例，两人互相反驳 2-3 轮；Judge 看完整辩论后定稿。论文实验显示在数学推理和事实任务上能<b>显著降低错误率</b>，代价是 2-3 倍的 token 成本。' },
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
      { label:'辩论 · critic-judge', sub:'debate', timeline:null },
      { label:'多数投票', sub:'majority vote',
        timeline:[
          { caption:'Question 同时发给 Agent A 和 B（可多只）。', fire:['q-a','q-b'], activate:['q','a','b'] },
          { caption:'全部 agent <b>各自独立</b>给出答案 (不互动)。', activate:['a','b'] },
          { caption:'答案考虑权重 / 置信度后交给 Judge。', fire:['a-j','b-j'], activate:['a','b','judge'] },
          { caption:'Judge 汇总：<b>多数投票</b> 或 加权平均。', activate:['judge'] },
          { caption:'输出 <b>Final</b>。不走辩论，低延迟、可并行。', fire:['j-f'], activate:['judge','final'] },
        ],
      },
    ],
  },

  {
    id:'auction', group:'decision', num:'11', grpLabel:'DECISION',
    title:'Market / Auction / Contract Net', titleEn:'市场 · 竞标 · Contract Net Protocol',
    aliases:'market / auction / bidding / CNP (Smith 1980)',
    mechanism:'任务或资源通过竞标 / 报价 / 协商分配；agent 基于能力、成本、置信度或效用函数提交 bid。',
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
      { caption:'Manager 公告任务：「去 3 号货架取 1 箱」。', activate:['mgr'] },
      { caption:'同时广播给所有候选 agent。', fire:['m-a','m-b','m-c'], activate:['mgr','aa','ab','ac'] },
      { caption:'每个 agent 按<b>当前位置 + 电量 + 会议负载</b>估算成本。', activate:['aa','ab','ac'] },
      { caption:'各自提交 bid（数值越低越愿意做）。', fire:['a-w','b-w','c-w'], activate:['aa','ab','ac','win'] },
      { caption:'Selection 收齐 bid，挑出最低的 — <b>Agent B</b>。', activate:['win'] },
      { caption:'Agent B 中标，开始执行；完成后回报 Manager。', activate:['ab','win'] },
    ],
    fit:'资源调度 · 机器人任务分配 · 计算 / 工具预算优化 · 多 agent 竞争同一任务的最优分配。',
    risks:'bid 可能不可信；协商开销大；目标函数设计困难。',
    example:{ tag:'CONTRACT NET · SMITH 1980', body:'仓库多机器人取货：Manager 公告任务，每个机器人按当前位置 + 电量 + 会议负载算出 bid；manager 选最低 bid 的执行。资源稀缺与能力异构时最适用，多机器人协调里 40 年的经典协议。' },
    code:{ lang:'python', snippet:`<span class="k">class</span> <span class="f">Manager</span>:
    <span class="k">async def</span> assign(self, task):
        <span class="c"># 广播 + 收 bid</span>
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
      { label:'最低价中标', sub:'lowest cost wins', timeline:null },
      { label:'多准则评分', sub:'weighted score',
        timeline:[
          { caption:'Manager 公告任务 + <b>评分权重</b> (cost: 0.5, eta: 0.3, conf: 0.2)。', activate:['mgr'] },
          { caption:'广播任务给所有候选 agent。', fire:['m-a','m-b','m-c'], activate:['mgr','aa','ab','ac'] },
          { caption:'每个 agent 提交 (cost, eta, confidence) 三元组。', activate:['aa','ab','ac'] },
          { caption:'Selection 按加权和算综合分。', fire:['a-w','b-w','c-w'], activate:['aa','ab','ac','win'] },
          { caption:'综合最佳的 <b>Agent A</b> 中标（不一定是 cost 最低）。', activate:['aa','win'] },
        ],
      },
    ],
  },

  /* ─── V · DECENTRALIZED / PROTOCOL ─── */
  {
    id:'swarm', group:'decentral', num:'12', grpLabel:'DECENTRALIZED',
    title:'Peer-to-peer / Swarm', titleEn:'P2P · 去中心化自治网络',
    aliases:'P2P / swarm / flat architecture / decentralized autonomy',
    mechanism:'没有固定中心控制器；agents 直接互相通信、动态接力或基于环境状态行动。',
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
      { caption:'Agent A 主动发现新任务，<b>广播</b>给 B。', fire:['a-b'], activate:['a','b'] },
      { caption:'B 一看是自己能力范围，转发给 C 协作。', fire:['b-c'], activate:['b','c'] },
      { caption:'C 直接联系 A 确认参数 — <b>没有 manager</b>。', fire:['!a-c'], activate:['c','a'] },
      { caption:'D 看到 P2P 消息，自主加入协助。', fire:['d-a','b-d'], activate:['d','a','b'] },
      { caption:'多个 agent 形成临时协作 mesh。', fire:['a-c','c-d'], activate:['a','b','c','d'] },
      { caption:'任意节点宕机其它节点继续工作 — 但<b>难以收敛、难调试</b>。', activate:['a','b','c','d'] },
    ],
    fit:'开放环境 · 自治网络 · 动态任务分配 · 中心控制不可用或成本过高的场景。',
    risks:'难以收敛；重复劳动；安全与治理复杂；debug 困难。',
    example:{ tag:'DECENTRALIZED CRAWLER', body:'无中心爬虫集群：每个 crawler 看共享的去重表，自主挑还没爬的 URL；爬到新链接就广播到 P2P 网络。<b>任意节点宕机其它节点继续工作</b>，没有 manager。交换的代价：老实人都知道难调试。' },
    code:{ lang:'python', snippet:`<span class="k">class</span> <span class="f">PeerAgent</span>:
    <span class="k">async def</span> on_message(self, msg, ctx):
        <span class="k">if</span> self.can_handle(msg):
            <span class="k">return</span> <span class="k">await</span> self.process(msg)
        <span class="c"># 不能处理就在 P2P 网络挑一个 peer 转发</span>
        peer = ctx.network.pick_peer(
            criteria=msg.required_capability,
        )
        <span class="k">return</span> <span class="k">await</span> peer.forward(msg)

<span class="c"># 没有 manager；每个节点既是 client 也是 server</span>
node = PeerAgent(id=<span class="s">"a"</span>).join(swarm)`
    },
  },

  {
    id:'protocol', group:'decentral', num:'13', grpLabel:'PROTOCOL',
    title:'Protocol-mediated · A2A / MCP / ANP', titleEn:'跨框架 · 跨供应商 · 生态互联',
    aliases:'A2A · agent-to-agent / MCP · Model Context Protocol / ANP · Agent Network Protocol',
    mechanism:'不是单一拓扑，而是让不同框架、供应商、服务或工具生态里的 agent / 工具通过标准协议互联。',
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
      { caption:'Local Agent 准备调用外部能力。', activate:['local'] },
      { caption:'通过 <b>A2A 协议</b>调用另一家公司的 Remote Agent。', fire:['l-r'], activate:['local','rem'] },
      { caption:'Remote Agent 处理后<b>按协议返回</b>结果。', fire:['!l-r'], activate:['local','rem'] },
      { caption:'同一个 Local Agent 也可以通过 <b>MCP client</b> 连接 MCP Server。', fire:['l-mcp'], activate:['local','mcp'] },
      { caption:'MCP server 暴露 <b>Tools</b> — GitHub <code>list_issues</code>、<code>create_pr</code>…', fire:['mcp-t'], activate:['mcp','tools'] },
      { caption:'也暴露 <b>Resources</b> — 数据集、文件、数据库表。', fire:['mcp-r'], activate:['mcp','res'] },
      { caption:'还可以暴露 <b>Prompts</b> — 复用的 prompt 模板。', fire:['mcp-p'], activate:['mcp','pr'] },
      { caption:'协议层处理认证、能力发现、错误语义；业务代码只关心 schema。', activate:['local','mcp','rem'] },
    ],
    fit:'跨团队 / 跨公司 agent 协作 · 企业系统集成 · 工具生态接入 · 需要标准化发现和通信。',
    risks:'安全边界扩大；认证、授权、审计、schema 版本管理成为<b>核心复杂度</b>。',
    example:{ tag:'CLAUDE · MCP · A2A', body:'Claude 通过 <code>MCP server</code> 调用 GitHub 的 <code>list_issues</code> / <code>create_pr</code>；企业内部通过 <b>A2A</b> 协议向另一家公司的销售 agent 发起报价询问。协议层处理<b>身份认证、能力发现、错误语义</b>，业务代码只关心 schema。' },
    code:{ lang:'python', snippet:`<span class="c"># MCP — 接入工具生态</span>
<span class="k">from</span> mcp <span class="k">import</span> Client
github = <span class="k">await</span> Client.connect(<span class="s">"mcp://github.com"</span>)
issues = <span class="k">await</span> github.tools.list_issues(repo=<span class="s">"acme/api"</span>)

<span class="c"># A2A — 跨 agent / 跨公司调用</span>
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

window.PATTERNS = PATTERNS;
