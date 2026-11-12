/* tCK Atlas — data model and teaching traces.
   The waveforms are deliberately schematic. Timing relationships are kept,
   while absolute cycle counts are illustrative and not tied to one JEDEC bin. */
(function () {
  'use strict';

  const D8 = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];

  const CATEGORIES = [
    { id: 'clock', code: '01', zh: '节拍与突发', en: 'CLOCK & BURST' },
    { id: 'row', code: '02', zh: '行周期', en: 'ROW CYCLE' },
    { id: 'schedule', code: '03', zh: '命令调度', en: 'SCHEDULING' },
    { id: 'recovery', code: '04', zh: '读写恢复', en: 'TURNAROUND' },
    { id: 'refresh', code: '05', zh: '刷新', en: 'REFRESH' }
  ];

  const PARAMS = [
    {
      id: 'tck',
      category: 'clock',
      symbol: 'tCK',
      nameZh: '时钟周期',
      nameEn: 'Clock Cycle Time',
      aliases: ['Clock Period', '时钟周期时间'],
      intro: 'DDR 世界里的绝对时间底座。所有以 tCK 计数的参数，乘上它才会变成纳秒；频率越高，这个节拍越短。',
      tags: ['FOUNDATION', 'DDR4 / DDR5'],
      facts: [
        { label: '量纲', value: 'ns' },
        { label: '基准信号', value: 'CK_t / CK_c' },
        { label: '数据率', value: '2 transfers / tCK' },
        { label: '快速换算', value: '2000 / MT·s⁻¹' }
      ],
      relation: 'tCK(ns) = 2000 ÷ 数据率(MT/s)',
      relationNote: 'DDR 在 CK 的上下沿各传输一次，所以 3200 MT/s 对应 1600 MHz 时钟与 0.625 ns 的 tCK。',
      steps: [
        { tag: '01', title: '先认节拍', text: '命令在 CK 上升沿被采样；DDR 数据则在 CK 的上升沿与下降沿都能传输。一个 tCK 里因此有两拍数据。' },
        { tag: '02', title: '再换单位', text: 'datasheet 里的 tRCD=16 表示 16 个周期。DDR4-3200 的 tCK=0.625 ns，折算后才是 10 ns 的真实等待。' },
        { tag: '03', title: '别混淆频率', text: '3200、5600 是 MT/s（每秒百万次传输），不是 MHz。DDR4-3200 的时钟只有 1600 MHz。' }
      ],
      context: '做控制器时序预算时，先把所有周期参数统一换成 ns，再与 PHY 训练窗口、PCB 飞行时间和时钟抖动一起算。跨频率比较参数时，直接比周期数没有意义。',
      pitfall: '把 MT/s 当成时钟频率，或把 tCK 当成 DQS 周期。DQS 的一个完整周期覆盖两拍数据，两者不是同一个概念。',
      memory: '周期数是相对时间，ns 才是绝对时间。',
      flow: [
        { label: 'CK_t', sub: '时钟输入' },
        { label: '1 tCK', sub: '一个完整周期', key: true },
        { label: '2 beats', sub: '上下沿各一次' }
      ],
      related: ['tcas', 'tburst', 'tcwl'],
      traceTitle: '时钟周期与双沿传输',
      trace: {
        cycles: 8,
        commands: [],
        dataBursts: [{ from: 1, to: 5, cells: D8, kind: 'read' }],
        spans: [
          { from: 2, to: 3, label: 'tCK', kind: 'primary', caption: '一个完整时钟周期', target: 'tck', desc: '相邻上升沿之间的时间。DDR 在这个周期内完成两次数据传输。', row: 0 }
        ],
        caption: 'CK 的一个完整周期包含上下两个数据窗口；波形中的 NOP 仅用于占位。'
      }
    },
    {
      id: 'tcas',
      category: 'clock',
      symbol: 'tCL',
      nameZh: '读延迟 / CAS 延迟',
      nameEn: 'CAS Latency',
      aliases: ['CL', 'tCAS', 'Read Latency'],
      intro: 'READ 命令发出后，要等过 CL 个时钟周期，第一拍读数据才会出现在 DQ 上。内存条上写的 CL16，单位是周期，不是纳秒。',
      tags: ['READ PATH', 'CL = tCAS'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: 'READ 命令' },
        { label: '终点', value: '首拍 DQ 数据' },
        { label: '真延迟', value: 'tCL × tCK' }
      ],
      relation: '读首拍 = ACT + tRCD + tCL',
      relationNote: 'CL 只描述 READ 到首拍数据的一段。算完整读访问，还要把 row activate 的 tRCD 和控制器开销加上。',
      steps: [
        { tag: '01', title: '命令先落地', text: 'READ 命令在 CK 边沿被采样，列地址进入 DRAM。此时 DQ 总线上还没有数据，内部阵列正在把选中列送到输出端。' },
        { tag: '02', title: '等待 CL 拍', text: '从 READ 被采样到 DQ 上出现第一拍有效数据，等待的时钟周期数就是 tCL。随后以双沿突发方式送出 BL 拍数据。' },
        { tag: '03', title: '换成真实延迟', text: 'tCL=16 在 DDR4-3200（tCK=0.625 ns）下是 10 ns；tCL=30 在 DDR5-6000（tCK≈0.333 ns）下也约是 10 ns。数字变大不等于变慢。' }
      ],
      context: 'CL 是内存模组最常被比较的“延迟”，但它与频率强耦合。评估真实访问延迟时应使用 tCL × tCK；评估持续带宽则要看数据率和 Bank 并行度。',
      pitfall: '把 CL 数字直接当纳秒比较。DDR5 的 CL30 可能和 DDR4 的 CL16 具有相同的真实读延迟。',
      memory: 'CL 是“等几拍”，不是“等几纳秒”。',
      flow: [
        { label: 'ACT', sub: '行激活' },
        { label: 'tRCD', sub: '等行就绪' },
        { label: 'READ', sub: '列命令' },
        { label: 'tCL', sub: '等首拍', key: true },
        { label: 'DQ', sub: '首拍数据' }
      ],
      related: ['trcd', 'tck', 'tburst'],
      traceTitle: 'READ 命令到首拍数据',
      trace: {
        cycles: 14,
        commands: [
          { at: 1, label: 'ACT', kind: 'act', sub: 'A / BG0' },
          { at: 5, label: 'READ', kind: 'read', sub: 'CL 4' }
        ],
        auxLanes: [
          { label: 'BANK 0', segments: [{ from: 1, to: 14, label: 'ROW ACTIVE', kind: 'active' }] }
        ],
        dataBursts: [{ from: 9, to: 13, cells: D8, kind: 'read' }],
        spans: [
          { from: 5, to: 9, label: 'tCL', kind: 'primary', caption: 'READ → 首拍 DQ', target: 'tcas', desc: 'READ 被采样到第一拍读数据出现之间的周期数。', row: 0 },
          { from: 1, to: 5, label: 'tRCD', kind: 'muted', caption: '行激活 → 列命令', target: 'trcd', desc: '这个示例里行已经打开；tRCD 是另一段必须满足的等待。', row: 1 }
        ],
        caption: '示例 CL=4。真实系统中 CL 由模式寄存器配置，并随速度等级变化。'
      }
    },
    {
      id: 'tcwl',
      category: 'clock',
      symbol: 'tCWL',
      nameZh: '写延迟 / CAS 写延迟',
      nameEn: 'CAS Write Latency',
      aliases: ['CWL', 'Write Latency'],
      intro: 'WRITE 命令发出后，要等待 CWL 个周期，控制器才会把第一拍写数据放到 DQ 上。它和读路径的 CL 是两套独立标定。',
      tags: ['WRITE PATH', 'TRAINED'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: 'WRITE 命令' },
        { label: '终点', value: '首拍写数据' },
        { label: '训练项', value: 'Write Leveling' }
      ],
      relation: '写末尾 = WRITE + tCWL + tBurst',
      relationNote: '写数据到达后，再等 tWR 才能预充电。算命令到 PRE 的距离时，CWL 与 tWR 都不会消失。',
      steps: [
        { tag: '01', title: '写命令先到', text: 'WRITE 在 CK 边沿被采样。控制器必须根据 tCWL 推后发送写数据，让数据与 DRAM 内部时序对齐。' },
        { tag: '02', title: '数据按拍到达', text: '首拍写数据出现后，连续 BL 拍数据以双沿形式传入。此刻 DQS 由控制器发出，DQ 与 DQS 的相位需经过训练。' },
        { tag: '03', title: '算预充电边界', text: 'PRE 不能紧贴 WRITE。至少要等 CWL 让数据开始、tBurst 让数据结束，再等 tWR 让写入真正完成。' }
      ],
      context: 'CWL 经常与 CL 不相等，也不能拿 CL 推写数据位置。控制器在 write leveling 与 write DQ training 结束后，才得到可靠的写时序。',
      pitfall: '用 CL 去定位写数据。读看 CL、写看 CWL；混用会在总线上错拍，轻则写掩码错误，重则整行数据异常。',
      memory: '读看 CL，写看 CWL。',
      flow: [
        { label: 'WRITE', sub: '列写命令' },
        { label: 'tCWL', sub: '等首拍', key: true },
        { label: 'DQ', sub: '首拍写数据' },
        { label: 'tWR', sub: '写恢复' }
      ],
      related: ['twr', 'tburst', 'twtr'],
      traceTitle: 'WRITE 命令到首拍写数据',
      trace: {
        cycles: 12,
        commands: [{ at: 1, label: 'WRITE', kind: 'write', sub: 'CWL 3' }],
        auxLanes: [
          { label: 'BANK 0', segments: [{ from: 0, to: 12, label: 'ROW OPEN', kind: 'active' }] }
        ],
        dataBursts: [{ from: 4, to: 8, cells: D8, kind: 'write' }],
        spans: [
          { from: 1, to: 4, label: 'tCWL', kind: 'primary', caption: 'WRITE → 首拍 DQ', target: 'tcwl', desc: '从 WRITE 命令采样到第一拍写数据出现之间的周期数。', row: 0 },
          { from: 4, to: 8, label: 'tBurst', kind: 'muted', caption: '整段写突发', target: 'tburst', desc: 'BL8 在 DDR 总线上占 4 个 tCK。', row: 1 }
        ],
        caption: '示例 CWL=3、BL8。实际 CWL 由模式寄存器和训练结果共同确定。'
      }
    },
    {
      id: 'tburst',
      category: 'clock',
      symbol: 'tBurst',
      nameZh: '突发传输时长',
      nameEn: 'Burst Duration',
      aliases: ['BL / 2 tCK', 'Burst Length Time'],
      intro: 'BL 是一次列命令连续搬运的数据拍数；tBurst 是这串数据在总线上占用的时间。BL8 是 8 拍，但在 DDR 总线上只占 4 个周期。',
      tags: ['DATA BUS', 'BL = BEATS'],
      facts: [
        { label: '单位', value: '数据拍（beat）' },
        { label: '典型', value: 'BL8 = 4 tCK' },
        { label: 'DDR5', value: '常用 BL16 = 8 tCK' },
        { label: '公式', value: 'BL ÷ 2 × tCK' }
      ],
      relation: 'tBurst = (BL ÷ 2) × tCK',
      relationNote: '突发越长，单次命令的数据搬运越久；连续两次列命令之间还必须满足 tCCD。',
      steps: [
        { tag: '01', title: '数的是数据拍', text: 'Burst Length（BL）是数据拍数，DDR 每个时钟周期传两拍，所以 BL8 的数据窗口是 4 个 tCK，而不是 8 个。' },
        { tag: '02', title: '看总线占用', text: '这 4 个周期里 DQ 与 DQS 被这次突发占满。高带宽来自更短的 tCK 与更高的 Bank 并行度，而不是无限加长突发。' },
        { tag: '03', title: '与命令间隔配合', text: '连续 READ/WRITE 的列命令间隔由 tCCD_S / tCCD_L 限制；不能只按 tBurst 紧贴发送，否则总线会撞车。' }
      ],
      context: 'DDR4 常用 BL8，DDR5 常用 BL16。BL 改变时，tBurst、刷新开销和调度粒度都会一起变化；控制器调度器通常以 tBurst 为最小数据块。',
      pitfall: '把 BL8 理解成 8 个时钟周期。它是 8 拍数据，在 DDR 下只占 4 个 tCK。',
      memory: 'BL 数拍，tBurst 算时间。',
      flow: [
        { label: 'READ', sub: '一次列命令' },
        { label: 'BL8', sub: '8 拍数据' },
        { label: '4 tCK', sub: '总线占用', key: true },
        { label: 'NEXT', sub: '等待 tCCD' }
      ],
      related: ['tccd', 'tck', 'tcwl'],
      traceTitle: 'BL8 的数据窗口',
      trace: {
        cycles: 11,
        commands: [{ at: 1, label: 'READ', kind: 'read', sub: 'BL8' }],
        auxLanes: [
          { label: 'BANK 0', segments: [{ from: 0, to: 11, label: 'ROW ACTIVE', kind: 'active' }] }
        ],
        dataBursts: [{ from: 3, to: 7, cells: D8, kind: 'read' }],
        spans: [
          { from: 3, to: 7, label: 'tBurst', kind: 'primary', caption: '8 拍 = 4 tCK', target: 'tburst', desc: 'BL8 突发占据的 DQ 总线时间。', row: 0 },
          { from: 1, to: 3, label: 'tCL', kind: 'muted', caption: 'READ → 首拍', target: 'tcas', desc: '突发开始前还有读延迟。', row: 1 }
        ],
        caption: 'DDR 双沿传输：8 个 DQ 数据拍只占用 4 个时钟周期。'
      }
    },
    {
      id: 'trcd',
      category: 'row',
      symbol: 'tRCD',
      nameZh: '行激活到列命令延迟',
      nameEn: 'RAS-to-CAS Delay',
      aliases: ['RAS to CAS Delay', 'tRCD'],
      intro: 'ACT 把一整行 DRAM 单元激活，但感测放大器要把微弱的电荷差异放大成稳定电平，需要 tRCD。等完这段，READ 或 WRITE 才能落到同一个 Bank。',
      tags: ['SAME BANK', 'ACT → COLUMN'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: 'ACT 命令' },
        { label: '终点', value: '同 Bank 的 READ / WRITE' },
        { label: '换算', value: 'ns = 周期数 × tCK' }
      ],
      relation: '读首拍时间 = ACT + tRCD + tCL',
      relationNote: 'tRCD 只把“行”准备好，不负责列地址到数据的等待。把这两个阶段相加，才是完整的读延迟。',
      steps: [
        { tag: '01', title: '打开一行', text: 'ACT 将目标行的电荷送进感测放大器。一个 Bank 同时只能有一行处于 active 状态，选错行就要先 PRE 再 ACT。' },
        { tag: '02', title: '等感测完成', text: 'tRCD 的原意是 RAS 到 CAS 的延迟。它保证阵列电平已经稳定，此时再发 READ/WRITE 才不会读到未建立的数据。' },
        { tag: '03', title: '只约束同 Bank', text: 'tRCD 是“激活到第一列命令”的间隔。不同 Bank 可以并行激活；同一 Bank 的下一次 ACT 还要等 tRC。' }
      ],
      context: 'tRCD、tRP、tRAS、tRC 共同描述一个 Bank 的开关节奏。多 Bank 并行可以隐藏其中一部分等待，但同一行的随机访问仍然会暴露 tRCD。',
      pitfall: '把 tRCD 当作“ACT 到数据”的延迟。真正的首拍数据还要再加上 tCL（读）或 tCWL（写）。',
      memory: '行开了，等 tRCD，再给列地址。',
      flow: [
        { label: 'ACT', sub: '行激活' },
        { label: 'tRCD', sub: '等感测', key: true },
        { label: 'READ', sub: '列访问' },
        { label: 'tCL', sub: '等数据' },
        { label: 'DQ', sub: '首拍' }
      ],
      related: ['tras', 'tcas', 'trc'],
      traceTitle: '行激活到列命令的窗口',
      trace: {
        cycles: 14,
        commands: [
          { at: 1, label: 'ACT', kind: 'act', sub: 'ROW n' },
          { at: 5, label: 'READ', kind: 'read', sub: 'COL n' }
        ],
        auxLanes: [
          { label: 'BANK 0', segments: [{ from: 1, to: 14, label: 'ROW ACTIVE', kind: 'active' }] }
        ],
        dataBursts: [{ from: 9, to: 13, cells: D8, kind: 'read' }],
        spans: [
          { from: 1, to: 5, label: 'tRCD', kind: 'primary', caption: 'ACT → READ', target: 'trcd', desc: '同一 Bank 内，ACT 之后必须等到 tRCD 才能发列命令。', row: 0 },
          { from: 5, to: 9, label: 'tCL', kind: 'muted', caption: 'READ → 首拍 DQ', target: 'tcas', desc: '列命令之后还有读延迟；它不是 tRCD 的一部分。', row: 1 }
        ],
        caption: '示例 tRCD=4、CL=4。命令在边沿采样，数据按双沿突发输出。'
      }
    },
    {
      id: 'trp',
      category: 'row',
      symbol: 'tRP',
      nameZh: '行预充电时间',
      nameEn: 'Row Precharge Time',
      aliases: ['Precharge Time', 'RAS Precharge'],
      intro: 'PRE 关闭当前行后，Bank 需要 tRP 把位线恢复到预充电电平。只有这段时间过去，同一 Bank 才能接受下一次 ACT。',
      tags: ['SAME BANK', 'PRE → ACT'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: 'PRE 命令' },
        { label: '终点', value: '同 Bank 的下一个 ACT' },
        { label: '关联', value: 'tRC = tRAS + tRP' }
      ],
      relation: 'tRC = tRAS + tRP',
      relationNote: 'tRP 是一次“关行”的成本，tRAS 是“行至少开多久”的成本，两者相加构成同一 Bank 的完整行周期。',
      steps: [
        { tag: '01', title: '关掉当前行', text: 'PRE 把当前 active 行写回阵列，并让位线回到预充电电平。此时这个 Bank 不再提供数据访问。' },
        { tag: '02', title: '等待 tRP', text: '从 PRE 被采样到允许下一次 ACT，需要完整的 tRP。提前 ACT 会被 DRAM 忽略或违反时序。' },
        { tag: '03', title: '和 tRAS 一起看', text: 'PRE 本身能否发出，还要先满足 tRAS。下一次 ACT 的间隔因此是 tRAS + tRP 的组合。' }
      ],
      context: 'tRP 常与 tRCD 成对出现在内存标称中（如 16-18-18-38 里的前两个数）。它影响跨行访问的 turnaround，而同一行内的连续命中最不需要它。',
      pitfall: '以为发出 PRE 后 Bank 立刻可用。tRP 没走完就 ACT，会把行切换的代价算少。',
      memory: '关行也要时间。',
      flow: [
        { label: 'PRE', sub: '关闭行' },
        { label: 'tRP', sub: '恢复位线', key: true },
        { label: 'ACT', sub: '下一行' }
      ],
      related: ['tras', 'trc', 'trcd'],
      traceTitle: '预充电到下一次行激活',
      trace: {
        cycles: 12,
        commands: [
          { at: 1, label: 'PRE', kind: 'pre', sub: 'BANK 0' },
          { at: 6, label: 'ACT', kind: 'act', sub: 'ROW m' }
        ],
        auxLanes: [
          {
            label: 'BANK 0',
            segments: [
              { from: 1, to: 6, label: 'PRECHARGING', kind: 'pre' },
              { from: 6, to: 12, label: 'ROW ACTIVE', kind: 'active' }
            ]
          }
        ],
        spans: [
          { from: 1, to: 6, label: 'tRP', kind: 'primary', caption: 'PRE → ACT', target: 'trp', desc: '同一 Bank 从预充电命令到下一次行激活的最小等待。', row: 0 }
        ],
        caption: '图中假设 PRE 之前的行已满足 tRAS；tRP 只衡量关行之后的恢复时间。'
      }
    },
    {
      id: 'tras',
      category: 'row',
      symbol: 'tRAS',
      nameZh: '行激活保持时间',
      nameEn: 'Row Active Time',
      aliases: ['Active to Precharge', 'Row Active Time'],
      intro: '一行被 ACT 激活后，至少要维持 tRAS 才允许 PRE。它保证了感测放大器有足够时间把整行数据恢复进存储电容。',
      tags: ['SAME BANK', 'ACT → PRE'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: 'ACT 命令' },
        { label: '终点', value: '同 Bank 的 PRE' },
        { label: '关联', value: 'tRC = tRAS + tRP' }
      ],
      relation: 'tRC = tRAS + tRP',
      relationNote: '行必须先开够 tRAS，再关闭并等 tRP；两段相加就是同 Bank 两次 ACT 的最小间隔。',
      steps: [
        { tag: '01', title: '打开并保持', text: 'ACT 之后，感测放大器持续保持这一行。读取或写入只选取其中的列，行本身不会因为一次突发结束就自动关闭。' },
        { tag: '02', title: '数据结束 ≠ 行可关', text: '即使数据突发已经结束，只要还没到 tRAS，PRE 就必须等待。这个限制保护单元电荷的恢复过程。' },
        { tag: '03', title: '与 tRP 配对', text: '行关闭之后还需要 tRP。把 tRAS 和 tRP 相加，才能得到同一 Bank 下一次 ACT 的最早时刻。' }
      ],
      context: '对同一行的连续命中，tRAS 不会成为瓶颈；但每次行切换都要把它计入。调度器通常会尽量把同一行的请求聚在一起，再集中做 precharge。',
      pitfall: '数据读完后立刻发 PRE。tRAS 是从 ACT 起算的最小保持时间，不是从最后一次数据结束起算。',
      memory: '行至少开 tRAS，才有资格关。',
      flow: [
        { label: 'ACT', sub: '打开行' },
        { label: 'tRAS', sub: '最少保持', key: true },
        { label: 'PRE', sub: '允许关闭' }
      ],
      related: ['trc', 'trp', 'trcd'],
      traceTitle: '行激活到预充电的最短保持',
      trace: {
        cycles: 11,
        commands: [
          { at: 1, label: 'ACT', kind: 'act', sub: 'ROW n' },
          { at: 8, label: 'PRE', kind: 'pre', sub: 'ROW n' }
        ],
        auxLanes: [
          {
            label: 'BANK 0',
            segments: [
              { from: 1, to: 8, label: 'ROW ACTIVE', kind: 'active' },
              { from: 8, to: 11, label: 'PRECHARGING', kind: 'pre' }
            ]
          }
        ],
        spans: [
          { from: 1, to: 8, label: 'tRAS', kind: 'primary', caption: 'ACT → PRE', target: 'tras', desc: '同一 Bank 中，行从激活到允许预充电的最小时间。', row: 0 }
        ],
        caption: '教学示意采用较短的 tRAS。真实 bin 值由 JEDEC 与器件的速度等级共同决定。'
      }
    },
    {
      id: 'trc',
      category: 'row',
      symbol: 'tRC',
      nameZh: '行周期时间',
      nameEn: 'Row Cycle Time',
      aliases: ['Active Cycle Time', 'ACT-to-ACT'],
      intro: '同一 Bank 连续两次 ACT 的最小间隔。它把“行保持 tRAS”和“关行恢复 tRP”包在一个周期里：tRC = tRAS + tRP。',
      tags: ['SAME BANK', 'ACT → ACT'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: '第一次 ACT' },
        { label: '终点', value: '同 Bank 下一次 ACT' },
        { label: '公式', value: 'tRAS + tRP' }
      ],
      relation: 'tRC = tRAS + tRP',
      relationNote: 'tRC 只约束同一个 Bank。不同 Bank 的 ACT 可以由 tRRD 与 tFAW 限制，不需要等待 tRC。',
      steps: [
        { tag: '01', title: '一个完整的开关', text: '一个行周期包含 ACT、访问、PRE 和再次 ACT 的完整闭环。tRC 从第一次 ACT 起，到同一 Bank 的下一次 ACT 为止。' },
        { tag: '02', title: '拆成两段', text: 'tRAS 保证行开够，tRP 保证关行恢复够。二者之和就是 tRC；有时你会在 datasheet 里直接看到 tRC 被给出。' },
        { tag: '03', title: '跨 Bank 不套用', text: '不同 Bank 的激活由 tRRD 控制，四个 ACT 的窗口则受 tFAW 约束。把 tRC 套到其他 Bank 会低估并行能力。' }
      ],
      context: 'tRC 决定单个 Bank 的随机行访问上限。多 Bank 架构通过并行激活把这条限制摊薄，但遇到同一 Bank 的高频行切换时，tRC 会直接成为瓶颈。',
      pitfall: '把 tRC 当成所有 Bank 的 ACT 间隔。它只约束同一个 Bank；跨 Bank 需要看 tRRD / tFAW。',
      memory: '同一个 Bank 的完整行循环：ACT → PRE → ACT。',
      flow: [
        { label: 'ACT', sub: '第一次' },
        { label: 'tRAS', sub: '行保持' },
        { label: 'tRP', sub: '关行恢复' },
        { label: 'ACT', sub: '下一次', key: true }
      ],
      related: ['trcd', 'trp', 'trrd'],
      traceTitle: '同一 Bank 的完整行周期',
      trace: {
        cycles: 14,
        commands: [
          { at: 1, label: 'ACT', kind: 'act', sub: 'ROW n' },
          { at: 8, label: 'PRE', kind: 'pre', sub: 'ROW n' },
          { at: 12, label: 'ACT', kind: 'act', sub: 'ROW n+1' }
        ],
        auxLanes: [
          {
            label: 'BANK 0',
            segments: [
              { from: 1, to: 8, label: 'ROW ACTIVE', kind: 'active' },
              { from: 8, to: 12, label: 'PRECHARGING', kind: 'pre' },
              { from: 12, to: 14, label: 'ROW ACTIVE', kind: 'active' }
            ]
          }
        ],
        spans: [
          { from: 1, to: 8, label: 'tRAS', kind: 'muted', caption: '行保持', target: 'tras', desc: 'ACT 到 PRE 的最短保持时间。', row: 0 },
          { from: 8, to: 12, label: 'tRP', kind: 'muted', caption: '关行恢复', target: 'trp', desc: 'PRE 到下一次 ACT 的恢复时间。', row: 0 },
          { from: 1, to: 12, label: 'tRC', kind: 'primary', caption: '同 Bank 的 ACT → ACT', target: 'trc', desc: '同一 Bank 两次行激活的最小间隔，等于 tRAS + tRP。', row: 1 }
        ],
        caption: '一次行周期由 tRAS 与 tRP 拼成；tRC 是从第一次 ACT 到下一次 ACT 的总跨度。'
      }
    },
    {
      id: 'trrd',
      category: 'schedule',
      symbol: 'tRRD_S / tRRD_L',
      nameZh: '行激活间隔',
      nameEn: 'Activate-to-Activate Delay',
      aliases: ['tRRD', 'Row-to-Row Delay'],
      intro: '从一次 ACT 到不同 Bank 的下一次 ACT 之间要留出的间隔。跨 Bank Group 用较短的 tRRD_S，同 Bank Group 用较长的 tRRD_L。',
      tags: ['BANK GROUP', 'ACT → ACT'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: 'ACT 命令' },
        { label: '终点', value: '不同 Bank 的 ACT' },
        { label: '关系', value: 'tRRD_L 通常 ≥ tRRD_S' }
      ],
      relation: 'tRRD_S ≤ tRRD_L',
      relationNote: 'Bank Group 架构让跨组激活更快，同组激活更慢。DDR3 没有 S/L 细分时通常只给一个 tRRD。',
      steps: [
        { tag: '01', title: '跨组走 _S', text: '连续 ACT 落到不同的 Bank Group 时，使用较短的 tRRD_S。组内外可以更早并行启动不同的行。' },
        { tag: '02', title: '同组走 _L', text: '两个 ACT 落在同一个 Bank Group 的不同 Bank 时，使用较长的 tRRD_L。它们共享组内资源，需要更多间隔。' },
        { tag: '03', title: '积满四个看 tFAW', text: 'tRRD 只管相邻两次 ACT；连续激活的总量由 tFAW 限制。四个 ACT 之后，必须等滑动窗口向前移动。' }
      ],
      context: '调度器在映射地址时，会尽量把热点分散到不同 Bank Group，以利用更短的 tRRD_S。把连续行激活都塞进同一组，吞吐会更早撞上 tRRD_L 与 tFAW。',
      pitfall: '把 tRRD 用在同一 Bank 上。同 Bank 的 ACT 间隔由 tRC 控制，不是 tRRD。',
      memory: '跨组走 S，同组走 L；四个 ACT 还要看 tFAW。',
      flow: [
        { label: 'ACT A', sub: 'BG0' },
        { label: 'tRRD_S', sub: '跨组', key: true },
        { label: 'ACT B', sub: 'BG1' },
        { label: 'tRRD_L', sub: '同组更久' }
      ],
      related: ['tfaw', 'trc', 'tras'],
      variants: [
        {
          label: '跨 Bank Group · tRRD_S',
          trace: {
            cycles: 9,
            commands: [
              { at: 1, label: 'ACT', kind: 'act', sub: 'BG0 / A' },
              { at: 4, label: 'ACT', kind: 'act', sub: 'BG1 / B' }
            ],
            auxLanes: [
              {
                label: 'BANK GROUP',
                segments: [
                  { from: 1, to: 4, label: 'BG0', kind: 'active' },
                  { from: 4, to: 9, label: 'BG1', kind: 'read' }
                ]
              }
            ],
            spans: [
              { from: 1, to: 4, label: 'tRRD_S', kind: 'primary', caption: '不同 Bank Group', target: 'trrd', desc: 'ACT A 到另一个 Bank Group 的 ACT B；使用较短的 tRRD_S。', row: 0 }
            ],
            caption: '跨 Bank Group 激活：两个 ACT 落在不同组，使用 tRRD_S。'
          }
        },
        {
          label: '同 Bank Group · tRRD_L',
          trace: {
            cycles: 11,
            commands: [
              { at: 1, label: 'ACT', kind: 'act', sub: 'BG0 / A' },
              { at: 6, label: 'ACT', kind: 'act', sub: 'BG0 / B' }
            ],
            auxLanes: [
              { label: 'BANK GROUP', segments: [{ from: 1, to: 11, label: 'BG0', kind: 'active' }] },
              {
                label: 'BANK TARGET',
                segments: [
                  { from: 1, to: 6, label: 'BANK A', kind: 'active' },
                  { from: 6, to: 11, label: 'BANK B', kind: 'read' }
                ]
              }
            ],
            spans: [
              { from: 1, to: 6, label: 'tRRD_L', kind: 'primary', caption: '同一 Bank Group', target: 'trrd', desc: 'ACT A 到同 Bank Group 内另一个 Bank 的 ACT B；使用更长的 tRRD_L。', row: 0 }
            ],
            caption: '同一 Bank Group 内激活不同 Bank：共享组资源，间隔更长。'
          }
        }
      ],
      traceTitle: '跨组与同组的 ACT 间隔'
    },
    {
      id: 'tfaw',
      category: 'schedule',
      symbol: 'tFAW',
      nameZh: '四激活窗口',
      nameEn: 'Four Activate Window',
      aliases: ['Four Activate Window', '4 ACT Window'],
      intro: '在任意长度为 tFAW 的滑动窗口里，最多只能发出 4 个 ACT。它限制的是连续开行的总量，而不是相邻两个 ACT 的距离。',
      tags: ['ROLLING WINDOW', 'ACT LIMIT'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '计数对象', value: 'ACT 命令' },
        { label: '上限', value: '窗口内最多 4 个' },
        { label: '窗口', value: '滚动窗口，不是固定桶' }
      ],
      relation: '第 5 个 ACT 必须等到第 1 个 ACT + tFAW',
      relationNote: '不是“每 4 个 ACT 后休息一次”。窗口随着每个 ACT 的加入向前滑动，持续限制激活吞吐。',
      steps: [
        { tag: '01', title: '只看 ACT', text: 'tFAW 统计的是行激活命令。读、写、预充电不会加入这个计数器；但这四个 ACT 可以落到不同 Bank 或不同 Bank Group。' },
        { tag: '02', title: '窗口会滑动', text: '当第 1 个 ACT 滑出 tFAW 窗口，新的 ACT 才能进入。用“每四个激活后清零”的方式建模会错误地低估限制。' },
        { tag: '03', title: '与 tRRD 叠加', text: 'tRRD_S/L 规定相邻 ACT 的间距，tFAW 限制任意窗口的总数。两者同时满足，才得到合法的 ACT 调度表。' }
      ],
      context: '当连续请求跨行或跨 Bank 时，tFAW 会让激活吞吐封顶。内存控制器的 bank 调度器必须把行开、列访问和刷新排进同一张时间表，而不是只优化单个请求的延迟。',
      pitfall: '把 tFAW 当作固定时间桶，每放满四个 ACT 就清零。真实约束是滑动的四激活窗口。',
      memory: '四个 ACT 是配额，窗口一直向前滑。',
      flow: [
        { label: 'ACT ×1', sub: '窗口开始' },
        { label: 'ACT ×4', sub: '配额用满' },
        { label: 'tFAW', sub: '等第 1 个滑出', key: true },
        { label: 'ACT ×5', sub: '允许下一次' }
      ],
      related: ['trrd', 'trc', 'tccd'],
      traceTitle: '滑动窗口中的四次激活',
      trace: {
        cycles: 14,
        commands: [
          { at: 1, label: 'ACT', kind: 'act', sub: 'BG0', mark: '1' },
          { at: 3, label: 'ACT', kind: 'act', sub: 'BG1', mark: '2' },
          { at: 5, label: 'ACT', kind: 'act', sub: 'BG0', mark: '3' },
          { at: 7, label: 'ACT', kind: 'act', sub: 'BG1', mark: '4' },
          { at: 11, label: 'ACT', kind: 'act', sub: 'BG0' }
        ],
        spans: [
          { from: 1, to: 11, label: 'tFAW', kind: 'primary', caption: '4 个 ACT 的滑动窗口', target: 'tfaw', desc: '窗口内最多四个激活；第 5 个 ACT 必须等第一个滑出窗口。', row: 0 }
        ],
        caption: '前四个 ACT 用满窗口；第五个 ACT 等第一个 ACT 之后 tFAW 才被允许。'
      }
    },
    {
      id: 'tccd',
      category: 'schedule',
      symbol: 'tCCD_S / tCCD_L',
      nameZh: '列命令间隔',
      nameEn: 'Column-to-Column Delay',
      aliases: ['tCCD', 'Column Command Delay'],
      intro: '两次列命令之间要空出的间隔。跨 Bank Group 使用较短的 tCCD_S；同一 Bank Group 内使用较长的 tCCD_L。',
      tags: ['COLUMN CMD', 'BANK GROUP'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '对象', value: 'READ / WRITE 列命令' },
        { label: '同组', value: 'tCCD_L' },
        { label: '跨组', value: 'tCCD_S' }
      ],
      relation: '同一 BG 用 _L；跨 BG 用 _S',
      relationNote: 'tCCD 约束的是列命令的节拍，不保证总线方向切换。读写转换时还要叠加 tWTR 或总线 turnaround。',
      steps: [
        { tag: '01', title: '列命令要排队', text: '一个 DQ 总线在同一时刻只能承载一段数据。即使 Bank 已激活，连续 READ/WRITE 也必须按 tCCD 排开发送。' },
        { tag: '02', title: '看 Bank Group', text: '跨组列命令用较短的 tCCD_S，同组列命令用较长的 tCCD_L。它让不同组的数据流更早交错，而同组访问保持更保守的间隔。' },
        { tag: '03', title: '读写还要转弯', text: '从写切到读，需要 tWTR；从读切到写也受总线 turnaround 约束。tCCD 只是列命令的最基础节拍。' }
      ],
      context: 'tCCD 与 tBurst 共同决定列命令的吞吐。通常 tCCD_S 较小，使跨组突发可以紧接；同组则因共享列通路需要更长间隔。',
      pitfall: '只看 tCCD 就认为读写可以无缝背靠背，忽略 tWTR 和 DQS/DQ 总线方向切换。',
      memory: '列命令的节拍器：同组 L、跨组 S。',
      flow: [
        { label: 'READ A', sub: 'BG0' },
        { label: 'tCCD_S', sub: '跨组较短', key: true },
        { label: 'READ B', sub: 'BG1' },
        { label: 'tCCD_L', sub: '同组更长' }
      ],
      related: ['tburst', 'twtr', 'tcas'],
      variants: [
        {
          label: '跨 Bank Group · tCCD_S',
          trace: {
            cycles: 10,
            commands: [
              { at: 1, label: 'READ', kind: 'read', sub: 'BG0' },
              { at: 5, label: 'READ', kind: 'read', sub: 'BG1' }
            ],
            auxLanes: [
              {
                label: 'BANK GROUP',
                segments: [
                  { from: 1, to: 5, label: 'BG0', kind: 'active' },
                  { from: 5, to: 10, label: 'BG1', kind: 'read' }
                ]
              }
            ],
            spans: [
              { from: 1, to: 5, label: 'tCCD_S', kind: 'primary', caption: '跨 Bank Group 的列命令', target: 'tccd', desc: '不同 Bank Group 之间，连续 READ/WRITE 命令的最小间隔。', row: 0 }
            ],
            caption: '跨组列命令使用较短的 tCCD_S，示例按 4 tCK 绘制。'
          }
        },
        {
          label: '同 Bank Group · tCCD_L',
          trace: {
            cycles: 12,
            commands: [
              { at: 1, label: 'READ', kind: 'read', sub: 'BG0' },
              { at: 7, label: 'READ', kind: 'read', sub: 'BG0' }
            ],
            auxLanes: [
              { label: 'BANK GROUP', segments: [{ from: 1, to: 12, label: 'BG0', kind: 'active' }] }
            ],
            spans: [
              { from: 1, to: 7, label: 'tCCD_L', kind: 'primary', caption: '同一 Bank Group 的列命令', target: 'tccd', desc: '同一 Bank Group 内，连续列命令使用更长的 tCCD_L。', row: 0 }
            ],
            caption: '同组列命令共享列通路，tCCD_L 更长，示例按 6 tCK 绘制。'
          }
        }
      ],
      traceTitle: '列命令之间的最小节拍'
    },
    {
      id: 'trtp',
      category: 'recovery',
      symbol: 'tRTP',
      nameZh: '读命令到预充电',
      nameEn: 'Read-to-Precharge Delay',
      aliases: ['Read to Precharge', 'RTP'],
      intro: '读完最后一段数据之前，行不能关。tRTP 规定 READ 命令之后至少等多久，才能对同一个 Bank 发 PRE。',
      tags: ['READ → PRE', 'SAME BANK'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: 'READ 命令' },
        { label: '终点', value: '同 Bank 的 PRE' },
        { label: '目的', value: '保护读数据的完整输出' }
      ],
      relation: 'PRE ≥ READ + tRTP',
      relationNote: 'tRTP 保证读通路已经结束工作；真正到下一次 ACT，还需要再等 tRP。',
      steps: [
        { tag: '01', title: '数据还在路上', text: 'READ 命令之后，DQ 上还会持续输出一阵突发。PRE 若来得太早，会把正在读出的数据打断。' },
        { tag: '02', title: '等数据结束', text: 'tRTP 从 READ 命令起算，确保内部读路径和 DQ 输出有足够时间完成。之后才允许关闭这一行。' },
        { tag: '03', title: '加 tRP 再开行', text: 'PRE 之后还要经过 tRP 才能再次 ACT。因此一次读后换行，最少也要把 tRTP + tRP 纳入计划。' }
      ],
      context: 'tRTP 把“读命令”和“关行”解耦。控制器可以在等待数据返回时提前准备下一个调度动作，但真正发 PRE 必须同时满足 tRTP 和 tRAS。',
      pitfall: '只按数据在总线上结束的时刻发 PRE，忽略 tRTP 与 tRAS 的命令级约束。',
      memory: '读完最后一口，才允许关行。',
      flow: [
        { label: 'READ', sub: '列读命令' },
        { label: 'tRTP', sub: '等读通路收尾', key: true },
        { label: 'PRE', sub: '允许关行' },
        { label: 'tRP', sub: '再等恢复' }
      ],
      related: ['trp', 'tras', 'tcas'],
      traceTitle: '读命令到关闭同一行',
      trace: {
        cycles: 13,
        commands: [
          { at: 1, label: 'READ', kind: 'read', sub: 'BL8' },
          { at: 8, label: 'PRE', kind: 'pre', sub: 'BANK 0' }
        ],
        auxLanes: [
          {
            label: 'BANK 0',
            segments: [
              { from: 0, to: 8, label: 'ROW ACTIVE', kind: 'active' },
              { from: 8, to: 13, label: 'PRECHARGING', kind: 'pre' }
            ]
          }
        ],
        dataBursts: [{ from: 3, to: 7, cells: D8, kind: 'read' }],
        spans: [
          { from: 1, to: 8, label: 'tRTP', kind: 'primary', caption: 'READ → PRE', target: 'trtp', desc: '从 READ 命令到同一 Bank 允许预充电的最小时间。', row: 0 }
        ],
        caption: '示例 tRTP=7（含读延迟与突发）。规范下限由 JEDEC 与速度等级决定。'
      }
    },
    {
      id: 'twr',
      category: 'recovery',
      symbol: 'tWR',
      nameZh: '写恢复时间',
      nameEn: 'Write Recovery Time',
      aliases: ['Write Recovery', 'WR'],
      intro: '最后一拍写数据进入 DRAM 后，还需要 tWR 让写入真正完成，之后才能发出 PRE。它从数据末尾起算，而不是从 WRITE 命令起算。',
      tags: ['WRITE → PRE', 'AFTER LAST DQ'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: '最后一拍写数据' },
        { label: '终点', value: '同 Bank 的 PRE' },
        { label: '前置', value: 'tCWL + tBurst' }
      ],
      relation: 'PRE ≥ 最后一拍写数据 + tWR',
      relationNote: '从 WRITE 命令算起的最短关行距离还要加上 tCWL 与 tBurst。',
      steps: [
        { tag: '01', title: '写数据先结束', text: 'WRITE 命令后经过 tCWL，写数据才开始；再经过 tBurst，最后一拍数据才进入 DRAM。tWR 到这一刻才开始计时。' },
        { tag: '02', title: '等写入完成', text: '最后数据到达后，内部还需要时间把电荷写进存储单元。tWR 结束前发 PRE 会破坏正在恢复的行。' },
        { tag: '03', title: '组合算关行', text: '控制器计算“命令到 PRE”的距离时，必须把 tCWL、tBurst 与 tWR 三段相加，而不是从 WRITE 直接加 tWR。' }
      ],
      context: '写路径比读路径多出明确的恢复阶段。高频写入场景里，若控制器把 tWR 记成从命令起算，就会提前关行，导致间歇性数据损坏。',
      pitfall: '从 WRITE 命令直接加 tWR 就发 PRE。起点应是最后一拍写数据。',
      memory: '写数据结束，tWR 才起算。',
      flow: [
        { label: 'WRITE', sub: '列写命令' },
        { label: 'tCWL', sub: '首拍延迟' },
        { label: 'tBurst', sub: '写突发' },
        { label: 'tWR', sub: '写恢复', key: true },
        { label: 'PRE', sub: '关闭行' }
      ],
      related: ['twtr', 'tcwl', 'trp'],
      traceTitle: '最后写数据到预充电',
      trace: {
        cycles: 15,
        commands: [
          { at: 1, label: 'WRITE', kind: 'write', sub: 'CWL 2' },
          { at: 12, label: 'PRE', kind: 'pre', sub: 'BANK 0' }
        ],
        auxLanes: [
          {
            label: 'BANK 0',
            segments: [
              { from: 1, to: 12, label: 'ROW ACTIVE', kind: 'active' },
              { from: 12, to: 15, label: 'PRECHARGING', kind: 'pre' }
            ]
          }
        ],
        dataBursts: [{ from: 3, to: 7, cells: D8, kind: 'write' }],
        spans: [
          { from: 7, to: 12, label: 'tWR', kind: 'primary', caption: '最后数据 → PRE', target: 'twr', desc: '最后一拍写数据到同一 Bank 允许预充电之间的恢复时间。', row: 0 },
          { from: 1, to: 3, label: 'tCWL', kind: 'muted', caption: 'WRITE → 首拍', target: 'tcwl', desc: '写数据开始前的等待。', row: 1 }
        ],
        caption: '示例 CWL=2、BL8、tWR=5。PRE 必须等到最后一拍写数据之后 tWR。'
      }
    },
    {
      id: 'twtr',
      category: 'recovery',
      symbol: 'tWTR_S / tWTR_L',
      nameZh: '写到读切换时间',
      nameEn: 'Write-to-Read Turnaround',
      aliases: ['tWTR', 'Write to Read Delay'],
      intro: '总线刚写完就立刻读，会让 DQ/DQS 方向切换和 DRAM 内部写入尚未收尾。tWTR_S / tWTR_L 规定了写突发结束后到 READ 命令的最短等待。',
      tags: ['WRITE → READ', 'BUS TURNAROUND'],
      facts: [
        { label: '量纲', value: 'tCK（周期数）' },
        { label: '起点', value: '最后一拍写数据' },
        { label: '终点', value: '后续 READ 命令' },
        { label: '分组', value: '同组 _L，跨组 _S' }
      ],
      relation: 'READ ≥ 最后一拍写数据 + tWTR',
      relationNote: 'tWTR 是命令级下限。实际控制器还会加上 DQS 总线换向、PHY 训练余量与 rank 切换开销。',
      steps: [
        { tag: '01', title: '写方向结束', text: '写突发期间，控制器驱动 DQ/DQS。最后拍数据结束后，总线不能立即反转为读方向，需要留出换向与内部恢复时间。' },
        { tag: '02', title: '跨组更短', text: '读写切到不同 Bank Group 使用 tWTR_S；同一 Bank Group 使用更长的 tWTR_L。组内资源耦合更紧，需要多等几拍。' },
        { tag: '03', title: '从数据尾巴起算', text: 'tWTR 的参考点是写数据结束，而不是 WRITE 命令本身。命令到 READ 的总距离包含 tCWL、tBurst 和 tWTR。' }
      ],
      context: '读多写少的负载里，写转读是常见方向切换。若只在控制器里串行等待，会损失带宽；优秀的调度器会提前填充其它 Bank 的读请求，覆盖这段 turnaround。',
      pitfall: '从 WRITE 命令起算 tWTR，或者忽略同组/跨组差异。两种错误都会让 READ 提前落到总线上。',
      memory: '写转读，等数据尾巴，也等总线换向。',
      flow: [
        { label: 'WRITE', sub: '写命令' },
        { label: 'DQ × BL', sub: '写突发结束' },
        { label: 'tWTR', sub: '总线与阵列换向', key: true },
        { label: 'READ', sub: '下一段读' }
      ],
      related: ['twr', 'tccd', 'tcwl'],
      variants: [
        {
          label: '跨 Bank Group · tWTR_S',
          trace: {
            cycles: 14,
            commands: [
              { at: 1, label: 'WRITE', kind: 'write', sub: 'BG0' },
              { at: 9, label: 'READ', kind: 'read', sub: 'BG1' }
            ],
            dataBursts: [{ from: 3, to: 7, cells: D8, kind: 'write' }],
            spans: [
              { from: 7, to: 9, label: 'tWTR_S', kind: 'primary', caption: '写数据结束 → 跨组 READ', target: 'twtr', desc: '写突发结束后到不同 Bank Group 的 READ 命令之间的切换时间。', row: 0 }
            ],
            caption: '不同 Bank Group 的写转读使用较短的 tWTR_S。'
          }
        },
        {
          label: '同 Bank Group · tWTR_L',
          trace: {
            cycles: 18,
            commands: [
              { at: 1, label: 'WRITE', kind: 'write', sub: 'BG0' },
              { at: 13, label: 'READ', kind: 'read', sub: 'BG0' }
            ],
            dataBursts: [{ from: 3, to: 7, cells: D8, kind: 'write' }],
            spans: [
              { from: 7, to: 13, label: 'tWTR_L', kind: 'primary', caption: '写数据结束 → 同组 READ', target: 'twtr', desc: '写突发结束后到同一 Bank Group 的 READ 命令之间的切换时间。', row: 0 }
            ],
            caption: '同一 Bank Group 的写转读需要更长的 tWTR_L。'
          }
        }
      ],
      traceTitle: '写突发之后多久才能读'
    },
    {
      id: 'trfc',
      category: 'refresh',
      symbol: 'tRFC',
      nameZh: '刷新周期',
      nameEn: 'Refresh Cycle Time',
      aliases: ['Refresh Cycle Time', 'RFC'],
      intro: 'REF 命令启动一次刷新。刷新窗口内，相关 Bank 不能接受 ACT/READ/WRITE；tRFC 就是从 REF 到下一次合法访问的停摆时间。',
      tags: ['REFRESH BLACKOUT', 'ALL BANK'],
      facts: [
        { label: '量纲', value: 'ns' },
        { label: '起点', value: 'REF 命令' },
        { label: '终点', value: '下一次 ACT / 列命令' },
        { label: '典型量级', value: '数百 ns' }
      ],
      relation: 'REF 到下一次 ACT ≥ tRFC',
      relationNote: 'tRFC 是一次刷新造成的停摆；它多久来一次由 tREFI 决定。两者一个管“停多久”，一个管“隔多久停”。',
      steps: [
        { tag: '01', title: '刷新启动', text: 'REF 让 DRAM 逐行重写电荷。刷新期间，被刷新的 Bank 无法正常访问，DQ 总线也不应安排长突发。' },
        { tag: '02', title: '等待 tRFC', text: '从 REF 命令被采样到下一次合法 ACT，至少间隔 tRFC。容量越大、刷新模式越保守，停摆通常越长。' },
        { tag: '03', title: '和 tREFI 配合', text: 'tREFI 规定平均刷新间隔，tRFC 则规定每次刷新的停摆长度。调度器必须在 tREFI 到期前把 REF 塞进时间表。' }
      ],
      context: 'tRFC 在 DDR4/DDR5 中通常以 ns 给出，并随容量、温度和刷新模式变化。高容量 RDIMM 的刷新开销可观，数据中心的带宽预算要把它算进去。',
      pitfall: '把 tRFC 与 tREFI 混为一谈。tREFI 是两次刷新的间隔，tRFC 是刷新过程本身的停摆。',
      memory: 'tRFC 是一次停摆，tREFI 是多久停一次。',
      flow: [
        { label: 'REF', sub: '刷新命令' },
        { label: 'tRFC', sub: 'Bank 停摆', key: true },
        { label: 'ACT', sub: '恢复访问' }
      ],
      related: ['trefi', 'tras', 'trc'],
      traceTitle: '刷新窗口与恢复',
      trace: {
        cycles: 13,
        commands: [
          { at: 1, label: 'REF', kind: 'ref', sub: 'ALL BANK' },
          { at: 10, label: 'ACT', kind: 'act', sub: 'ROW n' }
        ],
        auxLanes: [
          {
            label: 'ALL BANKS',
            segments: [
              { from: 1, to: 10, label: 'REFRESH', kind: 'refresh' },
              { from: 10, to: 13, label: 'AVAILABLE', kind: 'active' }
            ]
          }
        ],
        spans: [
          { from: 1, to: 10, label: 'tRFC', kind: 'primary', caption: 'REF → 下一次 ACT', target: 'trfc', desc: '从刷新命令到下一次合法行激活之间的停摆时间。', row: 0 }
        ],
        caption: '时间轴为示意，tRFC 的实际长度通常远大于十几个时钟周期。',
        notToScale: true
      }
    },
    {
      id: 'trefi',
      category: 'refresh',
      symbol: 'tREFI',
      nameZh: '平均刷新间隔',
      nameEn: 'Refresh Interval',
      aliases: ['Refresh Interval', 'REFI'],
      intro: '每隔多久安排一次刷新。普通温度下常以约 7.8 µs 为基准；它会随温度档位和刷新模式变化。',
      tags: ['REFRESH CADENCE', 'AVERAGE INTERVAL'],
      facts: [
        { label: '量纲', value: 'µs' },
        { label: '典型基准', value: '约 7.8 µs' },
        { label: '高温模式', value: '常缩短为一半' },
        { label: '开销', value: '≈ tRFC / tREFI' }
      ],
      relation: '刷新带宽开销 ≈ tRFC ÷ tREFI',
      relationNote: '若 tRFC 约 350 ns、tREFI 约 7.8 µs，刷新长期占用约 4–5% 的可用时间，且会以停摆形式出现。',
      steps: [
        { tag: '01', title: '维持电荷', text: 'DRAM 存储单元会漏电，必须周期性刷新。刷新太稀会丢数据，太密则挤占正常读写带宽。' },
        { tag: '02', title: '平均而非固定', text: 'tREFI 是平均间隔，控制器可以在允许范围内前后平移刷新命令，只要长期平均不超限。' },
        { tag: '03', title: '把停摆放进去', text: '每次刷新都会产生 tRFC 的停摆。高带宽、低延迟系统会把刷新分散到多个 Bank 或通道，以平滑对连续访问的影响。' }
      ],
      context: '服务器高容量 DIMM 的刷新事件更密集，tRFC 也更长，带宽开销会被放大。评估持续负载时必须把刷新作为周期性空窗加入调度模型。',
      pitfall: '把 tREFI 当成每个 Bank 的固定节拍，或把它误写成 tRFC。一个是间隔，一个是停摆。',
      memory: 'tREFI 是呼吸节奏，tRFC 是屏住呼吸的时间。',
      flow: [
        { label: 'REF', sub: '本次刷新' },
        { label: 'tRFC', sub: '停摆' },
        { label: 'tREFI', sub: '平均间隔', key: true },
        { label: 'REF', sub: '下一次' }
      ],
      related: ['trfc', 'trc', 'trtp'],
      traceTitle: '两次刷新之间的间隔',
      trace: {
        cycles: 18,
        commands: [
          { at: 1, label: 'REF', kind: 'ref', sub: 'ALL BANK' },
          { at: 13, label: 'REF', kind: 'ref', sub: 'ALL BANK' }
        ],
        spans: [
          { from: 1, to: 13, label: 'tREFI', kind: 'primary', caption: '两次 REF 的平均间隔', target: 'trefi', desc: '刷新命令之间的平均间隔；波形经过压缩，不代表真实周期数。', row: 0 }
        ],
        caption: '示意波形把微秒级间隔压缩成十几个时钟周期，不能按此图数周期。',
        notToScale: true
      }
    }
  ];

  /* Build a canonical, compact form for navigation. */
  let running = 0;
  PARAMS.forEach((param) => {
    running += 1;
    param.number = String(running).padStart(2, '0');
    const cat = CATEGORIES.find((entry) => entry.id === param.category);
    const inCategory = PARAMS.filter((entry) => entry.category === param.category);
    param.categoryCode = cat ? cat.code : '00';
    param.categoryZh = cat ? cat.zh : '';
    param.categoryEn = cat ? cat.en : '';
    param.localIndex = String(inCategory.indexOf(param) + 1).padStart(2, '0');
    if (!param.variants && param.trace) {
      param.variants = [{ label: param.traceTitle || '时序窗口', trace: param.trace }];
    }
  });

  const OVERVIEW = {
    title: '一次读取的完整时序',
    kicker: 'FROM ACTIVATE TO NEXT ROW',
    intro: '把 ACT、READ、数据突发、PRE 和下一次 ACT 放在同一条时间线上，就能看到 tRCD、tCL、tBurst、tRAS、tRP 与 tRC 如何拼接成一个行周期。',
    note: '以下周期数仅用于展示参数之间的先后关系，不对应某一个具体的 JEDEC speed bin。',
    trace: {
      cycles: 21,
      commands: [
        { at: 1, label: 'ACT', kind: 'act', sub: 'BG0 / A' },
        { at: 5, label: 'READ', kind: 'read', sub: 'COL n' },
        { at: 15, label: 'PRE', kind: 'pre', sub: 'BANK 0' },
        { at: 19, label: 'ACT', kind: 'act', sub: 'ROW n+1' }
      ],
      auxLanes: [
        {
          label: 'BANK 0',
          segments: [
            { from: 1, to: 15, label: 'ROW ACTIVE', kind: 'active' },
            { from: 15, to: 19, label: 'PRECHARGING', kind: 'pre' },
            { from: 19, to: 21, label: 'ROW ACTIVE', kind: 'active' }
          ]
        }
      ],
      dataBursts: [{ from: 9, to: 13, cells: D8, kind: 'read' }],
      spans: [
        { from: 1, to: 5, label: 'tRCD', kind: 'amber', caption: '行激活 → 列命令', target: 'trcd', desc: '从 ACT 到 READ 的等待。', row: 0 },
        { from: 5, to: 9, label: 'tCL', kind: 'cyan', caption: 'READ → 首拍数据', target: 'tcas', desc: '读命令到首拍数据。', row: 0 },
        { from: 9, to: 13, label: 'tBurst', kind: 'orange', caption: 'BL8 数据窗口', target: 'tburst', desc: '8 拍数据占用 4 个时钟周期。', row: 0 },
        { from: 1, to: 15, label: 'tRAS', kind: 'violet', caption: '行保持到 PRE', target: 'tras', desc: '行激活到允许预充电的最短时间。', row: 1 },
        { from: 15, to: 19, label: 'tRP', kind: 'muted', caption: 'PRE → 下一次 ACT', target: 'trp', desc: '关行恢复时间。', row: 1 },
        { from: 1, to: 19, label: 'tRC', kind: 'primary', caption: '同 Bank ACT → ACT', target: 'trc', desc: '整个行周期的总长度，等于 tRAS + tRP。', row: 2 }
      ],
      caption: '点击任意测量标签，可直接进入对应参数的百科页。'
    },
    phases: [
      { code: '01', title: '行激活', time: 'ACT', text: '选行、开行，感测放大器开始工作。', target: 'trcd' },
      { code: '02', title: '列访问', time: 'READ', text: '选中列，等待读延迟，准备输出数据。', target: 'tcas' },
      { code: '03', title: '数据突发', time: 'BL8', text: 'DQ 以双沿连续送出 8 拍数据。', target: 'tburst' },
      { code: '04', title: '关行与再开行', time: 'PRE', text: '满足 tRAS 后关行，再等 tRP 开下一行。', target: 'trc' }
    ]
  };

  const CALC_PRESETS = [
    { group: 'DDR4', rate: 2133, label: 'DDR4-2133' },
    { group: 'DDR4', rate: 2400, label: 'DDR4-2400' },
    { group: 'DDR4', rate: 2666, label: 'DDR4-2666' },
    { group: 'DDR4', rate: 3200, label: 'DDR4-3200' },
    { group: 'DDR4', rate: 3600, label: 'DDR4-3600' },
    { group: 'DDR5', rate: 4800, label: 'DDR5-4800' },
    { group: 'DDR5', rate: 5600, label: 'DDR5-5600' },
    { group: 'DDR5', rate: 6400, label: 'DDR5-6400' },
    { group: 'DDR5', rate: 7200, label: 'DDR5-7200' },
    { group: 'DDR5', rate: 8000, label: 'DDR5-8000' }
  ];

  window.DDR_ATLAS = {
    categories: CATEGORIES,
    params: PARAMS,
    overview: OVERVIEW,
    calcPresets: CALC_PRESETS
  };
})();
