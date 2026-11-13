/* tCK Atlas — English translations and UI strings.
   The Chinese source text lives in data.js / app.js / index.html; this file
   maps each translatable string to its English counterpart. Keep the shape of
   param overlays aligned with data.js: facts are [label, value] pairs, steps
   are { title, text }, flow is a list of sub-labels and spans mirror the
   trace span order. */
(function () {
  'use strict';

  const UI = {
    zh: {
      'meta.title': 'tCK Atlas · DDR4 / DDR5 时序参数图谱',
      'meta.description': 'tCK Atlas：用可交互的时序波形解释 DDR4 / DDR5 关键时序参数。',
      'topbar.menu': '打开参数目录',
      'topbar.closeMenu': '关闭参数目录',
      'topbar.brandHome': 'tCK Atlas 首页',
      'topbar.views': '主视图',
      'topbar.language': '界面语言',
      'nav.atlas': '参数图谱',
      'nav.sequence': '完整时序',
      'nav.calc': '换算器',
      'theme.toLight': '切换到亮色主题',
      'theme.toDark': '切换到暗色主题',
      'theme.light': '亮色',
      'theme.dark': '暗色',
      'theme.switchedLight': '已切换到亮色主题',
      'theme.switchedDark': '已切换到暗色主题',
      'lang.toZh': '切换到中文',
      'lang.toEn': '切换到英文',
      'lang.zh': '中文',
      'lang.en': 'EN',
      'lang.switchedZh': '已切换到中文',
      'lang.switchedEn': '已切换到英文',
      'sidebar.head': '参数目录',
      'sidebar.close': '关闭参数目录',
      'sidebar.searchPlaceholder': '搜索参数 / 中文名 / 别名',
      'sidebar.searchAria': '搜索时序参数',
      'sidebar.noMatch': '没有找到对应参数。',
      'sidebar.clear': '清除搜索',
      'sidebar.note': '波形均为教学示意，时间轴不一定等比例。设计签署请以 JEDEC 标准与具体器件 datasheet 为准。',
      'noscript': '此工具需要启用 JavaScript 才能渲染交互式时序波形。',
      'atlas.openSequence': '打开完整时序',
      'atlas.openCalc': '换算周期与 ns',
      'atlas.specAria': '参数索引卡',
      'atlas.stepsTitle': '把这个参数拆成三步',
      'atlas.contextTitle': '工程语境',
      'atlas.relatedTitle': '沿着时序继续看',
      'atlas.factsTitle': '参数读数',
      'atlas.relationTitle': '关系式',
      'atlas.pitfallTitle': '最容易错的点',
      'atlas.memoryFoot': '一句话记住它',
      'atlas.railNote': '图中周期数用于解释先后关系。设计签署请以 JEDEC 与器件 datasheet 的精确数值为准。',
      'atlas.traceWindow': '时序窗口',
      'atlas.waveTitle': '时序波形',
      'wave.inspect': '把指针移到测量括号上，查看它衡量的起止点。',
      'wave.measure': '测量窗口',
      'wave.spanAria': '点击打开有关参数。',
      'wave.noteAria': '查看 {label} 的说明',
      'wave.current': '当前参数',
      'wave.legend': '测量括号可点击 / 可键盘聚焦',
      'wave.scrollHint': '→ 横向滑动查看完整波形',
      'wave.variantAria': '时序变体',
      'wave.playAria': '播放时序扫描',
      'sequence.titleA': '一次访问，',
      'sequence.titleB': '读写都在同一根轴。',
      'sequence.ctaCalc': '换算这些时间',
      'sequence.ctaStart': '从 t<sub>RCD</sub> 开始',
      'sequence.phaseTitle': '五步拆开一次读写',
      'sequence.phaseNote': '写和读首尾相接：写要等 tCWL、换头要等 tWTR、读回来要等 tCL——每一次方向都在花时间。',
      'sequence.openParam': '打开参数',
      'sequence.formulaRead': '行打开与列读取两段延迟相加，才是首拍数据到达。',
      'sequence.formulaWrite': '写命令发出后，还要等 tCWL 才轮到数据上总线。',
      'sequence.formulaBus': 'BL8 在双沿总线上只占四个完整时钟周期。',
      'sequence.formulaRow': '保持行、关闭行，再允许下一次同 Bank 激活。',
      'sequence.ctaTitle': '这些周期数，在真实频率下是几纳秒？',
      'sequence.ctaButton': '打开时序换算器',
      'sequence.docTitle': '一次读写的完整时序 | tCK Atlas',
      'calc.titleA': '周期与纳秒，',
      'calc.titleB': '一次换算。',
      'calc.intro': '给定数据率，算出真实的 tCK、读延迟与刷新开销。所有周期参数在这里统一换成 ns 后再比较。',
      'calc.inputTitle': '速度等级与周期参数',
      'calc.presetNote': '预设只改变数据率，周期参数保留当前输入',
      'calc.dataRate': '数据率',
      'calc.cl': 'CL · 读延迟',
      'calc.cwl': 'CWL · 写延迟',
      'calc.burst': '突发长度',
      'calc.refresh': '刷新参数',
      'calc.trfc': 'tRFC · 刷新停摆',
      'calc.trefi': 'tREFI · 平均间隔',
      'calc.hint': 'tRFC 通常以 ns 给出；tREFI 常以 µs 给出，普通温度下典型值约为 7.8 µs。',
      'calc.foot': '读看 CL，写看 CWL；刷新开销按 tRFC / tREFI 估算。',
      'calc.footLabel': '落点',
      'calc.reset': '重置默认值',
      'calc.readoutTitle': '时序读数',
      'calc.formulaRate': '1 tCK = 2000 / 数据率',
      'calc.metricCl': 'CL · 读延迟',
      'calc.metricCwl': 'tCWL · 写延迟',
      'calc.metricBurst': '突发窗口',
      'calc.metricRead': '首次读数据',
      'calc.metricRow': '行周期 tRC',
      'calc.metricBandwidth': '64-bit 理论带宽',
      'calc.bandwidthFormula': '数据率 × 8 / 1000',
      'calc.refreshOverhead': '刷新平均占用',
      'calc.refreshNote': '按 tRFC / tREFI 估算；实际调度还会受 Bank 分组、温度档位与刷新模式影响。',
      'calc.quickCheckNote': '频率翻倍，tCK 减半；周期参数不变时，绝对时间也减半。',
      'calc.probeTitle': '自由换算',
      'calc.probeNote': '换算跟随上方数据率变化。要比较两个 speed bin，先分别算出 tCK，再回看周期参数。',
      'calc.cycles': '周期数',
      'calc.nanoseconds': '纳秒',
      'calc.resetToast': '已恢复默认输入',
      'calc.disclaimer': '教学模型：采用 DDR 双沿传输与理想突发窗口。未计入 PHY 训练余量、PCB 飞行时间、rank/bank 冲突、刷新调度平滑与命令总线协议开销。',
      'calc.docTitle': 'ns ↔ tCK 时序换算器 | tCK Atlas',
      'nav.lab': '配置档',
      'lab.docTitle': '配置档实验室 · DDR4 / DDR5 | tCK Atlas',
      'lab.badge': '教学模型',
      'lab.titleA': '同一根内存条，',
      'lab.titleB': '写着好几套时序。',
      'lab.intro': '内存条上有一颗小芯片叫 SPD，它把“我是谁、支持哪些速度、每档时序是多少”写成一份自述文件，开机时由 BIOS 读一次。下面这根是示例条：JEDEC 档是保底方案，XMP / EXPO 是厂商另外写进去的第二、第三套值——所谓“开 XMP”，只是让机器改读另一套已经存在的值。',
      'lab.heroLabel': 'ONE CLOCK CYCLE',
      'lab.heroHint': '滑杆调的是档位里写好的值，不是超频建议。',
      'lab.specimenTitle': '示例内存条',
      'lab.factGeneration': '代际',
      'lab.factCapacity': '容量',
      'lab.factOrganisation': '组织',
      'lab.factVoltage': '档位电压',
      'lab.modified': '已修改',
      'lab.reset': '复原此档',
      'lab.planNote': '同一根条子上并列的几套值：JEDEC 一定存在，XMP / EXPO 是厂商追加的。机器不会自己超频，它只是在开机时挑了其中一套。',
      'lab.readoutTitle': '参数与汇率',
      'lab.rate': '速度档',
      'lab.rateTitle': 'EXCHANGE RATE',
      'lab.rateNote': 'tCK 是周期数与时间之间的汇率：频率越高，一个周期越短，同样的 CL 换算出来的 ns 就越小。',
      'lab.metricRead': '首次读数据',
      'lab.metricRowCycle': '行周期',
      'lab.metricBandwidth': '64-bit 带宽',
      'lab.metricRefresh': '刷新占用',
      'lab.waveTitle': '一次读写的窗口',
      'lab.waveCaption': '横轴只数时钟周期：先写后读，中间那段 tWTR 是换向的代价。把频率拉高，这张图的形状不变，变的只是每一列有多短。',
      'lab.span.trcd': 'ACT 之后行要先激活到位，同 Bank 的列命令才能落下。',
      'lab.span.tcwl': '写命令发出后，控制器要等 tCWL 才把第一拍数据推上总线。',
      'lab.span.tburstw': '写出去的 BL8 同样只占 4 个时钟，D0–D7 依次上总线。',
      'lab.span.twtr': '总线从写翻回读：同 Bank Group 要先等 tWTR，换组可以更早。',
      'lab.span.tcl': '列命令发出后，D0 最早在 tCL 之后才出现在数据总线上。',
      'lab.span.tburstr': '读回来的 BL8 还是 4 个时钟，只是这次数据从阵列往控制器走。',
      'lab.span.twr': '写完不能立刻关行，写恢复 tWR 结束之后才允许预充电。',
      'lab.span.tras': '行激活后至少保持 tRAS，才允许预充电。',
      'lab.span.trp': '预充电把位线拉回参考电平，下一次激活要等 tRP。',
      'lab.span.trc': '同一 Bank 两次激活之间的窗口，等于 tRAS + tRP。',
      'lab.suffixTitle': '同一个参数，为什么要带后缀',
      'lab.suffixIntro': 'DDR5 把“第二道命令落在哪个 bank”写进了名字：_L 是同一个 bank group，_S 是另一个 bank group；刷新则按“一次刷多少”分成 1 / 2 / sb 三档。同一个物理延迟在不同代际、不同工具里名字不一样，下面按当前档位实时换算。',
      'lab.colName': '名称',
      'lab.colCycles': '周期',
      'lab.colNs': '纳秒',
      'lab.colScope': '作用域',
      'lab.disclaimer': '本页是教学模型：档位与时序为示例值，不对应任何具体型号。真实机器上的 SPD 由 BIOS 读取，本工具不解析真实 SPD 文件，也不保证任何配置能开机。'
    },
    en: {
      'meta.title': 'tCK Atlas · DDR4 / DDR5 Timing Atlas',
      'meta.description': 'tCK Atlas: interactive timing waveforms explaining the key DDR4 / DDR5 timing parameters.',
      'topbar.menu': 'Open parameter index',
      'topbar.closeMenu': 'Close parameter index',
      'topbar.brandHome': 'tCK Atlas home',
      'topbar.views': 'Primary views',
      'topbar.language': 'Interface language',
      'nav.atlas': 'Atlas',
      'nav.sequence': 'Sequence',
      'nav.calc': 'Calculator',
      'theme.toLight': 'Switch to light theme',
      'theme.toDark': 'Switch to dark theme',
      'theme.light': 'Light',
      'theme.dark': 'Dark',
      'theme.switchedLight': 'Switched to light theme',
      'theme.switchedDark': 'Switched to dark theme',
      'lang.toZh': 'Switch to Chinese',
      'lang.toEn': 'Switch to English',
      'lang.zh': '中文',
      'lang.en': 'EN',
      'lang.switchedZh': 'Switched to Chinese',
      'lang.switchedEn': 'Switched to English',
      'sidebar.head': 'Parameter index',
      'sidebar.close': 'Close parameter index',
      'sidebar.searchPlaceholder': 'Search symbol / name / alias',
      'sidebar.searchAria': 'Search timing parameters',
      'sidebar.noMatch': 'No matching parameter.',
      'sidebar.clear': 'Clear search',
      'sidebar.note': 'All waveforms are teaching schematics, and the timeline is not necessarily to scale. For design sign-off, use JEDEC standards and the specific device datasheet.',
      'noscript': 'This tool needs JavaScript enabled to render the interactive timing waveforms.',
      'atlas.openSequence': 'Open full sequence',
      'atlas.openCalc': 'Convert cycles ↔ ns',
      'atlas.specAria': 'Parameter spec plate',
      'atlas.stepsTitle': 'Break this parameter into three steps',
      'atlas.contextTitle': 'In practice',
      'atlas.relatedTitle': 'Keep reading the sequence',
      'atlas.factsTitle': 'Parameter readout',
      'atlas.relationTitle': 'Relation',
      'atlas.pitfallTitle': 'Most common mistake',
      'atlas.memoryFoot': 'One-line memory hook',
      'atlas.railNote': 'Cycle counts in the traces only explain ordering. For design sign-off, use the exact values in JEDEC and the device datasheet.',
      'atlas.traceWindow': 'Timing window',
      'atlas.waveTitle': 'Timing waveform',
      'wave.inspect': 'Point at a measurement bracket to see what it measures.',
      'wave.measure': 'Measurement window',
      'wave.spanAria': 'Click to open the related parameter.',
      'wave.noteAria': 'View the note for {label}',
      'wave.current': 'current parameter',
      'wave.legend': 'Measurement brackets are clickable / keyboard-focusable',
      'wave.scrollHint': '→ Scroll horizontally for the full waveform',
      'wave.variantAria': 'Timing variants',
      'wave.playAria': 'Play timing scan',
      'sequence.titleA': 'One access,',
      'sequence.titleB': 'both directions on one timeline.',
      'sequence.ctaCalc': 'Convert these times',
      'sequence.ctaStart': 'Start with t<sub>RCD</sub>',
      'sequence.phaseTitle': 'Five steps of one access',
      'sequence.phaseNote': 'Write and read follow each other: the write waits tCWL, the turnaround waits tWTR, the read waits tCL — every direction change costs time.',
      'sequence.openParam': 'Open parameter',
      'sequence.formulaRead': 'Row-open and column-read delays add up to the first data beat.',
      'sequence.formulaWrite': 'After the write command, tCWL still has to pass before data reaches the bus.',
      'sequence.formulaBus': 'BL8 occupies only four full clock cycles on a dual-edge bus.',
      'sequence.formulaRow': 'Hold the row, close it, then allow the next same-bank activation.',
      'sequence.ctaTitle': 'How many nanoseconds are these cycles at a real data rate?',
      'sequence.ctaButton': 'Open the timing calculator',
      'sequence.docTitle': 'A complete read-write sequence | tCK Atlas',
      'calc.titleA': 'Cycles and nanoseconds,',
      'calc.titleB': 'converted once.',
      'calc.intro': 'Given a data rate, compute real tCK, read latency and refresh overhead. Every cycle-based parameter is converted to ns here before comparison.',
      'calc.inputTitle': 'Speed grade and cycle parameters',
      'calc.presetNote': 'Presets only change the data rate; cycle parameters keep their current values',
      'calc.dataRate': 'Data rate',
      'calc.cl': 'CL · read latency',
      'calc.cwl': 'CWL · write latency',
      'calc.burst': 'Burst length',
      'calc.refresh': 'Refresh parameters',
      'calc.trfc': 'tRFC · refresh blackout',
      'calc.trefi': 'tREFI · average interval',
      'calc.hint': 'tRFC is usually given in ns; tREFI in µs, typically about 7.8 µs at normal temperature.',
      'calc.foot': 'Reads use CL, writes use CWL; refresh overhead is estimated as tRFC / tREFI.',
      'calc.footLabel': 'Where it lands',
      'calc.reset': 'Reset defaults',
      'calc.readoutTitle': 'Timing readout',
      'calc.formulaRate': '1 tCK = 2000 / data rate',
      'calc.metricCl': 'CL · read latency',
      'calc.metricCwl': 'tCWL · write latency',
      'calc.metricBurst': 'Burst window',
      'calc.metricRead': 'First read data',
      'calc.metricRow': 'Row cycle tRC',
      'calc.metricBandwidth': '64-bit theoretical bandwidth',
      'calc.bandwidthFormula': 'data rate × 8 / 1000',
      'calc.refreshOverhead': 'Average refresh overhead',
      'calc.refreshNote': 'Estimated as tRFC / tREFI; real scheduling also depends on bank grouping, temperature range and refresh mode.',
      'calc.quickCheckNote': 'Double the rate, halve tCK; with unchanged cycle counts, absolute time also halves.',
      'calc.probeTitle': 'Free conversion',
      'calc.probeNote': 'Conversions follow the data rate above. To compare two speed bins, compute tCK for each first, then revisit the cycle counts.',
      'calc.cycles': 'cycles',
      'calc.nanoseconds': 'nanoseconds',
      'calc.resetToast': 'Default inputs restored',
      'calc.disclaimer': 'Teaching model: DDR dual-edge transfer with an ideal burst window. It excludes PHY training margin, PCB flight time, rank/bank conflicts, refresh scheduling smoothing and command-bus protocol overhead.',
      'calc.docTitle': 'ns ↔ tCK timing calculator | tCK Atlas',
      'nav.lab': 'Profiles',
      'lab.docTitle': 'Profile Lab · DDR4 / DDR5 | tCK Atlas',
      'lab.badge': 'Teaching model',
      'lab.titleA': 'One module,',
      'lab.titleB': 'several timing plans.',
      'lab.intro': 'A small chip on every module, the SPD, writes down who the module is, which speeds it supports and what the timings are for each of them. The BIOS reads it once at boot. The module below is a sample: the JEDEC plan is the guaranteed floor, while XMP / EXPO are extra plans the vendor added — enabling XMP just tells the machine to read a different plan that was already there.',
      'lab.heroLabel': 'ONE CLOCK CYCLE',
      'lab.heroHint': 'The sliders change what the vendor wrote into a plan; this is not overclocking advice.',
      'lab.specimenTitle': 'Sample module',
      'lab.factGeneration': 'Generation',
      'lab.factCapacity': 'Capacity',
      'lab.factOrganisation': 'Organisation',
      'lab.factVoltage': 'Plan voltage',
      'lab.modified': 'Modified',
      'lab.reset': 'Reset plan',
      'lab.planNote': 'Several plans sit side by side on one module: JEDEC always exists, XMP / EXPO are added by the vendor. The machine never overclocks itself — it simply picks one of them at boot.',
      'lab.readoutTitle': 'Parameters and exchange rate',
      'lab.rate': 'Speed bin',
      'lab.rateTitle': 'EXCHANGE RATE',
      'lab.rateNote': 'tCK is the exchange rate between cycles and nanoseconds: the higher the data rate, the shorter one cycle is, so the same CL converts to a smaller number of ns.',
      'lab.metricRead': 'First read data',
      'lab.metricRowCycle': 'Row cycle',
      'lab.metricBandwidth': '64-bit bandwidth',
      'lab.metricRefresh': 'Refresh overhead',
      'lab.waveTitle': 'One write, one read, end to end',
      'lab.waveCaption': 'The axis counts clock cycles only: write first, then read, with tWTR paying for the turnaround. Raise the data rate and the picture keeps its shape — each column just gets shorter.',
      'lab.span.trcd': 'After ACT the row has to finish opening before a column command can land in the same bank.',
      'lab.span.tcwl': 'After the write command the controller waits tCWL before driving the first data beat onto the bus.',
      'lab.span.tburstw': 'The outgoing BL8 also takes four clocks; D0–D7 go onto the bus one after another.',
      'lab.span.twtr': 'Turning the bus from write back to read: within a bank group tWTR must pass first; across groups it can be earlier.',
      'lab.span.tcl': 'Once the column command is issued, D0 appears on the bus no earlier than tCL later.',
      'lab.span.tburstr': 'The returning BL8 is still four clocks — this time the data travels from the array toward the controller.',
      'lab.span.twr': 'A row cannot close right after a write; write recovery has to finish before precharge.',
      'lab.span.tras': 'An open row must stay active for at least tRAS before it may be precharged.',
      'lab.span.trp': 'Precharge pulls the bit lines back to the reference level; the next ACT waits tRP.',
      'lab.span.trc': 'The window between two activations of one bank equals tRAS + tRP.',
      'lab.suffixTitle': 'Why one delay carries a suffix',
      'lab.suffixIntro': 'DDR5 writes the scope into the symbol: _L is the same bank group, _S is a different one; refresh splits into three windows by how much gets refreshed. The same physical delay is named differently across generations and tools, so every number below is recomputed for the plan you picked.',
      'lab.colName': 'Name',
      'lab.colCycles': 'Cycles',
      'lab.colNs': 'Nanoseconds',
      'lab.colScope': 'Scope',
      'lab.disclaimer': 'This page is a teaching model: the plans and timings are illustrative and match no specific part. A real machine reads its SPD at boot; this tool does not parse real SPD files and makes no promise that any configuration will post.'
    }
  };

  const EN_PARAMS = {
    tck: {
      aliases: ['Clock Period', 'Clock Cycle Time'],
      intro: 'The absolute time base of the DDR world. Every parameter counted in tCK only becomes nanoseconds after multiplying by it; the higher the data rate, the shorter this tick.',
      relation: 'tCK(ns) = 2000 ÷ data rate(MT/s)',
      relationNote: 'DDR transfers once on each CK edge, so 3200 MT/s corresponds to a 1600 MHz clock and a 0.625 ns tCK.',
      facts: [
        ['Dimension', 'ns'],
        ['Reference signal', 'CK_t / CK_c'],
        ['Data rate', '2 transfers / tCK'],
        ['Quick conversion', '2000 / MT·s⁻¹']
      ],
      steps: [
        { title: 'Start with the beat', text: 'Commands are sampled on the CK rising edge; DDR data transfers on both the rising and falling edges. One tCK therefore carries two data beats.' },
        { title: 'Convert the units', text: 'tRCD=16 in a datasheet means 16 cycles. On DDR4-3200, tCK=0.625 ns, so the real wait is 10 ns.' },
        { title: 'Do not confuse the frequency', text: '3200 and 5600 are MT/s (millions of transfers per second), not MHz. DDR4-3200 runs its clock at only 1600 MHz.' }
      ],
      context: 'When building a controller timing budget, convert every cycle-based parameter to ns first, then combine it with PHY training windows, PCB flight time and clock jitter. Comparing raw cycle counts across data rates is meaningless.',
      pitfall: 'Treating MT/s as the clock frequency, or treating tCK as the DQS period. One full DQS period covers two data beats — they are not the same thing.',
      memory: 'Cycle counts are relative time; nanoseconds are absolute.',
      flow: ['clock input', 'one full period', 'one transfer per edge'],
      traceTitle: 'Clock period and dual-edge transfers',
      spans: [
        { caption: 'One full clock period', desc: 'Time between adjacent rising edges. DDR completes two data transfers within this period.' }
      ],
      caption: 'One full CK period contains two data windows, one on each edge; NOP slots are placeholders only.'
    },
    tcas: {
      intro: 'After a READ command is issued, CL clock cycles must pass before the first read data appears on DQ. The CL16 printed on a memory module is measured in cycles, not nanoseconds.',
      relation: 'First read beat = ACT + tRCD + tCL',
      relationNote: 'CL describes only the stretch from READ to the first data beat. A full read access also includes the row activation tRCD and controller overhead.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'READ command'],
        ['End', 'first DQ data beat'],
        ['Real latency', 'tCL × tCK']
      ],
      steps: [
        { title: 'The command lands first', text: 'The READ command is sampled on a CK edge and the column address enters the DRAM. DQ still carries nothing while the array drives the selected column to the output.' },
        { title: 'Wait CL beats', text: 'The number of clock cycles between READ being sampled and the first valid data on DQ is tCL. The BL data beats then leave as a dual-edge burst.' },
        { title: 'Turn it into real latency', text: 'tCL=16 at DDR4-3200 (tCK=0.625 ns) is 10 ns; tCL=30 at DDR5-6000 (tCK≈0.333 ns) is also about 10 ns. A bigger number does not mean slower memory.' }
      ],
      context: 'CL is the latency most often compared on modules, but it is tightly coupled to frequency. Judge real access latency with tCL × tCK; judge sustained bandwidth by data rate and bank-level parallelism.',
      pitfall: 'Comparing CL numbers as if they were nanoseconds. CL30 on DDR5 can have the same real read latency as CL16 on DDR4.',
      memory: 'CL counts beats to wait, not nanoseconds.',
      flow: ['row activate', 'wait for row ready', 'column command', 'wait first beat', 'first data beat'],
      traceTitle: 'READ command to first data beat',
      spans: [
        { caption: 'READ → first DQ beat', desc: 'Number of cycles from READ being sampled to the first read data beat.' },
        { caption: 'row activate → column command', desc: 'In this example the row is already open; tRCD is a separate wait that must also be met.' }
      ],
      caption: 'Example with CL=4. In a real system CL is set by mode registers and varies with the speed grade.'
    },
    tcwl: {
      intro: 'After a WRITE command is issued, the controller waits CWL cycles before it places the first write data beat on DQ. This is a separate calibration from CL on the read path.',
      relation: 'End of write = WRITE + tCWL + tBurst',
      relationNote: 'After the write data arrives, tWR must pass before precharge. CWL and tWR both count when measuring the distance from command to PRE.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'WRITE command'],
        ['End', 'first write data beat'],
        ['Training', 'Write Leveling']
      ],
      steps: [
        { title: 'The write command goes first', text: 'WRITE is sampled on a CK edge. The controller must delay write data by tCWL so that data aligns with DRAM-internal timing.' },
        { title: 'Data arrives beat by beat', text: 'Once the first write beat appears, the remaining BL beats enter on both edges. DQS is driven by the controller, and the DQ/DQS phase must be trained.' },
        { title: 'Compute the precharge boundary', text: 'PRE cannot sit right after WRITE. It must wait for CWL to start the data, tBurst to finish it, and then tWR to complete the write.' }
      ],
      context: 'CWL often differs from CL, and CL cannot be used to place write data. Reliable write timing only exists after write leveling and write DQ training complete.',
      pitfall: 'Using CL to locate write data. Reads use CL, writes use CWL; mixing them up lands data on the wrong beat, causing mask errors or corrupted rows.',
      memory: 'Reads follow CL, writes follow CWL.',
      flow: ['column write command', 'wait first beat', 'first write data beat', 'write recovery'],
      traceTitle: 'WRITE command to first write data beat',
      spans: [
        { caption: 'WRITE → first DQ beat', desc: 'Number of cycles from the WRITE command being sampled to the first write data beat.' },
        { caption: 'full write burst', desc: 'BL8 occupies 4 tCK on the DDR bus.' }
      ],
      caption: 'Example with CWL=3, BL8. Real CWL is set by mode registers and training results.'
    },
    tburst: {
      intro: 'BL is the number of data beats moved by a single column command; tBurst is how long that data occupies the bus. BL8 means 8 beats, but only 4 cycles on a DDR bus.',
      relation: 'tBurst = (BL ÷ 2) × tCK',
      relationNote: 'Longer bursts move more data per command; consecutive column commands must still satisfy tCCD.',
      facts: [
        ['Unit', 'data beat'],
        ['Typical', 'BL8 = 4 tCK'],
        ['DDR5', 'commonly BL16 = 8 tCK'],
        ['Formula', 'BL ÷ 2 × tCK']
      ],
      steps: [
        { title: 'Count data beats', text: 'Burst Length (BL) counts data beats. DDR transfers two beats per clock cycle, so a BL8 data window is 4 tCK, not 8.' },
        { title: 'Look at bus occupancy', text: 'DQ and DQS are fully occupied by the burst for those 4 cycles. High bandwidth comes from shorter tCK and more bank parallelism, not from infinitely longer bursts.' },
        { title: 'Pair it with command spacing', text: 'Consecutive READ/WRITE column commands are limited by tCCD_S / tCCD_L; they cannot be packed as tightly as tBurst alone would suggest, or the bus collides.' }
      ],
      context: 'DDR4 commonly uses BL8, DDR5 commonly BL16. Changing BL also changes tBurst, refresh overhead and scheduling granularity; controller schedulers usually treat tBurst as the minimum data block.',
      pitfall: 'Reading BL8 as 8 clock cycles. It is 8 data beats, which occupy only 4 tCK on DDR.',
      memory: 'BL counts beats; tBurst measures time.',
      flow: ['one column command', '8 data beats', 'bus occupancy', 'wait for tCCD'],
      traceTitle: 'The BL8 data window',
      spans: [
        { caption: '8 beats = 4 tCK', desc: 'DQ bus time occupied by a BL8 burst.' },
        { caption: 'READ → first beat', desc: 'The read latency still precedes the burst.' }
      ],
      caption: 'DDR dual-edge transfer: 8 DQ data beats occupy only 4 clock cycles.'
    },
    trcd: {
      intro: 'ACT activates an entire DRAM row, but the sense amplifiers need tRCD to amplify the tiny charge difference into a stable level. Only then can READ or WRITE hit the same bank.',
      relation: 'First read beat = ACT + tRCD + tCL',
      relationNote: 'tRCD only prepares the row; it does not cover the wait from column address to data. Add both stages for the full read latency.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'ACT command'],
        ['End', 'READ / WRITE in the same bank'],
        ['Conversion', 'ns = cycles × tCK']
      ],
      steps: [
        { title: 'Open a row', text: 'ACT drives the target row charge into the sense amplifiers. A bank can have only one active row at a time; the wrong row must be precharged and activated again.' },
        { title: 'Wait for sensing', text: 'tRCD originally meant RAS-to-CAS delay. It guarantees the array level is stable, so a READ/WRITE issued now will not sample unestablished data.' },
        { title: 'Same bank only', text: 'tRCD is the gap from activation to the first column command. Different banks can activate in parallel; the next ACT in the same bank must still wait tRC.' }
      ],
      context: 'tRCD, tRP, tRAS and tRC together describe a bank open/close rhythm. Multiple banks can hide part of the wait, but random accesses within a row still expose tRCD.',
      pitfall: 'Treating tRCD as the delay from ACT to data. The first data beat also includes tCL (read) or tCWL (write).',
      memory: 'Open the row, wait tRCD, then send the column address.',
      flow: ['row activate', 'wait for sensing', 'column access', 'wait for data', 'first beat'],
      traceTitle: 'Window from row activation to column command',
      spans: [
        { caption: 'ACT → READ', desc: 'Within one bank, a column command must wait tRCD after ACT.' },
        { caption: 'READ → first DQ beat', desc: 'Read latency follows the column command; it is not part of tRCD.' }
      ],
      caption: 'Example with tRCD=4, CL=4. Commands are sampled on edges; data leaves as a dual-edge burst.'
    },
    trp: {
      intro: 'After PRE closes the current row, the bank needs tRP to restore the bit lines to the precharge level. Only then can the same bank accept the next ACT.',
      relation: 'tRC = tRAS + tRP',
      relationNote: 'tRP is the cost of closing a row; tRAS is the cost of keeping it open long enough. Together they form the full row cycle of one bank.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'PRE command'],
        ['End', 'next ACT in the same bank'],
        ['Relation', 'tRC = tRAS + tRP']
      ],
      steps: [
        { title: 'Close the current row', text: 'PRE writes the active row back into the array and returns the bit lines to the precharge level. The bank can no longer serve data accesses.' },
        { title: 'Wait tRP', text: 'A full tRP must pass from PRE being sampled until the next ACT is allowed. Early ACT is ignored by the DRAM or violates timing.' },
        { title: 'Read it with tRAS', text: 'PRE itself cannot be issued until tRAS is satisfied. The next ACT is therefore spaced by tRAS + tRP.' }
      ],
      context: 'tRP often appears next to tRCD in module ratings (the first two numbers of 16-18-18-38). It affects cross-row turnaround, while row hits barely need it.',
      pitfall: 'Assuming the bank is immediately usable after PRE. Issuing ACT before tRP finishes undercounts the row-switch cost.',
      memory: 'Closing a row also takes time.',
      flow: ['close row', 'restore bit lines', 'next row'],
      traceTitle: 'Precharge to the next row activation',
      spans: [
        { caption: 'PRE → ACT', desc: 'Minimum wait from precharge to the next row activation in the same bank.' }
      ],
      caption: 'The row is assumed to have met tRAS before PRE; tRP only measures recovery after closing.'
    },
    tras: {
      intro: 'After ACT activates a row, it must stay active for at least tRAS before PRE is allowed. This gives the sense amplifiers time to restore the entire row back into the storage capacitors.',
      relation: 'tRC = tRAS + tRP',
      relationNote: 'A row must stay open for tRAS, then close and wait tRP; the sum is the minimum spacing between two ACTs in the same bank.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'ACT command'],
        ['End', 'PRE in the same bank'],
        ['Relation', 'tRC = tRAS + tRP']
      ],
      steps: [
        { title: 'Open and hold', text: 'After ACT the sense amplifiers keep the row alive. Reads and writes select columns within it; the row does not close automatically when a burst ends.' },
        { title: 'Data done ≠ row closable', text: 'Even after the burst ends, PRE must wait until tRAS. This limit protects the cell charge restoration.' },
        { title: 'Pair with tRP', text: 'After the row closes, tRP still applies. tRAS + tRP gives the earliest next ACT in the same bank.' }
      ],
      context: 'For repeated hits in the same row, tRAS is not a bottleneck; every row switch must account for it. Schedulers usually group same-row requests and precharge once.',
      pitfall: 'Issuing PRE right after the data finishes. tRAS is measured from ACT, not from the end of the last data beat.',
      memory: 'Keep a row open for tRAS before it may close.',
      flow: ['open row', 'minimum hold', 'closing allowed'],
      traceTitle: 'Minimum hold from activation to precharge',
      spans: [
        { caption: 'ACT → PRE', desc: 'Minimum time from row activation to when precharge is allowed in the same bank.' }
      ],
      caption: 'The teaching trace uses a short tRAS. Real bin values are set by JEDEC and the device speed grade.'
    },
    trc: {
      intro: 'The minimum interval between two consecutive ACTs in the same bank. It wraps "hold the row for tRAS" and "close and recover for tRP" into one cycle: tRC = tRAS + tRP.',
      relation: 'tRC = tRAS + tRP',
      relationNote: 'tRC constrains only one bank. ACTs in different banks are limited by tRRD and tFAW, not by tRC.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'first ACT'],
        ['End', 'next ACT in the same bank'],
        ['Formula', 'tRAS + tRP']
      ],
      steps: [
        { title: 'One full open/close loop', text: 'A row cycle covers ACT, access, PRE and the next ACT. tRC runs from the first ACT to the next ACT in the same bank.' },
        { title: 'Split into two parts', text: 'tRAS guarantees the row stays open long enough; tRP guarantees recovery after closing. Their sum is tRC, which datasheets sometimes state directly.' },
        { title: 'Do not apply across banks', text: 'ACTs in different banks are governed by tRRD, and four ACTs are limited by tFAW. Applying tRC to other banks underestimates parallelism.' }
      ],
      context: 'tRC sets the random-row-access ceiling of a single bank. Multi-bank designs spread this limit across banks, but frequent row switching in one bank makes tRC the direct bottleneck.',
      pitfall: 'Treating tRC as the ACT spacing for all banks. It constrains only the same bank; cross-bank spacing uses tRRD / tFAW.',
      memory: 'One bank full row loop: ACT → PRE → ACT.',
      flow: ['first', 'row hold', 'close recovery', 'next'],
      traceTitle: 'A full row cycle in one bank',
      spans: [
        { caption: 'row hold', desc: 'Minimum hold from ACT to PRE.' },
        { caption: 'close recovery', desc: 'Recovery from PRE to the next ACT.' },
        { caption: 'same-bank ACT → ACT', desc: 'Minimum interval between two row activations in the same bank; equals tRAS + tRP.' }
      ],
      caption: 'A row cycle is tRAS plus tRP; tRC is the total span from the first ACT to the next.'
    },
    trrd: {
      intro: 'The spacing required from one ACT to the next ACT in a different bank. Cross-bank-group activation uses the shorter tRRD_S; same-bank-group activation uses the longer tRRD_L.',
      relation: 'tRRD_S ≤ tRRD_L',
      relationNote: 'Bank-group architecture makes cross-group activation faster and same-group activation slower. DDR3 without the S/L split usually specifies a single tRRD.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'ACT command'],
        ['End', 'ACT in a different bank'],
        ['Relation', 'tRRD_L usually ≥ tRRD_S']
      ],
      steps: [
        { title: 'Cross-group uses _S', text: 'When consecutive ACTs land in different bank groups, the shorter tRRD_S applies. Different rows can start in parallel earlier.' },
        { title: 'Same group uses _L', text: 'When two ACTs land in different banks of the same bank group, the longer tRRD_L applies. They share group resources and need more spacing.' },
        { title: 'Four in a row hits tFAW', text: 'tRRD governs adjacent ACTs only; the total number of activations is limited by tFAW. After four ACTs, the sliding window must move on.' }
      ],
      context: 'When mapping addresses, schedulers spread hot data across bank groups to exploit the shorter tRRD_S. Packing all activations into one group hits tRRD_L and tFAW sooner.',
      pitfall: 'Applying tRRD to the same bank. Same-bank ACT spacing is controlled by tRC, not tRRD.',
      memory: 'Cross-group S, same-group L; four ACTs also check tFAW.',
      flow: ['BG0', 'cross-group', 'BG1', 'longer within a group'],
      traceTitle: 'ACT spacing across and within bank groups',
      variants: [
        {
          label: 'Cross bank group · tRRD_S',
          spans: [
            { caption: 'different bank groups', desc: 'ACT A to ACT B in another bank group; the shorter tRRD_S applies.' }
          ],
          caption: 'Cross-bank-group activation: the two ACTs land in different groups and use tRRD_S.'
        },
        {
          label: 'Same bank group · tRRD_L',
          spans: [
            { caption: 'same bank group', desc: 'ACT A to ACT B in another bank of the same bank group; the longer tRRD_L applies.' }
          ],
          caption: 'Activating different banks within one bank group: shared group resources require a longer gap.'
        }
      ]
    },
    tfaw: {
      intro: 'Within any sliding window of length tFAW, at most four ACTs may be issued. It limits the total number of row activations, not the distance between two adjacent ACTs.',
      relation: 'The 5th ACT must wait until the 1st ACT + tFAW',
      relationNote: 'It is not "rest after every four ACTs". The window slides forward with each ACT and continuously limits activation throughput.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Counts', 'ACT commands'],
        ['Limit', 'at most 4 in the window'],
        ['Window', 'rolling, not fixed buckets']
      ],
      steps: [
        { title: 'Count only ACTs', text: 'tFAW counts row-activate commands. Reads, writes and precharges do not enter the counter, but the four ACTs may target different banks or bank groups.' },
        { title: 'The window slides', text: 'A new ACT can enter only after the first ACT slides out of the tFAW window. Modeling it as "reset after every four activations" underestimates the limit.' },
        { title: 'Combine with tRRD', text: 'tRRD_S/L sets the spacing between adjacent ACTs; tFAW limits the total within any window. Both must hold for a legal ACT schedule.' }
      ],
      context: 'When requests cross rows or banks continuously, tFAW caps activation throughput. The bank scheduler must place row opens, column accesses and refreshes on one timeline rather than optimizing one request latency.',
      pitfall: 'Treating tFAW as a fixed bucket that clears after four ACTs. The real constraint is a sliding four-activate window.',
      memory: 'Four ACTs is a quota; the window keeps sliding.',
      flow: ['window starts', 'quota used up', 'wait for the 1st to slide out', 'next one allowed'],
      traceTitle: 'Four activations in a sliding window',
      spans: [
        { caption: 'sliding window of 4 ACTs', desc: 'At most four activations in the window; the fifth ACT must wait until the first slides out.' }
      ],
      caption: 'The first four ACTs fill the window; the fifth is allowed only tFAW after the first.'
    },
    tccd: {
      intro: 'The gap required between two column commands. Cross-bank-group uses the shorter tCCD_S; within one bank group uses the longer tCCD_L.',
      relation: 'Same BG uses _L; cross BG uses _S',
      relationNote: 'tCCD constrains the column-command cadence, not bus direction changes. Read/write turnarounds additionally require tWTR or bus turnaround time.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Object', 'READ / WRITE column commands'],
        ['Same group', 'tCCD_L'],
        ['Cross group', 'tCCD_S']
      ],
      steps: [
        { title: 'Column commands queue up', text: 'A DQ bus can carry only one data stream at a time. Even with an active bank, consecutive READ/WRITEs must be spaced by tCCD.' },
        { title: 'Check the bank group', text: 'Cross-group column commands use the shorter tCCD_S; same-group commands use the longer tCCD_L. This lets different groups interleave streams earlier while same-group accesses stay conservative.' },
        { title: 'Read/write still turn around', text: 'Switching from write to read needs tWTR; read to write is also bounded by bus turnaround. tCCD is only the base cadence.' }
      ],
      context: 'tCCD and tBurst together determine column-command throughput. tCCD_S is smaller so cross-group bursts can follow closely; same-group traffic needs a longer gap because it shares column paths.',
      pitfall: 'Assuming reads and writes can be back-to-back based on tCCD alone, ignoring tWTR and DQS/DQ bus turnaround.',
      memory: 'The column-command metronome: L within a group, S across groups.',
      flow: ['BG0', 'shorter across groups', 'BG1', 'longer within a group'],
      traceTitle: 'Minimum cadence between column commands',
      variants: [
        {
          label: 'Cross bank group · tCCD_S',
          spans: [
            { caption: 'cross-bank-group column command', desc: 'Minimum interval between consecutive READ/WRITE commands in different bank groups.' }
          ],
          caption: 'Cross-group column commands use the shorter tCCD_S, drawn here as 4 tCK.'
        },
        {
          label: 'Same bank group · tCCD_L',
          spans: [
            { caption: 'same-bank-group column command', desc: 'Within one bank group, consecutive column commands use the longer tCCD_L.' }
          ],
          caption: 'Same-group column commands share column paths; tCCD_L is longer, drawn here as 6 tCK.'
        }
      ]
    },
    trtp: {
      intro: 'The row cannot close before the last data beat is read. tRTP specifies how long after a READ command PRE may be issued to the same bank.',
      relation: 'PRE ≥ READ + tRTP',
      relationNote: 'tRTP guarantees the read path has finished; reaching the next ACT still requires tRP.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'READ command'],
        ['End', 'PRE in the same bank'],
        ['Purpose', 'protect the full read data output']
      ],
      steps: [
        { title: 'Data is still in flight', text: 'After READ, DQ keeps outputting the burst for a while. A PRE that arrives too early would cut off data still being read out.' },
        { title: 'Wait for data to finish', text: 'tRTP counts from the READ command and ensures the internal read path and DQ output have enough time. Only then may the row close.' },
        { title: 'Add tRP before reopening', text: 'After PRE, tRP must still pass before the next ACT. A row switch after a read must budget at least tRTP + tRP.' }
      ],
      context: 'tRTP decouples "read command" from "close row". The controller can prepare the next scheduling action while data returns, but the actual PRE must satisfy both tRTP and tRAS.',
      pitfall: 'Issuing PRE exactly when data leaves the bus, ignoring the command-level tRTP and tRAS constraints.',
      memory: 'Finish the last bite before closing the row.',
      flow: ['column read command', 'wait for read path to drain', 'closing allowed', 'wait for recovery'],
      traceTitle: 'Read command to closing the same row',
      spans: [
        { caption: 'READ → PRE', desc: 'Minimum time from READ to precharge being allowed in the same bank.' }
      ],
      caption: 'Example with tRTP=7 (including read latency and burst). The spec minimum depends on JEDEC and the speed grade.'
    },
    twr: {
      intro: 'After the last write data beat enters the DRAM, tWR is still needed for the write to complete before PRE may be issued. It counts from the end of data, not from the WRITE command.',
      relation: 'PRE ≥ last write data beat + tWR',
      relationNote: 'The minimum distance from WRITE to PRE also includes tCWL and tBurst.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'last write data beat'],
        ['End', 'PRE in the same bank'],
        ['Prerequisite', 'tCWL + tBurst']
      ],
      steps: [
        { title: 'Write data ends first', text: 'Write data starts tCWL after the WRITE command and the last beat enters the DRAM after tBurst. tWR starts counting at that moment.' },
        { title: 'Wait for the write to complete', text: 'After the final beat arrives, the array still needs time to drive charge into the cells. Issuing PRE before tWR ends corrupts the row being restored.' },
        { title: 'Combine for the close', text: 'When calculating command-to-PRE distance, add tCWL, tBurst and tWR; do not simply add tWR to the WRITE command.' }
      ],
      context: 'The write path has an explicit recovery phase the read path lacks. Under heavy writes, a controller that starts tWR at the command will close rows early and cause intermittent data corruption.',
      pitfall: 'Adding tWR directly to the WRITE command before issuing PRE. The start point is the last write data beat.',
      memory: 'tWR starts when write data ends.',
      flow: ['column write command', 'first beat delay', 'write burst', 'write recovery', 'close row'],
      traceTitle: 'Last write data to precharge',
      spans: [
        { caption: 'last data → PRE', desc: 'Recovery time from the last write data beat to precharge being allowed in the same bank.' },
        { caption: 'WRITE → first beat', desc: 'The wait before write data begins.' }
      ],
      caption: 'Example with CWL=2, BL8, tWR=5. PRE must wait tWR after the last write data beat.'
    },
    twtr: {
      intro: 'Reading immediately after a write forces a DQ/DQS direction change and catches DRAM-internal writes still settling. tWTR_S / tWTR_L specify the minimum wait from the end of a write burst to a READ command.',
      relation: 'READ ≥ last write data beat + tWTR',
      relationNote: 'tWTR is a command-level minimum. Real controllers also add DQS bus turnaround, PHY training margin and rank-switch overhead.',
      facts: [
        ['Dimension', 'tCK (cycles)'],
        ['Start', 'last write data beat'],
        ['End', 'following READ command'],
        ['Grouping', '_L same group, _S cross group']
      ],
      steps: [
        { title: 'The write direction ends', text: 'During the write burst the controller drives DQ/DQS. Once the last beat ends, the bus cannot immediately flip to read; turnaround and internal recovery time are required.' },
        { title: 'Shorter across groups', text: 'Switching to a different bank group uses tWTR_S; the same bank group uses the longer tWTR_L. Same-group resources are more tightly coupled and need extra beats.' },
        { title: 'Count from the data tail', text: 'tWTR is referenced to the end of write data, not the WRITE command. The total command-to-READ distance includes tCWL, tBurst and tWTR.' }
      ],
      context: 'In read-heavy workloads, write-to-read is the common direction change. Serial waiting in the controller wastes bandwidth; a good scheduler fills the gap with reads from other banks.',
      pitfall: 'Starting tWTR at the WRITE command, or ignoring the same-group/cross-group difference. Either mistake puts READ on the bus too early.',
      memory: 'Write-to-read waits for the data tail and the bus turnaround.',
      flow: ['write command', 'write burst ends', 'bus and array turnaround', 'next read'],
      traceTitle: 'How soon a read may follow a write burst',
      variants: [
        {
          label: 'Cross bank group · tWTR_S',
          spans: [
            { caption: 'write data end → cross-group READ', desc: 'Turnaround from the end of the write burst to a READ command in a different bank group.' }
          ],
          caption: 'Write-to-read across bank groups uses the shorter tWTR_S.'
        },
        {
          label: 'Same bank group · tWTR_L',
          spans: [
            { caption: 'write data end → same-group READ', desc: 'Turnaround from the end of the write burst to a READ command in the same bank group.' }
          ],
          caption: 'Same-bank-group write-to-read needs the longer tWTR_L.'
        }
      ]
    },
    trfc: {
      intro: 'A REF command starts a refresh. While the refresh window is open, affected banks cannot accept ACT/READ/WRITE; tRFC is the blackout from REF to the next legal access.',
      relation: 'REF to next ACT ≥ tRFC',
      relationNote: 'tRFC is the blackout caused by one refresh; tREFI decides how often it comes. One governs how long, the other how often.',
      facts: [
        ['Dimension', 'ns'],
        ['Start', 'REF command'],
        ['End', 'next ACT / column command'],
        ['Typical magnitude', 'hundreds of ns']
      ],
      steps: [
        { title: 'Refresh begins', text: 'REF makes the DRAM rewrite cells row by row. During refresh the affected banks are inaccessible and no long burst should be scheduled on DQ.' },
        { title: 'Wait tRFC', text: 'At least tRFC must separate REF being sampled from the next legal ACT. Larger capacities and more conservative refresh modes usually mean longer blackouts.' },
        { title: 'Work with tREFI', text: 'tREFI defines the average refresh interval; tRFC defines each blackout. The scheduler must fit REF into the timeline before tREFI expires.' }
      ],
      context: 'In DDR4/DDR5 tRFC is usually specified in ns and varies with capacity, temperature and refresh mode. Refresh overhead on high-capacity RDIMMs is significant and belongs in a datacenter bandwidth budget.',
      pitfall: 'Confusing tRFC with tREFI. tREFI is the interval between refreshes; tRFC is the blackout of the refresh itself.',
      memory: 'tRFC is one blackout; tREFI is how often it happens.',
      flow: ['refresh command', 'bank blackout', 'access resumes'],
      traceTitle: 'Refresh window and recovery',
      spans: [
        { caption: 'REF → next ACT', desc: 'Blackout from the refresh command to the next legal row activation.' }
      ],
      caption: 'The timeline is schematic; a real tRFC is usually far longer than a dozen clock cycles.'
    },
    trefi: {
      intro: 'How often a refresh is scheduled. At normal temperature the baseline is often about 7.8 µs; it varies with temperature range and refresh mode.',
      relation: 'Refresh bandwidth overhead ≈ tRFC ÷ tREFI',
      relationNote: 'With tRFC around 350 ns and tREFI around 7.8 µs, refresh consumes roughly 4–5% of available time over the long run, appearing as blackouts.',
      facts: [
        ['Dimension', 'µs'],
        ['Typical baseline', 'about 7.8 µs'],
        ['High-temp mode', 'often halved'],
        ['Overhead', '≈ tRFC / tREFI']
      ],
      steps: [
        { title: 'Keep the charge', text: 'DRAM cells leak and must be refreshed periodically. Too infrequent loses data; too frequent steals bandwidth from normal reads and writes.' },
        { title: 'Average, not fixed', text: 'tREFI is an average interval. The controller may shift refresh commands earlier or later within limits as long as the long-term average holds.' },
        { title: 'Schedule the blackout', text: 'Each refresh produces a tRFC blackout. High-bandwidth, low-latency systems spread refreshes across banks or channels to smooth the impact on sustained access.' }
      ],
      context: 'High-capacity server DIMMs refresh more frequently and have longer tRFC, amplifying bandwidth overhead. Sustained-load analysis must include refresh as a periodic gap in the schedule.',
      pitfall: 'Treating tREFI as a fixed per-bank cadence, or writing it as tRFC. One is the interval, the other the blackout.',
      memory: 'tREFI is the breathing rhythm; tRFC is holding your breath.',
      flow: ['this refresh', 'blackout', 'average interval', 'next'],
      traceTitle: 'Interval between two refreshes',
      spans: [
        { caption: 'average interval between two REFs', desc: 'Average spacing between refresh commands; the waveform is compressed and does not show real cycle counts.' }
      ],
      caption: 'The schematic compresses a microsecond-scale interval into a dozen clock cycles; do not count cycles from this drawing.'
    }
  };

  const EN_OVERVIEW = {
    title: 'A complete read-write sequence',
    intro: 'Put ACT, WRITE, the write burst, the turnaround, READ, the read burst, PRE and the next ACT on one timeline: tRCD decides when the first column command may follow, tCWL when write data reaches the bus, tWTR is the price of turning the bus around, tCL when read data comes back, and tWR together with tRAS decides when the row may close.',
    note: 'The cycle counts below only illustrate the ordering of parameters; they do not correspond to a specific JEDEC speed bin. The waveform scrolls sideways.',
    phases: [
      { title: 'Row activation', text: 'Select and open a row; the sense amplifiers start working.' },
      { title: 'Write command', text: 'Wait out tCWL, then drive the write data onto the bus.' },
      { title: 'Turnaround', text: 'The bus stops writing and hands over to reads; same-bank-group tWTR covers the gap.' },
      { title: 'Read command', text: 'Issue the read, wait out tCL, and D0 comes back from the array.' },
      { title: 'Close and reopen', text: 'Precharge after tRAS and tWR, then wait tRP before the next ACT.' }
    ],
    spans: [
      { caption: 'row activate → column command', desc: 'Wait from ACT to WRITE.' },
      { caption: 'WRITE → first data beat', desc: 'Write command to the first write data beat.' },
      { caption: 'BL8 write window', desc: '8 write beats occupy 4 clock cycles.' },
      { caption: 'write → read turnaround', desc: 'The bus may not switch from write to read before tWTR.' },
      { caption: 'READ → first data beat', desc: 'Read command to first data beat.' },
      { caption: 'BL8 read window', desc: '8 read beats occupy 4 clock cycles.' },
      { caption: 'write recovery before PRE', desc: 'A row cannot close until write recovery has finished.' },
      { caption: 'row hold until PRE', desc: 'Minimum time from activation to allowed precharge.' },
      { caption: 'PRE → next ACT', desc: 'Row-close recovery time.' },
      { caption: 'same-bank ACT → ACT', desc: 'Total row cycle length, equal to tRAS + tRP.' }
    ],
    caption: 'Click any measurement label to open its encyclopedia entry.'
  };

  window.DDR_ATLAS_I18N = {
    ui: UI,
    params: EN_PARAMS,
    overview: EN_OVERVIEW
  };
})();
