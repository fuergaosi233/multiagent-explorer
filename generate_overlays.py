import re

# Title mappings (Chinese / English)
TITLE_MAP = {
    'supervisor': '监管者 / Supervisor / Manager',
    'router': '路由器 / Router / Handoff',
    'hierarchy': '层级管理者-工作者 / Hierarchical Manager-Worker',
    'sequential': '顺序管道 / Sequential Pipeline',
    'parallel': '并行扇出 / 扇入 / Parallel Fan-out / Fan-in',
    'blackboard': '黑板 / 共享工作空间 / Blackboard / Shared Workspace',
    'groupchat': '群聊 / 轮询 / Group Chat / Round-robin',
    'nested': '嵌套对话 / 内部循环 / Nested Chat / Inner Loop',
    'roleplay': '角色扮演 / 虚拟组织 / Role-playing / Virtual Org',
    'debate': '辩论 / 批评-裁判 / 投票 / Debate / Critic-Judge / Voting',
    'auction': '市场 / 拍卖 / 合同网 / Market / Auction / Contract Net',
    'swarm': '点对点 / 群体 / Peer-to-peer / Swarm',
    'protocol': '协议中介 · A2A / MCP / ANP',
    'agents-as-tools': '智能体即工具 / Agents-as-tools',
    'graph-workflow': '图 / 状态机 / Graph / State Machine',
    'generator-critic': '生成器-批评者 / Generator-Critic',
    'refinement-loop': '精炼循环 / Refinement Loop',
    'event-bus-pubsub': '事件总线 / 发布-订阅 / Event Bus / Pub-Sub',
    'mixture-of-agents': '智能体混合 / Mixture-of-Agents',
    'human-in-the-loop': '人在回路 / Human-in-the-Loop',
    'clarification-at-edge': '边界澄清 / Clarification-at-edge',
    'coordinator-dispatcher': '协调器 / 调度器 / Coordinator / Dispatcher',
    'voting-ensemble': '投票 / 集成 / Voting / Ensemble',
    'composite-pattern': '复合模式 / Composite Pattern',
    'workspace-isolation': '工作空间隔离 / Workspace Isolation',
    'stigmergy-environment-mediated': '环境媒介协作 / Stigmergy',
    'coalition-federation-holonic': '联盟 / 联邦 / Coalition / Federation',
    'social-simulation': '社会模拟 / Social Simulation',
    'marl-ctde': '多智能体强化学习 / CTDE / MARL / CTDE',
}

def parse_ts_block(text):
    """Parse TypeScript code blocks into pattern data."""
    patterns = {}
    pattern_blocks = re.finditer(r"  '([^']+)':\s*\{(.*?)\n  \},", text, re.DOTALL)
    for m in pattern_blocks:
        pid = m.group(1)
        block = m.group(2)

        timeline_match = re.search(r'timeline:\s*\[(.*?)\n    \],', block, re.DOTALL)
        timeline = None
        if timeline_match:
            timeline = '    timeline: [' + timeline_match.group(1) + '\n    ],'

        nodes_match = re.search(r'nodes:\s*\[(.*?)\n    \],', block, re.DOTALL)
        nodes = None
        if nodes_match:
            nodes = '    nodes: [' + nodes_match.group(1) + '\n    ],'

        patterns[pid] = {'timeline': timeline, 'nodes': nodes}

    return patterns

with open('/tmp/agent1_clean.txt', 'r') as f:
    text = f.read()

patterns = parse_ts_block(text)

# Existing overlay data (mechanismZh, fitZh, risksZh, exampleZh)
BASE_OVERLAYS = {
    'supervisor': {
        'mechanismZh': '一个主智能体保持控制权，将专业智能体作为工具调用。子智能体的中间步骤不会进入用户对话。',
        'fitZh': '生产系统 · 客户支持分流 · 内部 CLI 工具调用 · <b>带审查/测试/搜索子智能体的代码任务</b>。',
        'risksZh': '路由错误会全局级联；监管者在复杂任务上可能成为令牌和延迟瓶颈。',
        'exampleZh': { 'tag': 'CLAUDE CODE', 'body': '主对话保持上下文和用户交互；复杂操作委托给 <b>子智能体</b>：<code>reviewer</code> 检查变更，<code>tester</code> 运行测试，<code>searcher</code> 查找文档。只有最终结论会呈现在主对话中。' },
    },
    'router': {
        'mechanismZh': '当前智能体根据任务类型将控制权转移给另一个智能体；接收智能体完全拥有后续交互。',
        'fitZh': '多领域支持 · 企业流程路由 · 审批流程 · 需要专家长期拥有上下文的场景。',
        'risksZh': '容易产生交接循环；跨智能体上下文裁剪和权限传播至关重要。',
        'exampleZh': { 'tag': 'OPENAI AGENTS SDK', 'body': '<code>Triage Agent</code> 看到"我想退款"后调用 <code>transfer_to(billing_agent)</code> —— 计费智能体接管完整对话直到结束。<b>控制权迁移</b>，而非工具调用。' },
    },
    'hierarchy': {
        'mechanismZh': '智能体按层级组织：上层规划、委派和审查；下层执行。可以深度嵌套。',
        'fitZh': '大型工程任务 · 复杂研究 · 跨模块工作 · 需要 <b>分阶段验收</b> 的企业自动化。',
        'risksZh': '深层级导致延迟和令牌膨胀；顶层规划错误会系统性传播。',
        'exampleZh': { 'tag': 'CREWAI HIERARCHICAL', 'body': '总监接到"构建登录页" → 拆分前端/后端 → 前端/后端经理分配给 UI 智能体、测试智能体 —— 每人审查并上报。两层通常足够；更深会增加返工成本。' },
    },
    'sequential': {
        'mechanismZh': '多个智能体按固定顺序执行；每步输出成为下一步输入。每步有清晰的输入/输出契约。',
        'fitZh': '结构化工作流 · 文档生成 · 代码管道 · 固定审批链 · 稳定的企业 SOP。',
        'risksZh': '上游错误级联；总延迟是所有步骤之和；适应性低。',
        'exampleZh': { 'tag': 'RFC PIPELINE', 'body': '稳定的 RFC 生成管道：规划者起草大纲 → 研究者添加证据 → 作者撰写正文 → 审查者生成修订列表。每步检查点 —— 最常见的企业 SOP 自动化形式。' },
    },
    'parallel': {
        'mechanismZh': '同一任务（或拆分后的子任务）并行发送给多个智能体；聚合器合并、投票或综合结果。',
        'fitZh': '多视角审查 · 并行检索 · 模型对比 · 代码审查 · 分离的安全/性能/正确性检查。',
        'risksZh': '聚合器质量至关重要；并发写入可能冲突；成本可能显著上升。',
        'exampleZh': { 'tag': 'PR REVIEW BOT', 'body': '同一份 diff 同时发送给 <b>安全 / 性能 / 正确性</b> 审查者 —— 三个都在约 3 秒内完成。聚合器去重并发布综合评论回 GitHub。' },
    },
    'blackboard': {
        'mechanismZh': '智能体读写共享空间而非直接互相通信；当前共享状态决定哪个智能体下一步行动。',
        'fitZh': '异步研究 · 长期运行任务 · 数据湖检索 · 多智能体证据聚合 · 共享状态工作流。',
        'risksZh': '需要强模式、版本控制、锁、TTL 和来源追溯 —— 否则会变成 <b>脏上下文池</b>。',
        'exampleZh': { 'tag': 'DEEP RESEARCH', 'body': '检索器将摘要 + URL 写入黑板；推理器在新证据出现时更新结论草稿；审查者标记声明 ✅/❌。所有智能体 <b>异步推进</b> —— 谁先看到"全部验证通过"谁就完成。' },
    },
    'groupchat': {
        'mechanismZh': '多个智能体共享一个消息线程或主题；由规则、LLM 选择器或人类决定下一个发言者。',
        'fitZh': '头脑风暴 · 架构审查 · 专家小组 · 需要显式多方对话的场景。',
        'risksZh': '容易偏离主题；消息历史膨胀；发言选择策略影响质量。',
        'exampleZh': { 'tag': 'AUTOGEN GROUP CHAT', 'body': '架构审查：提案发布到共享主题，<b>架构师 / 工程师 / 审查者</b> 在一个线程中讨论；LLM 选择器基于上下文挑选下一个发言者；人类 moderator 介入重定向。' },
    },
    'nested': {
        'mechanismZh': '外部智能体在响应前触发内部智能体对话；内部讨论被封装为外部的一次响应。',
        'fitZh': '隐藏复杂工具调用 · 复用内部流程 · 将多步推理包装为单个智能体 API。',
        'risksZh': '内部链不透明；调试和归因需要额外追踪；成本难以直观估算。',
        'exampleZh': { 'tag': 'WRAPPED WORKFLOW', 'body': '"写文档" 智能体私下运行 <b>规划者 → 执行者 → 审查者</b> 3 轮；用户只看到一条最终回复。<b>外部是简单的单智能体 API</b>，内部复杂但可复用。' },
    },
    'roleplay': {
        'mechanismZh': '每个智能体被赋予明确的角色、目标、沟通风格和职责边界；通过基于角色的通信完成任务。',
        'fitZh': '软件开发 · 产品设计 · 教学模拟 · 企业流程模拟 · 职责分解。',
        'risksZh': '容易产生大量程序性对话但无实际产出；角色定义 ≠ 能力保证。',
        'exampleZh': { 'tag': 'CHATDEV', 'body': 'ChatDev 虚拟软件公司：<b>CEO</b> 接收需求 → <b>CTO</b> 选择技术栈 → <b>PM</b> 撰写 PRD → <b>程序员</b> 编码 → <b>测试者</b> 运行测试。瀑布式交付传递。研究表明角色扮演 <b>显著提高代码准确性</b>。' },
    },
    'debate': {
        'mechanismZh': '多个智能体提出不同论点或答案，互相批评，然后由裁判、投票或聚合器给出最终结论。',
        'fitZh': '高不确定性推理 · 选项评估 · 事实核查 · 架构审查 · 代码审查 · 模型输出质量改进。',
        'risksZh': '多数票 ≠ 正确；裁判偏见被放大；多轮辩论成本高。',
        'exampleZh': { 'tag': 'EMNLP 2024 · MULTI-AGENT DEBATE', 'body': '事实核查：提议者给出答案，怀疑者使用 <b>网络搜索</b> 寻找反例，2-3 轮交叉辩论；裁判审阅完整记录并定稿。研究表明 <b>数学推理和事实任务错误率显著降低</b>，但令牌成本为 2-3 倍。' },
    },
    'auction': {
        'mechanismZh': '任务或资源通过竞价/定价/协商分配；智能体基于能力、成本、置信度或效用函数提交出价。',
        'fitZh': '资源调度 · 机器人任务分配 · 计算/工具预算优化 · 竞争智能体间的最优分配。',
        'risksZh': '出价可能不可信；协商开销高；目标函数设计困难。',
        'exampleZh': { 'tag': 'CONTRACT NET · SMITH 1980', 'body': '仓库多机器人拣选：管理者发布任务，每个机器人基于当前位置 + 电量 + 负载出价；管理者选择最低出价。经典的 40 年协议 —— 最适用于资源稀缺且能力异构的场景。' },
    },
    'swarm': {
        'mechanismZh': '没有固定中央控制器；智能体直接通信、动态交接或基于环境状态行动。',
        'fitZh': '开放环境 · 自主网络 · 动态任务分配 · 中央控制不可用或成本过高的场景。',
        'risksZh': '难以收敛；重复工作；安全和治理复杂；极难调试。',
        'exampleZh': { 'tag': 'DECENTRALIZED CRAWLER', 'body': '无中心爬虫集群：每个爬虫从共享去重表中挑选未爬 URL；将新链接广播到 P2P 网络。<b>任意节点故障 —— 其他节点继续工作</b>，无需管理者。权衡：众所周知难以调试。' },
    },
    'protocol': {
        'mechanismZh': '不是单一拓扑 —— 让不同框架、供应商和生态系统的智能体、工具和服务通过标准协议互联。',
        'fitZh': '跨团队/跨公司智能体协作 · 企业系统集成 · 工具生态访问 · 标准化发现和通信。',
        'risksZh': '安全边界扩大；身份验证、授权、审计、模式版本控制成为 <b>核心复杂性</b>。',
        'exampleZh': { 'tag': 'CLAUDE · MCP · A2A', 'body': 'Claude 通过 <code>MCP 服务器</code> 调用 GitHub 的 <code>list_issues</code> / <code>create_pr</code>；企业内部通过 <b>A2A</b> 协议查询合作伙伴公司的销售智能体。协议层处理 <b>身份、能力发现、错误语义</b> —— 业务代码只关心模式。' },
    },
}

EXTRA_OVERLAYS = {
    'agents-as-tools': {
        'mechanismZh': '专业智能体被暴露为普通工具调用；宿主保持对话并决定何时调用每个工具。',
        'fitZh': '一次性专业查询 · 检索子任务 · 代码审查 · 宿主掌权的摘要工具。',
        'risksZh': '工具描述过宽 → 宿主不加区分地调用。子智能体返回长散文而非结构化结果。',
        'exampleZh': { 'tag': 'TYPESCRIPT', 'body': '<code>tool({ name:"search_agent", schema, execute: q => searchAgent.run(q) })</code> 将专家暴露为普通工具。宿主的提示声明 <b>何时</b> 调用它。' },
    },
    'graph-workflow': {
        'mechanismZh': '流程是节点 + 边 + 状态的图。LLM 可以选择边但不能绕过状态机。',
        'fitZh': '生产系统 · 审计要求 · 可恢复长期任务 · 带显式门控的多阶段管道。',
        'risksZh': '图过于僵化 → 失去 LLM 灵活性。粗心的状态设计 → 重启后任务无法恢复。',
        'exampleZh': { 'tag': 'LANGGRAPH', 'body': '<code>StateGraph</code> 定义命名节点和条件边；检查点在运行之间持久化状态，使任务在崩溃后能够恢复。' },
    },
    'generator-critic': {
        'mechanismZh': '一个智能体生成草稿；另一个，使用不同的提示和工具，进行批评。生成器根据反馈修订。',
        'fitZh': '代码生成 + 审查 · 文档起草 + 编辑 · 规划 + 验证 · 测试修复循环。',
        'risksZh': '批评者只做风格评论，不做验证。生成器 + 批评者共享相同上下文 → 相关错误。',
        'exampleZh': { 'tag': 'CODING AGENT', 'body': '<code>Coder</code> 编写 diff；<code>TestRunner</code> 执行测试套件并返回失败断言。在测试全部通过之前，diff 被拒绝。' },
    },
    'refinement-loop': {
        'mechanismZh': '重复生成 → 评估 → 修订直到满足退出条件（分数、测试、批准）或预算耗尽。',
        'fitZh': '测试驱动代码修复 · 文档润色 · 提示调优 · 规划迭代。',
        'risksZh': '模糊的退出条件导致无限循环。每轮可能引入新 bug。优化评估器分数而非真实目标。',
        'exampleZh': { 'tag': 'GOOGLE ADK', 'body': '<code>evaluator-optimizer</code> 模式：工作者提出方案，评估器打分，循环在阈值处或 N 轮后退出。' },
    },
    'event-bus-pubsub': {
        'mechanismZh': '智能体向总线发布事件；订阅者异步接收。编排器从事件日志中恢复状态。',
        'fitZh': '平台级异步工作 · 长期运行任务 · 可观测性 · 跨服务智能体编排。',
        'risksZh': '无模式的事件；重复消费导致重复副作用；调试异步管道痛苦。',
        'exampleZh': { 'tag': 'AGENT PLATFORM', 'body': '每个智能体动作发出结构化事件；编排器订阅，追踪 UI 订阅 —— 无直接耦合。' },
    },
    'mixture-of-agents': {
        'mechanismZh': '多个模型或智能体分层生成；每层读取前几层的多个输出并改进。',
        'fitZh': '多模型融合 · 高质量生成 · 创意任务 · 答案综合。',
        'risksZh': '输出过于相关 → 收益递减。延迟和成本随层数 × 智能体数量缩放。',
        'exampleZh': { 'tag': 'PAPER', 'body': '<code>Mixture-of-Agents</code> 将开源模型堆叠为两层，在多个基准测试中超越单一前沿模型。' },
    },
    'human-in-the-loop': {
        'mechanismZh': '风险操作通过人类路由；人类可以批准、拒绝（带反馈）或要求澄清。',
        'fitZh': 'Shell · 文件写入 · 提交 · 部署 · 支付 · 隐私/法律操作。',
        'risksZh': '没有范围、diff、回滚的审批卡 → 人类无法决策。全部批准退化为橡皮图章。',
        'exampleZh': { 'tag': 'CLAUDE CODE', 'body': '在 <code>Bash</code> 之前、破坏性文件操作之前的权限提示；你可以批准一次、始终允许或拒绝。决策进入追踪记录。' },
    },
    'clarification-at-edge': {
        'mechanismZh': '在跨智能体边界或不确定操作之前，模糊度分数触发澄清步骤而非猜测。',
        'fitZh': '模糊需求 · 智能体交接 · 长期任务 · 多约束任务 · 模糊用户意图。',
        'risksZh': '过度中断。问题过于抽象无法回答。澄清结果未反馈到状态中。',
        'exampleZh': { 'tag': 'PAPER', 'body': '<code>AgentAsk</code> 在智能体边界插入学习的澄清器；下游错误率下降而不会造成大量用户提问开销。' },
    },
    'coordinator-dispatcher': {
        'mechanismZh': '服务层（非 LLM）创建任务/运行/会话，应用策略，路由，调度重试，并持久化检查点。',
        'fitZh': '内部平台 · 长期任务 · 多租户智能体服务 · 任何需要可恢复调度和统一策略的地方。',
        'risksZh': '调度器开始编写提示并变成不透明智能体。重试策略分散在各智能体中。没有任务/运行/会话分层。',
        'exampleZh': { 'tag': 'AGENT PLATFORM', 'body': 'FastAPI / gRPC 服务创建运行，选择目标，持久化检查点，返回流 —— 智能体本身只做其专业。' },
    },
    'voting-ensemble': {
        'mechanismZh': '多个智能体生成独立候选；投票、排序或验证器选择最终结果。',
        'fitZh': '分类 · 推理问题 · 多方案 · 事实核查 · 模型融合 · 基准测试。',
        'risksZh': '多数不一定正确。候选过于相似。排序器被流畅散文欺骗。尽可能用工具验证。',
        'exampleZh': { 'tag': 'SELF-CONSISTENCY', 'body': '采样 N 条推理链，对答案投票，输出最一致的 —— 数学/逻辑任务的廉价准确率提升。' },
    },
    'composite-pattern': {
        'mechanismZh': '真实系统结合管道、并行、交接、批评者、人在回路、黑板和协议层到一个业务流中。',
        'fitZh': '企业智能体平台 · 编码智能体 · 支持智能体 · 研究智能体 —— 任何稳定交付重要的场景。',
        'risksZh': '在单一模式验证之前不要组合。没有共享状态/追踪，你无法判断哪一层坏了。',
        'exampleZh': { 'tag': 'CODING AGENT', 'body': '<code>Plan → parallel search → draft → critic → optional HITL → ship</code> —— 全部基于一个任务注册表、一个事件日志、一个工作空间管理器。' },
    },
    'workspace-isolation': {
        'mechanismZh': '每个智能体在自己的工作空间（git worktree、容器、沙盒）中运行。输出作为补丁返回，在合并前审查。',
        'fitZh': '编码智能体 · 并发代码变更 · 实验性方案 · 危险命令 · 测试隔离。',
        'risksZh': '多个智能体写入同一目录。纯文本摘要而非 diff。沙盒权限过宽。不清理 → 资源泄漏。',
        'exampleZh': { 'tag': 'CLAUDE CODE', 'body': '每个智能体一个 <code>git worktree</code>；每个在隔离中运行 <code>npm test</code>；仅在测试全部通过后才合并到主分支。' },
    },
    'stigmergy-environment-mediated': {
        'mechanismZh': '智能体不直接互相通信。它们修改共享环境；其他智能体观察并对痕迹做出反应。',
        'fitZh': '机器人学 · 模拟 · 共享编码工作空间 · 异步研究协作 · 无对话的开放环境。',
        'risksZh': '环境污染。智能体读取过时的痕迹。协调是隐式的 —— 调试需要显式的痕迹类型和时间戳。',
        'exampleZh': { 'tag': 'CODING AGENTS', 'body': '充满 <code>TODO.md</code>、测试报告和开放 PR 的仓库是一个环境媒介环境 —— 许多智能体观察并对他人留下的内容做出反应。' },
    },
    'coalition-federation-holonic': {
        'mechanismZh': '智能体围绕任务形成临时联盟/联邦/整体。重点是治理、成员资格和自治边界 —— 而非单次调用。',
        'fitZh': '跨团队协作 · 开放智能体网络 · 多组织任务 · 互联内部平台。',
        'risksZh': '成员权限不清。联盟 vs 个人目标冲突。组织状态从未清理。',
        'exampleZh': { 'tag': 'RESEARCH', 'body': '整体制造 —— 每个"智能体"本身就是一个团队，有自己的子智能体，对外可见为单一参与者。' },
    },
    'social-simulation': {
        'mechanismZh': '使用多个智能体模拟人群。重点是长期记忆、规划、关系和涌现行为。',
        'fitZh': '用户研究 · 产品验证 · 社会行为模拟 · 游戏 NPC · 组织建模 · 信息传播。',
        'risksZh': '将模拟视为真实预测。角色令人信服但未经验证。长期记忆污染未来运行。',
        'exampleZh': { 'tag': 'GENERATIVE AGENTS', 'body': '25 个 LLM 驱动的村民通过消息、记忆和反思组织情人节派对 —— 斯坦福/谷歌涌现行为演示。' },
    },
    'marl-ctde': {
        'mechanismZh': '多个智能体在环境中学习策略。训练使用全局状态；执行使用每个智能体的局部观察。',
        'fitZh': '机器人学 · 游戏 · 交通 · 调度 · 控制 · 协作/竞争决策研究。',
        'risksZh': '奖励设定错误。仿真到真实差距。将 MARL 与一般 LLM 编排混淆。',
        'exampleZh': { 'tag': 'PAPER', 'body': '<code>MAPPO</code> / <code>QMIX</code> —— 用共享批评器训练协作智能体，去中心化部署。' },
    },
}

base_patterns = [
    'supervisor', 'router', 'hierarchy', 'sequential', 'parallel',
    'blackboard', 'groupchat', 'nested', 'roleplay', 'debate', 'auction',
    'swarm', 'protocol'
]
extra_patterns = [
    'agents-as-tools', 'graph-workflow', 'generator-critic', 'refinement-loop',
    'event-bus-pubsub', 'mixture-of-agents', 'human-in-the-loop', 'clarification-at-edge',
    'coordinator-dispatcher', 'voting-ensemble', 'composite-pattern', 'workspace-isolation',
    'stigmergy-environment-mediated', 'coalition-federation-holonic', 'social-simulation', 'marl-ctde'
]

def clean_node_line(line):
    """Remove kind field from node lines."""
    line = re.sub(r",\s*kind\s*:\s*['\"][^'\"]*['\"]", '', line)
    line = re.sub(r"kind\s*:\s*['\"][^'\"]*['\"],\s*", '', line)
    line = re.sub(r"kind\s*:\s*['\"][^'\"]*['\"]", '', line)
    return line

def format_example(zh):
    tag = zh['tag']
    body = zh['body']
    return f"    exampleZh: {{ tag: '{tag}', body: '{body}' }},"

def generate_file(pids, overlays, patterns, import_line, export_name):
    lines = [import_line, '']
    lines.append(f'export const {export_name}: Record<string, Partial<Pattern>> = ' + '{')
    for pid in pids:
        trans = patterns[pid]
        ov = overlays[pid]
        lines.append(f"  '{pid}': " + '{')
        lines.append(f"    titleZh: '{TITLE_MAP[pid]}',")
        lines.append(f"    mechanismZh: '{ov['mechanismZh']}',")
        lines.append(f"    fitZh: '{ov['fitZh']}',")
        lines.append(f"    risksZh: '{ov['risksZh']}',")
        lines.append(format_example(ov['exampleZh']))
        if trans['timeline']:
            for tl_line in trans['timeline'].split('\n'):
                lines.append('    ' + tl_line)
        if trans['nodes']:
            for node_line in trans['nodes'].split('\n'):
                cleaned = clean_node_line(node_line)
                lines.append('    ' + cleaned)
        last = lines[-1]
        if not last.rstrip().endswith(','):
            lines[-1] = last + ','
        lines.append('  },')
    lines.append('};')
    return '\n'.join(lines)

base_file = generate_file(
    base_patterns, BASE_OVERLAYS, patterns,
    "import type { Pattern } from '@/types/pattern';",
    'PATTERN_ZH_OVERLAYS'
)

extra_file = generate_file(
    extra_patterns, EXTRA_OVERLAYS, patterns,
    "import type { Pattern } from '@/types/pattern';",
    'EXTRA_PATTERN_ZH_OVERLAYS'
)

with open('data/patterns-zh-overlays.ts', 'w') as f:
    f.write(base_file)

with open('data/patterns-extra-zh-overlays.ts', 'w') as f:
    f.write(extra_file)

print("Done! Generated overlay files.")
