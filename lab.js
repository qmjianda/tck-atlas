/* tCK Atlas — Profile Lab model.

   A teaching sandbox for one idea: a memory module carries a small
   self-description (SPD) holding several complete timing plans — a JEDEC
   baseline plus whatever the vendor added (XMP / EXPO). Nothing here parses
   a real SPD file and nothing here is a specific part's datasheet.

   A preset module plus a plan kind produce one normalised profile object,
   and every view downstream (readout table, exchange-rate ruler, waveform)
   reads only that object. Replacing this producer with a real decoder later
   leaves the views untouched.

   The file is deliberately DOM-free so tools can load it in Node. */
(function () {
  'use strict';

  /* Discrete speed bins: modules are sold at these data rates, never at
     arbitrary ones, so the sandbox only steps between them. */
  const BINS = {
    DDR4: [2133, 2400, 2666, 2933, 3200, 3466, 3600, 3733, 4000],
    DDR5: [4800, 5200, 5600, 6000, 6400, 6800, 7200, 7600, 8000]
  };

  /* Timing values are stored in clock cycles because that is what the mode
     registers hold; ns is always derived through tCK. tRFC is the exception:
     datasheets quote it in ns, so it stays in ns. All values are teaching
     numbers, not one specific part's programming table. */
  const MODULES = [
    {
      id: 'ddr4-16-1r',
      generation: 'DDR4',
      capacityGB: 16,
      ranks: 1,
      chips: 8,
      organisation: '1Rx8',
      speedBins: [2133, 2400, 2666, 2933, 3200, 3466, 3600, 3733, 4000],
      profiles: [
        { id: 'jdec', kind: 'jdec', dataRate: 3200, cl: 22, cwl: 18, trcd: 22, trp: 22, tras: 52, trfcNs: 350, voltageV: 1.2,
          extra: { trrdL: 6, trrdS: 4, tccdL: 6, tccdS: 4, twtrL: 9, twtrS: 3, trfc2Ns: 260, trfc4Ns: 160 } },
        { id: 'xmp', kind: 'xmp', dataRate: 3600, cl: 18, cwl: 20, trcd: 22, trp: 22, tras: 60, trfcNs: 350, voltageV: 1.35,
          extra: { trrdL: 6, trrdS: 4, tccdL: 6, tccdS: 4, twtrL: 8, twtrS: 3, trfc2Ns: 260, trfc4Ns: 160 } }
      ]
    },
    {
      id: 'ddr5-32-2r',
      generation: 'DDR5',
      capacityGB: 32,
      ranks: 2,
      chips: 16,
      organisation: '2Rx8',
      speedBins: [4800, 5200, 5600, 6000, 6400, 6800, 7200, 7600, 8000],
      profiles: [
        { id: 'jdec', kind: 'jdec', dataRate: 5600, cl: 46, cwl: 42, trcd: 45, trp: 45, tras: 90, trfcNs: 295, voltageV: 1.1,
          extra: { trrdL: 12, trrdS: 4, tccdL: 12, tccdS: 8, tccdLwr: 48, tccdLwr2: 24, twtrL: 24, twtrS: 6, trfc2Ns: 160, trfcsbNs: 130 } },
        { id: 'xmp', kind: 'xmp', dataRate: 6400, cl: 32, cwl: 28, trcd: 39, trp: 39, tras: 102, trfcNs: 295, voltageV: 1.4,
          extra: { trrdL: 10, trrdS: 4, tccdL: 12, tccdS: 8, tccdLwr: 44, tccdLwr2: 22, twtrL: 20, twtrS: 6, trfc2Ns: 160, trfcsbNs: 130 } },
        { id: 'expo', kind: 'expo', dataRate: 6000, cl: 30, cwl: 26, trcd: 36, trp: 36, tras: 96, trfcNs: 295, voltageV: 1.35,
          extra: { trrdL: 8, trrdS: 4, tccdL: 12, tccdS: 8, tccdLwr: 48, tccdLwr2: 24, twtrL: 16, twtrS: 6, trfc2Ns: 160, trfcsbNs: 130 } }
      ]
    },
    {
      id: 'ddr5-16-1r',
      generation: 'DDR5',
      capacityGB: 16,
      ranks: 1,
      chips: 8,
      organisation: '1Rx8',
      speedBins: [4800, 5200, 5600, 6000, 6400, 6800, 7200, 7600, 8000],
      profiles: [
        { id: 'jdec', kind: 'jdec', dataRate: 4800, cl: 40, cwl: 36, trcd: 40, trp: 40, tras: 77, trfcNs: 295, voltageV: 1.1,
          extra: { trrdL: 12, trrdS: 4, tccdL: 12, tccdS: 8, tccdLwr: 48, tccdLwr2: 24, twtrL: 24, twtrS: 6, trfc2Ns: 160, trfcsbNs: 130 } },
        { id: 'expo', kind: 'expo', dataRate: 6000, cl: 30, cwl: 26, trcd: 38, trp: 38, tras: 96, trfcNs: 295, voltageV: 1.35,
          extra: { trrdL: 8, trrdS: 4, tccdL: 12, tccdS: 8, tccdLwr: 48, tccdLwr2: 24, twtrL: 16, twtrS: 6, trfc2Ns: 160, trfcsbNs: 130 } }
      ]
    }
  ];

  /* Slider ranges per generation, wide enough to reach every preset above
     but narrow enough that the extremes stay physical. */
  const LIMITS = {
    DDR4: {
      cl: [12, 28],
      cwl: [10, 24],
      trcd: [12, 28],
      trp: [12, 28],
      tras: [24, 80],
      trfcNs: [200, 600]
    },
    DDR5: {
      cl: [22, 50],
      cwl: [20, 48],
      trcd: [22, 50],
      trp: [22, 50],
      tras: [40, 140],
      trfcNs: [180, 600]
    }
  };

  const BURST_CYCLES = 4;   /* BL8 on a 2n bus: eight beats, four periods */
  const GRID = 24;          /* schematic column budget for the read window */
  const TREFI_NS = { DDR4: 7800, DDR5: 3900 };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function getModule(id) {
    return MODULES.find((item) => item.id === id) || MODULES[0];
  }

  function getProfile(moduleId, profileId) {
    const module = getModule(moduleId);
    return module.profiles.find((plan) => plan.id === profileId) || module.profiles[0];
  }

  /* The normalised profile: the only shape the views are allowed to read. */
  function normalise(module, source) {
    const profile = {
      moduleId: module.id,
      generation: module.generation,
      capacityGB: module.capacityGB,
      ranks: module.ranks,
      chips: module.chips,
      organisation: module.organisation,
      kind: source.kind,
      sourceId: source.id,
      dataRate: source.dataRate,
      cl: source.cl,
      cwl: source.cwl,
      trcd: source.trcd,
      trp: source.trp,
      tras: source.tras,
      trfcNs: source.trfcNs,
      voltageV: source.voltageV,
      extra: Object.assign({}, source.extra || {})
    };
    clampProfile(profile);
    fillExtra(profile);
    return profile;
  }

  /* DDR5 encodes the same three scopes twice: once as _L/_S, and once again
     as the _M fields that sit next to them in the SPD image. Retail modules
     tend to carry _M == _L; the page mirrors that rather than inventing a
     third mechanism. */
  function fillExtra(profile) {
    const ddr5 = profile.generation === 'DDR5';
    const defaults = ddr5
      ? { trrdL: 12, trrdS: 4, tccdL: 12, tccdS: 8, tccdLwr: 48, tccdLwr2: 24, twtrL: 24, twtrS: 6, twrNs: 30, trfc2Ns: 160, trfcsbNs: 130 }
      : { trrdL: 6, trrdS: 4, tccdL: 6, tccdS: 4, twtrL: 9, twtrS: 3, twrNs: 15, trfc2Ns: 260, trfc4Ns: 160 };
    Object.keys(defaults).forEach((key) => {
      if (typeof profile.extra[key] !== 'number') profile.extra[key] = defaults[key];
    });
    if (ddr5) {
      profile.extra.tccdM = profile.extra.tccdL;
      profile.extra.tccdMwr = profile.extra.tccdLwr;
      profile.extra.tccdMtr = profile.extra.twtrL;
    }
    return profile.extra;
  }

  function clampProfile(profile) {
    const limit = LIMITS[profile.generation] || LIMITS.DDR5;
    Object.keys(limit).forEach((field) => {
      profile[field] = clamp(profile[field], limit[field][0], limit[field][1]);
    });
    return profile;
  }

  function binsFor(generation) {
    return BINS[generation] || BINS.DDR5;
  }

  function binLabel(profile) {
    return `${profile.generation}-${profile.dataRate}`;
  }

  function planLabel(kind) {
    if (kind === 'jdec') return 'JEDEC';
    return String(kind || '').toUpperCase();
  }

  /* Everything the readout column shows, derived once per change. */
  function derive(profile) {
    const tck = 2000 / profile.dataRate;
    const trefi = TREFI_NS[profile.generation] || 7800;
    const trfcCycles = profile.trfcNs / tck;
    return {
      tck,
      clockMHz: profile.dataRate / 2,
      clNs: profile.cl * tck,
      cwlNs: profile.cwl * tck,
      trcdNs: profile.trcd * tck,
      trpNs: profile.trp * tck,
      trasNs: profile.tras * tck,
      trcNs: (profile.tras + profile.trp) * tck,
      readNs: (profile.trcd + profile.cl) * tck,
      burstNs: BURST_CYCLES * tck,
      trfcCycles,
      bandwidth: (profile.dataRate * 8) / 1000,
      refreshOverhead: (profile.trfcNs / trefi) * 100,
      tenTckNs: 10 * tck,
      tenNsCycles: 10 / tck
    };
  }

  /* One access, compressed into a readable window. Cycle counts drive the
     geometry so the picture keeps its shape when the data rate changes —
     that invariance is the lesson, not an accident. */
  function buildTrace(profile) {
    const tck = 2000 / profile.dataRate;
    const ex = profile.extra;
    const k = Math.min(1, GRID / (profile.trcd + profile.cwl + profile.cl + ex.twtrL + profile.trp + 12));
    const scaled = (cycles, min, cap) => clamp(Math.round(cycles * k), min, cap);
    const toNs = (cycles) => cycles * tck;

    /* One access, both directions: write first, then read. Writing first is
       what makes tWTR (write-to-read) the gap in the middle; the row may only
       close once tRAS and the write recovery window have both elapsed. */
    const actAt = 1;
    const writeAt = actAt + scaled(profile.trcd, 3, 10);
    const writeFrom = writeAt + scaled(profile.cwl, 3, 10);
    const writeTo = writeFrom + BURST_CYCLES;
    const readAt = writeTo + scaled(ex.twtrL, 2, 6);
    const readFrom = readAt + scaled(profile.cl, 3, 10);
    const readTo = readFrom + BURST_CYCLES;

    const twrCycles = Math.round(ex.twrNs / tck);
    const twrScaled = scaled(twrCycles, 3, 10);
    const preAt = Math.max(readTo + 1, actAt + scaled(profile.tras, 4, 14), writeTo + twrScaled);
    const nextActAt = preAt + scaled(profile.trp, 3, 10);
    const cycles = nextActAt + 2;

    return {
      cycles,
      notToScale: true,
      commands: [
        { at: actAt, label: 'ACT', kind: 'act', sub: 'BG0 / A' },
        { at: writeAt, label: 'WRITE', kind: 'write', sub: 'COL k' },
        { at: readAt, label: 'READ', kind: 'read', sub: 'COL m' },
        { at: preAt, label: 'PRE', kind: 'pre', sub: 'BANK 0' },
        { at: nextActAt, label: 'ACT', kind: 'act', sub: 'ROW n+1' }
      ],
      auxLanes: [
        {
          label: 'BANK 0',
          segments: [
            { from: actAt, to: preAt, label: 'ROW ACTIVE', kind: 'active' },
            { from: preAt, to: nextActAt, label: 'PRECHARGING', kind: 'pre' },
            { from: nextActAt, to: cycles, label: 'ROW ACTIVE', kind: 'active' }
          ]
        }
      ],
      dataBursts: [
        {
          from: writeFrom,
          to: writeTo,
          cells: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
          kind: 'write'
        },
        {
          from: readFrom,
          to: readTo,
          cells: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
          kind: 'read'
        }
      ],
      spans: [
        { key: 'trcd', from: actAt, to: writeAt, label: 'tRCD', kind: 'amber', target: 'trcd', row: 0, cycles: profile.trcd, ns: toNs(profile.trcd) },
        { key: 'tcwl', from: writeAt, to: writeFrom, label: 'tCWL', kind: 'violet', target: 'tcwl', row: 0, cycles: profile.cwl, ns: toNs(profile.cwl) },
        { key: 'tburstw', from: writeFrom, to: writeTo, label: 'tBurst', kind: 'orange', target: 'tburst', row: 0, cycles: BURST_CYCLES, ns: toNs(BURST_CYCLES) },
        { key: 'twtr', from: writeTo, to: readAt, label: 'tWTR', kind: 'muted', target: 'twtr', row: 1, cycles: ex.twtrL, ns: toNs(ex.twtrL) },
        { key: 'tcl', from: readAt, to: readFrom, label: 'tCL', kind: 'cyan', target: 'tcas', row: 1, cycles: profile.cl, ns: toNs(profile.cl) },
        { key: 'tburstr', from: readFrom, to: readTo, label: 'tBurst', kind: 'orange', target: 'tburst', row: 1, cycles: BURST_CYCLES, ns: toNs(BURST_CYCLES) },
        { key: 'twr', from: writeTo, to: writeTo + twrScaled, label: 'tWR', kind: 'violet', target: 'twr', row: 2, cycles: twrCycles, ns: ex.twrNs },
        { key: 'tras', from: actAt, to: preAt, label: 'tRAS', kind: 'violet', target: 'tras', row: 3, cycles: profile.tras, ns: toNs(profile.tras) },
        { key: 'trp', from: preAt, to: nextActAt, label: 'tRP', kind: 'muted', target: 'trp', row: 3, cycles: profile.trp, ns: toNs(profile.trp) },
        { key: 'trc', from: actAt, to: nextActAt, label: 'tRC', kind: 'primary', target: 'trc', row: 4, cycles: profile.tras + profile.trp, ns: toNs(profile.tras + profile.trp) }
      ]
    };
  }

  /* ---- suffixed timings --------------------------------------------------
     Several delays only mean something once you name the bank the *second*
     command touches. DDR5 writes that scope into the symbol: _L is the same
     bank group, _S a different one, and refresh has three recovery windows.
     familyView() resolves one profile into those groups so the view can draw
     all members of a group on one shared scale.
  ------------------------------------------------------------------ */
  const SAME = { zh: '同一个 BG', en: 'same bank group' };
  const OTHER = { zh: '不同 BG', en: 'different bank group' };

  function familyView(profile) {
    const tck = 2000 / profile.dataRate;
    const ex = profile.extra;
    const ddr5 = profile.generation === 'DDR5';
    const toNs = (cycles) => cycles * tck;
    const mk = (sym, cycles, scope, more) => Object.assign({ sym, cycles, ns: toNs(cycles), scope }, more || {});
    const lane = (label, tags, span, note) => ({ label, tags, span, note });
    const tag = (at, text, kind) => ({ at, text, kind });

    const refreshRows = [
      mk('tRFC1', Math.round(profile.trfcNs / tck), { zh: '全部 bank 一起刷', en: 'all banks at once' }),
      mk('tRFC2', Math.round(ex.trfc2Ns / tck), { zh: '精细刷新（FGR）', en: 'fine grain refresh' }),
      ddr5
        ? mk('tRFCsb', Math.round(ex.trfcsbNs / tck), { zh: '只刷一个 bank', en: 'a single bank' })
        : mk('tRFC4', Math.round(ex.trfc4Ns / tck), { zh: '四分频刷新（4×）', en: 'quarter rate refresh' })
    ];
    const refreshMax = Math.max.apply(null, refreshRows.map((row) => row.ns));

    /* DDR5 only: write-to-write got its own pair of numbers in that standard. */
    const writeCase = ddr5
      ? lane({ zh: '同一个 BG · 写', en: 'Same bank group, write' }, [tag(1, 'WR', 'write'), tag(1 + ex.tccdLwr, 'WR', 'write')],
        { from: 1, to: 1 + ex.tccdLwr, sym: 'tCCD_L_WR', tone: 'orange' },
        {
          zh: '写完到下一次写，中间这一大段是留给写数据收尾的；第二段写换成 tCCD_L_WR2，本例里正好是它的一半。',
          en: 'The long gap covers write data draining off the bus; the second write uses tCCD_L_WR2, half of it here.'
        })
      : null;

    const families = [
      {
        id: 'refresh',
        kicker: 'REFRESH / SCOPE',
        tab: { zh: '刷新', en: 'Refresh' },
        title: { zh: '刷新：一次刷多少，就停多久', en: 'Refresh: how much gets refreshed, and for how long' },
        lead: {
          zh: '刷新不是只有"整颗颗粒一起刷"这一种。范围越小，恢复越快，代价是同样的时间里要发更多次命令——拿命令换停摆。',
          en: 'Refreshing is not one thing. The smaller the slice, the sooner the part is usable again — paid for with more commands in the same window.'
        },
        kind: 'bars',
        vizNote: {
          zh: '三条横轴共用一个刻度：条越短，恢复越快，代价是刷新命令要发得越勤。',
          en: 'All three bars share one scale: shorter means faster recovery, paid for with more frequent refresh commands.'
        },
        bars: refreshRows.map((row) => Object.assign({ pct: (row.ns / refreshMax) * 100 }, row)),
        rows: refreshRows,
        note: {
          zh: 'tRFC2 用于 2× 精细刷新：每个刷新命令只刷一半的行，所以恢复得快。tRFCsb 只锁一个 bank，tRFC4 用于 4× 刷新。这几项 JEDEC 按 ns 给值、不按周期，所以频率越高，同一段恢复时间占掉的周期越多。',
          en: 'tRFC2 belongs to 2× fine-grain refresh: each command covers half the rows, so recovery is shorter. tRFCsb locks a single bank, and tRFC4 belongs to 4× refresh. JEDEC quotes all of them in ns rather than cycles, so the faster the clock, the more cycles the same window consumes.'
        }
      },
      {
        id: 'activate',
        kicker: 'ACTIVATE / GROUP',
        tab: { zh: '激活', en: 'Activate' },
        title: { zh: '两次激活：同组排队，换组并行', en: 'Two activates: queue inside a group, overlap across groups' },
        lead: {
          zh: '想连着激活两行时，第二行落在同一个 Bank Group 就只能等前一次收尾；落在别的组，两条行通路互不相干，可以提前。',
          en: 'Row activation repeats at different distances depending on where the second row lives: inside the same bank group it has to queue, across groups it can go early.'
        },
        kind: 'lanes',
        cases: [
          lane(SAME, [tag(1, 'ACT', 'act'), tag(1 + ex.trrdL, 'ACT', 'act')],
            { from: 1, to: 1 + ex.trrdL, sym: 'tRRD_L', tone: 'amber' },
            { zh: '同组共用一套行通路，第二次激活要排队。', en: 'One row path per group, so the second activate waits.' }),
          lane(OTHER, [tag(1, 'ACT', 'act'), tag(1 + ex.trrdS, 'ACT', 'act')],
            { from: 1, to: 1 + ex.trrdS, sym: 'tRRD_S', tone: 'cyan' },
            { zh: '换组各有各的通路，间隔短得多。', en: 'Different groups have their own paths, hence the shorter gap.' })
        ],
        rows: [
          mk('tRRD_L', ex.trrdL, SAME),
          mk('tRRD_S', ex.trrdS, OTHER)
        ],
        note: {
          zh: 'L 是 long，S 是 short：长的那项对应同一个 bank group，短的那项对应不同的 bank group。',
          en: 'L is long, S is short: the long one covers the same bank group, the short one a different group.'
        }
      },
      {
        id: 'columns',
        kicker: 'COLUMN COMMANDS',
        tab: { zh: '列命令', en: 'Column' },
        title: { zh: '背靠背的读和写：写要在总线上多待一会儿', en: 'Back-to-back reads and writes: writes linger on the bus' },
        lead: {
          zh: '列命令之间也要看落在哪个组。读还算利落，写要大得多——数据在总线上停留的时间比读长，下一段写还得再等一次。',
          en: 'Column commands follow the same group rule. Reads stay close to the burst length; writes need much more room, and a second write needs another wait.'
        },
        kind: 'lanes',
        cases: [
          lane(SAME, [tag(1, 'RD', 'read'), tag(1 + ex.tccdL, 'RD', 'read')],
            { from: 1, to: 1 + ex.tccdL, sym: 'tCCD_L', tone: 'amber' },
            { zh: '同组读，等一个组内节拍。', en: 'Read after read inside one group.' }),
          lane(OTHER, [tag(1, 'RD', 'read'), tag(1 + ex.tccdS, 'RD', 'read')],
            { from: 1, to: 1 + ex.tccdS, sym: 'tCCD_S', tone: 'cyan' },
            { zh: '换组读，基本贴着突发长度，DDR5 就是 8 个周期。', en: 'Across groups the gap sits at the burst length — 8 cycles on DDR5.' }),
          writeCase
        ].filter(Boolean),
        rows: [
          mk('tCCD_L', ex.tccdL, SAME),
          mk('tCCD_S', ex.tccdS, OTHER),
          ddr5 ? mk('tCCD_L_WR', ex.tccdLwr, SAME) : null,
          ddr5 ? mk('tCCD_L_WR2', ex.tccdLwr2, SAME, { alias: { zh: '第二段写', en: '2nd write' } }) : null,
          ddr5 ? mk('tCCD_M', ex.tccdM, SAME, { mirror: 'tCCD_L' }) : null,
          ddr5 ? mk('tCCD_M_WR', ex.tccdMwr, SAME, { mirror: 'tCCD_L_WR' }) : null
        ].filter(Boolean),
        note: {
          zh: 'SPD 里还并排存着一组 _M 项（tCCD_M / tCCD_M_WR / tCCD_M_WTR），和 _L 挨着放。这条条子上它们填的是同一个数，所以本页按 _L 同值展示——它们是 SPD 字段，BIOS 一般不单独暴露。',
          en: 'The SPD image also carries a parallel _M set (tCCD_M / tCCD_M_WR / tCCD_M_WTR) next to the _L values. On this module they hold the same numbers, which is how they are shown here — they are SPD fields, not knobs a BIOS usually exposes.'
        }
      },
      {
        id: 'turnaround',
        kicker: 'WRITE TO READ',
        tab: { zh: '读写转向', en: 'Turnaround' },
        title: { zh: '写完马上读：总线要掉头', en: 'Write then read: the bus has to turn around' },
        lead: {
          zh: '写数据刚走完，总线要掉头才能读。同组等得久，换组能早一点开始。',
          en: 'Right after write data leaves, the bus must turn around before it can read. Same group waits longer; another group can start sooner.'
        },
        kind: 'lanes',
        cases: [
          lane(SAME, [tag(1, 'WR', 'write'), tag(1 + ex.twtrL, 'RD', 'read')],
            { from: 1, to: 1 + ex.twtrL, sym: 'tWTR_L', tone: 'violet' },
            { zh: '同组：写要彻底收尾，读才能进同一个组。', en: 'Same group: the write has to finish before the read enters it.' }),
          lane(OTHER, [tag(1, 'WR', 'write'), tag(1 + ex.twtrS, 'RD', 'read')],
            { from: 1, to: 1 + ex.twtrS, sym: 'tWTR_S', tone: 'mint' },
            { zh: '换组：读走另一条通路，掉头快得多。', en: 'Different group: the read takes another path and turns around sooner.' })
        ],
        rows: [
          mk('tWTR_L', ex.twtrL, SAME, { alias: 'tCCD_L_WTR' }),
          mk('tWTR_S', ex.twtrS, OTHER, { alias: 'tCCD_S_WTR' }),
          ddr5 ? mk('tCCD_M_WTR', ex.tccdMtr, SAME, { mirror: 'tWTR_L' }) : null
        ].filter(Boolean),
        note: {
          zh: 'DDR5 规范里这两项改名成 tCCD_L_WTR / tCCD_S_WTR，很多读取工具仍打印 tWTR_L / tWTR_S。一对名字，同一个数。',
          en: 'DDR5 renamed these to tCCD_L_WTR / tCCD_S_WTR; many readers still print tWTR_L / tWTR_S. Two names, one number.'
        }
      }
    ];

    families.forEach((family) => {
      if (family.kind === 'lanes') {
        family.cases.forEach((item) => {
          const gap = item.span.to - item.span.from;
          item.span.cycles = gap;
          item.span.ns = toNs(gap);
        });
        family.maxCycles = Math.max.apply(null, family.cases.map((item) => item.span.to)) + 3;
      }
    });
    return families;
  }

  window.DDR_LAB = {
    bins: BINS,
    modules: MODULES,
    limits: LIMITS,
    burstCycles: BURST_CYCLES,
    getModule,
    getProfile,
    binsFor,
    normalise,
    clampProfile,
    derive,
    buildTrace,
    familyView,
    binLabel,
    planLabel
  };
})();
