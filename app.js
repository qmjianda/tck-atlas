/* tCK Atlas — application shell, waveform renderer and calculator. */
(function () {
  'use strict';

  const DATA = window.DDR_ATLAS;
  if (!DATA) {
    document.body.innerHTML = '<p style="padding:40px;color:#fff;font:16px sans-serif">数据文件 data.js 未能加载。</p>';
    return;
  }

  const params = DATA.params;
  const categories = DATA.categories;
  const overview = DATA.overview;
  const DEFAULT_ID = 'trcd';
  const LANG_KEY = 'tck-atlas-lang';
  const I18N = window.DDR_ATLAS_I18N || { ui: { zh: {}, en: {} }, params: {}, overview: {} };

  function storedLanguage() {
    if (window.__TCK_LANG === 'zh' || window.__TCK_LANG === 'en') return window.__TCK_LANG;
    try {
      const saved = window.localStorage.getItem(LANG_KEY);
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (error) {}
    return /^en/i.test(navigator.language || '') ? 'en' : 'zh';
  }

  let lang = storedLanguage();
  const isEn = () => lang === 'en';
  const pick = (zh, en) => (isEn() ? en : zh);
  const uiText = (key) => {
    const dict = I18N.ui[lang] || I18N.ui.zh || {};
    const value = dict[key];
    return value == null ? key : value;
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const atlasView = $('#atlasView');
  const sequenceView = $('#sequenceView');
  const calculatorView = $('#calculatorView');
  const paramNav = $('#paramNav');
  const paramSearch = $('#paramSearch');
  const resultCount = $('#resultCount');
  const searchEmpty = $('#searchEmpty');
  const searchClear = $('#clearSearch');
  const sidebar = $('#sidebar');
  const sidebarScrim = $('#sidebarScrim');
  const menuButton = $('#menuButton');
  const sidebarClose = $('#sidebarClose');
  const themeToggle = $('#themeToggle');
  const toast = $('#toast');
  const THEME_KEY = 'tck-atlas-theme';
  const LEGACY_THEME_KEY = 'ddr-atlas-theme';

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
  const symbol = (value) => esc(String(value || '')).replace(/\bt([A-Z]+(?:_[A-Z]+)?)\b/g, 't<sub>$1</sub>');
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  const ui = {
    activeView: 'atlas',
    activeParam: DEFAULT_ID,
    query: '',
    variant: 0,
    drawerOpen: false
  };

  const calc = {
    rate: 3200,
    cl: 16,
    cwl: 16,
    bl: 8,
    trcd: 16,
    trp: 16,
    tras: 32,
    trfc: 350,
    trefi: 7.8,
    probeCycles: 16,
    probeNs: 10
  };

  const byId = new Map(params.map((param) => [param.id, param]));
  const paramIndex = (id) => params.findIndex((param) => param.id === id);

  /* English overlays keep data.js canonical; each overlay is merged per render. */
  function localizeTrace(trace, overlay) {
    if (!trace || !overlay) return trace;
    const spans = trace.spans || [];
    return Object.assign({}, trace, {
      caption: overlay.caption != null ? overlay.caption : trace.caption,
      spans: spans.map((span, index) => {
        const translated = overlay.spans && overlay.spans[index];
        return translated ? Object.assign({}, span, { caption: translated.caption, desc: translated.desc }) : span;
      })
    });
  }

  function localizeParam(param) {
    if (!isEn()) return param;
    const overlay = I18N.params[param.id];
    if (!overlay) return param;

    const copy = Object.assign({}, param, {
      aliases: overlay.aliases || param.aliases,
      intro: overlay.intro != null ? overlay.intro : param.intro,
      relation: overlay.relation != null ? overlay.relation : param.relation,
      relationNote: overlay.relationNote != null ? overlay.relationNote : param.relationNote,
      facts: param.facts.map((fact, index) => (overlay.facts && overlay.facts[index]
        ? { label: overlay.facts[index][0], value: overlay.facts[index][1] }
        : fact)),
      steps: param.steps.map((step, index) => (overlay.steps && overlay.steps[index]
        ? { tag: step.tag, title: overlay.steps[index].title, text: overlay.steps[index].text }
        : step)),
      context: overlay.context != null ? overlay.context : param.context,
      pitfall: overlay.pitfall != null ? overlay.pitfall : param.pitfall,
      memory: overlay.memory != null ? overlay.memory : param.memory,
      flow: param.flow.map((item, index) => (overlay.flow && overlay.flow[index] != null
        ? Object.assign({}, item, { sub: overlay.flow[index] })
        : item)),
      traceTitle: overlay.traceTitle != null ? overlay.traceTitle : param.traceTitle
    });

    const variants = param.variants || [];
    if (variants.length === 1) {
      copy.variants = [{ label: copy.traceTitle || uiText('atlas.traceWindow'), trace: localizeTrace(variants[0].trace, overlay) }];
    } else if (variants.length > 1) {
      copy.variants = variants.map((variant, index) => {
        const translated = overlay.variants && overlay.variants[index];
        return {
          label: translated && translated.label ? translated.label : variant.label,
          trace: localizeTrace(variant.trace, translated || null)
        };
      });
    }
    return copy;
  }

  function localizeOverview() {
    if (!isEn()) return overview;
    const overlay = I18N.overview;
    if (!overlay) return overview;
    return Object.assign({}, overview, {
      title: overlay.title != null ? overlay.title : overview.title,
      intro: overlay.intro != null ? overlay.intro : overview.intro,
      note: overlay.note != null ? overlay.note : overview.note,
      phases: overview.phases.map((phase, index) => (overlay.phases && overlay.phases[index]
        ? Object.assign({}, phase, { title: overlay.phases[index].title, text: overlay.phases[index].text })
        : phase)),
      trace: localizeTrace(overview.trace, overlay)
    });
  }

  function storedTheme() {
    try {
      const value = window.localStorage.getItem(THEME_KEY) || window.localStorage.getItem(LEGACY_THEME_KEY);
      return value === 'light' || value === 'dark' ? value : '';
    } catch (error) {
      return '';
    }
  }

  function migrateThemePreference() {
    try {
      const current = window.localStorage.getItem(THEME_KEY);
      const legacy = window.localStorage.getItem(LEGACY_THEME_KEY);
      if (!current && (legacy === 'light' || legacy === 'dark')) {
        window.localStorage.setItem(THEME_KEY, legacy);
      }
      if (legacy) window.localStorage.removeItem(LEGACY_THEME_KEY);
    } catch (error) {}
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    const next = theme === 'dark' ? 'dark' : 'light';
    const nextName = uiText(next === 'dark' ? 'theme.light' : 'theme.dark');
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#070d17' : '#f2f6fb');
    if (themeToggle) {
      const switchLabel = uiText(next === 'dark' ? 'theme.toLight' : 'theme.toDark');
      themeToggle.setAttribute('aria-label', switchLabel);
      themeToggle.setAttribute('title', switchLabel);
      themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
      const label = themeToggle.querySelector('[data-theme-label]');
      const use = themeToggle.querySelector('use');
      if (label) label.textContent = nextName;
      if (use) use.setAttribute('href', next === 'dark' ? '#i-sun' : '#i-moon');
    }
    if (persist) {
      try {
        window.localStorage.setItem(THEME_KEY, next);
        window.localStorage.removeItem(LEGACY_THEME_KEY);
      } catch (error) {}
    }
  }

  function initTheme() {
    migrateThemePreference();
    applyTheme(currentTheme(), false);
    if (!themeToggle) return;
    themeToggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
      showToast(uiText(next === 'dark' ? 'theme.switchedDark' : 'theme.switchedLight'));
    });
    if (window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const followSystem = (event) => {
        if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light', false);
      };
      if (media.addEventListener) media.addEventListener('change', followSystem);
      else if (media.addListener) media.addListener(followSystem);
    }
  }

  function applyStaticLanguage() {
    const dict = I18N.ui[lang] || I18N.ui.zh || {};
    const text = (key) => (dict[key] == null ? null : dict[key]);

    $$('[data-i18n]').forEach((node) => {
      const value = text(node.dataset.i18n);
      if (value != null) node.textContent = value;
    });
    $$('[data-i18n-aria]').forEach((node) => {
      const value = text(node.dataset.i18nAria);
      if (value != null) node.setAttribute('aria-label', value);
    });
    $$('[data-i18n-title]').forEach((node) => {
      const value = text(node.dataset.i18nTitle);
      if (value != null) node.setAttribute('title', value);
    });
    $$('[data-i18n-placeholder]').forEach((node) => {
      const value = text(node.dataset.i18nPlaceholder);
      if (value != null) node.setAttribute('placeholder', value);
    });
    $$('[data-i18n-content]').forEach((node) => {
      const value = text(node.dataset.i18nContent);
      if (value != null) node.setAttribute('content', value);
    });

    document.documentElement.lang = isEn() ? 'en' : 'zh-CN';
    document.documentElement.setAttribute('data-lang', lang);

    $$('.lang-switch__option').forEach((button) => {
      const active = button.dataset.lang === lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function setLanguage(next) {
    const value = next === 'en' ? 'en' : 'zh';
    if (value === lang) return;
    lang = value;
    try {
      window.localStorage.setItem(LANG_KEY, value);
    } catch (error) {}
    applyStaticLanguage();
    applyTheme(currentTheme(), false);
    renderNav();
    renderRoute({ keepScroll: true });
    showToast(isEn() ? uiText('lang.switchedEn') : uiText('lang.switchedZh'));
  }

  function fmt(value, decimals = 3) {
    if (!Number.isFinite(value)) return '—';
    const fixed = value.toFixed(decimals);
    return fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  }

  function ns(value) {
    if (!Number.isFinite(value)) return '—';
    if (Math.abs(value) < 10) return fmt(value, 3);
    if (Math.abs(value) < 100) return fmt(value, 2);
    return fmt(value, 1);
  }

  let toastTimer = 0;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  const toneFor = (kind) => (kind === 'primary' ? 'amber' : (kind || 'muted'));

  /* ---------------------------------------------------------------------
     Sidebar index
     ------------------------------------------------------------------ */
  function matchesQuery(param, query) {
    if (!query) return true;
    const haystack = [
      param.symbol,
      param.nameZh,
      param.nameEn,
      param.aliases.join(' '),
      param.categoryZh,
      param.categoryEn,
      param.tags.join(' ')
    ].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  function renderNav() {
    const query = ui.query.trim();
    const visible = params.filter((param) => matchesQuery(param, query));
    const activeId = ui.activeView === 'atlas' ? ui.activeParam : null;

    let html = '';
    categories.forEach((category) => {
      const entries = visible.filter((param) => param.category === category.id);
      if (!entries.length) return;
      html += `
        <div class="nav-group">
          <div class="nav-group__head">
            <span>${category.code}</span>
            <strong>${esc(pick(category.zh, category.en))}</strong>
            <em>${entries.length}</em>
          </div>
          ${entries.map((param) => `
            <a class="nav-item${param.id === activeId ? ' is-active' : ''}" href="#/p/${param.id}" data-param="${param.id}"${param.id === activeId ? ' aria-current="page"' : ''}>
              <span class="nav-item__sym">${symbol(param.symbol)}</span>
              <span class="nav-item__name">${esc(pick(param.nameZh, param.nameEn))}</span>
              <span class="nav-item__index">${param.categoryCode}.${param.localIndex}</span>
            </a>
          `).join('')}
        </div>`;
    });

    paramNav.innerHTML = html;
    paramNav.hidden = visible.length === 0;
    searchEmpty.hidden = visible.length > 0;
    resultCount.textContent = query
      ? `${String(visible.length).padStart(2, '0')} / ${params.length}`
      : (isEn() ? `${params.length} ENTRIES` : `${params.length} 条参数`);
  }

  function updateSidebarSelection() {
    $$('.nav-item', paramNav).forEach((link) => {
      const active = ui.activeView === 'atlas' && link.dataset.param === ui.activeParam;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  /* ---------------------------------------------------------------------
     Routing and shell
     ------------------------------------------------------------------ */
  function readRoute() {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    if (parts[0] === 'p' && byId.has(parts[1])) {
      return { view: 'atlas', id: parts[1], valid: true };
    }
    if (parts[0] === 'sequence') return { view: 'sequence', id: null, valid: true };
    if (parts[0] === 'calc') return { view: 'calculator', id: null, valid: true };
    return { view: 'atlas', id: DEFAULT_ID, valid: false };
  }

  const viewRoots = {
    atlas: atlasView,
    sequence: sequenceView,
    calculator: calculatorView
  };

  function updateViewTabs() {
    $$('.view-tab').forEach((button) => {
      const active = button.dataset.view === ui.activeView;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function closeDrawer() {
    ui.drawerOpen = false;
    sidebar.classList.remove('is-open');
    sidebarScrim.classList.remove('is-open');
    document.body.classList.remove('has-drawer');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  function openDrawer() {
    ui.drawerOpen = true;
    sidebar.classList.add('is-open');
    sidebarScrim.classList.add('is-open');
    document.body.classList.add('has-drawer');
    menuButton.setAttribute('aria-expanded', 'true');
  }

  function renderRoute(options) {
    const keepScroll = Boolean(options && options.keepScroll);
    const scrollY = window.scrollY;
    stopAllWaves();
    const route = readRoute();
    if (!route.valid) {
      const fallback = `#/p/${route.id || DEFAULT_ID}`;
      if (window.location.hash !== fallback) window.history.replaceState(null, '', fallback);
    }

    if (route.view === 'atlas' && ui.activeParam !== route.id) ui.variant = 0;
    ui.activeView = route.view;
    if (route.view === 'atlas') ui.activeParam = route.id;

    Object.entries(viewRoots).forEach(([view, root]) => {
      const active = view === route.view;
      root.hidden = !active;
      root.classList.toggle('is-active', active);
    });

    updateViewTabs();
    renderNav();
    closeDrawer();

    if (route.view === 'atlas') {
      mountAtlas(ui.activeParam);
      const param = byId.get(ui.activeParam);
      document.title = `${param.symbol} · ${pick(param.nameZh, param.nameEn)} | tCK Atlas`;
    } else if (route.view === 'sequence') {
      mountSequence();
      document.title = uiText('sequence.docTitle');
    } else {
      mountCalculator();
      document.title = uiText('calc.docTitle');
    }

    if (keepScroll) window.scrollTo(0, scrollY);
    else window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------------------
     Atlas page
     ------------------------------------------------------------------ */
  function mountAtlas(id) {
    const base = byId.get(id) || byId.get(DEFAULT_ID);
    ui.activeParam = base.id;
    const param = localizeParam(base);
    const variants = param.variants || [];
    const safeVariant = Math.min(Math.max(ui.variant, 0), Math.max(variants.length - 1, 0));
    ui.variant = safeVariant;
    const trace = variants[safeVariant] ? variants[safeVariant].trace : param.trace;
    if (!trace) return;

    atlasView.innerHTML = atlasHTML(param, trace, variants);
    updateSidebarSelection();

    const wave = $('[data-wave-panel]', atlasView);
    if (wave) enhanceWave(wave, trace);

    $$('.variant-tab', atlasView).forEach((button) => {
      button.addEventListener('click', () => {
        const next = Number(button.dataset.variant);
        if (!Number.isFinite(next) || next === ui.variant) return;
        stopAllWaves();
        ui.variant = next;
        const scrollY = window.scrollY;
        mountAtlas(ui.activeParam);
        window.scrollTo(0, scrollY);
      });
    });
  }

  function atlasHTML(param, trace, variants) {
    const index = paramIndex(param.id);
    const prev = params[index - 1];
    const next = params[index + 1];
    const cat = categories.find((entry) => entry.id === param.category);
    const pager = `
      <div class="entry-pager">
        ${prev ? `<a href="#/p/${prev.id}" class="entry-pager__link"><span>PREV</span><strong>${symbol(prev.symbol)}</strong></a>` : '<span class="entry-pager__link is-disabled"><span>PREV</span><strong>—</strong></span>'}
        ${next ? `<a href="#/p/${next.id}" class="entry-pager__link entry-pager__link--next"><span>NEXT</span><strong>${symbol(next.symbol)}</strong></a>` : '<span class="entry-pager__link entry-pager__link--next is-disabled"><span>NEXT</span><strong>—</strong></span>'}
      </div>`;

    return `
      <div class="view-page atlas-page">
        <header class="param-hero">
          <div class="param-hero__body">
            <div class="eyebrow">
              <span class="eyebrow__signal"></span>
              <span>ATLAS ENTRY ${param.number} / ${params.length}</span>
              <span class="eyebrow__sep"></span>
              <span>${esc(cat ? pick(cat.zh, cat.en) : pick(param.categoryZh, param.categoryEn))}</span>
            </div>

            <div class="param-title-line">
              <h1 class="param-giant${String(param.symbol).length > 10 ? ' param-giant--long' : ''}">${symbol(param.symbol)}</h1>
              <span class="param-index">${param.categoryCode}.${param.localIndex}</span>
            </div>

            <div class="param-subline">
              <h2>${esc(pick(param.nameZh, param.nameEn))}</h2>
              <span>${esc(pick(param.nameEn, param.nameZh))}</span>
            </div>

            <p class="param-intro">${esc(param.intro)}</p>

            <div class="tag-row">
              ${param.tags.map((tag) => `<span class="tag">${esc(tag)}</span>`).join('')}
              <span class="tag-alias">ALIAS · ${param.aliases.map(esc).join(' / ')}</span>
            </div>

            <div class="hero-actions">
              <a class="button button--primary" href="#/sequence">
                <span>${uiText('atlas.openSequence')}</span>${icon('arrow')}
              </a>
              <a class="button button--ghost" href="#/calc">
                <span>${uiText('atlas.openCalc')}</span>${icon('calc')}
              </a>
            </div>

            ${pager}
          </div>

          <aside class="spec-plate" aria-label="${esc(uiText('atlas.specAria'))}">
            <div class="spec-plate__head">
              <span>SPECIMEN</span>
              <b>${param.categoryCode}·${param.localIndex}</b>
            </div>
            <div class="spec-plate__category">${esc(pick(param.categoryZh, param.categoryEn))}<span>${esc(pick(param.categoryEn, param.categoryZh))}</span></div>
            <div class="spec-plate__glyph">${symbol(param.symbol)}</div>
            <dl class="spec-plate__facts">
              <div><dt>${esc(param.facts[0].label)}</dt><dd>${esc(param.facts[0].value)}</dd></div>
              <div><dt>${esc(param.facts[1].label)}</dt><dd>${esc(param.facts[1].value)}</dd></div>
            </dl>
            <div class="spec-plate__barcode" aria-hidden="true"></div>
            <div class="spec-plate__foot"><span>JEDEC DDR4 / DDR5</span><span>FIELD NOTE</span></div>
          </aside>
        </header>

        <div class="atlas-grid">
          <div class="atlas-main">
            ${wavePanelHTML(trace, {
              kicker: 'SIGNAL TRACE / 01',
              title: param.traceTitle || uiText('atlas.traceWindow'),
              variants,
              activeVariant: ui.variant
            })}

            <section class="panel steps-panel">
              <div class="panel-head">
                <div>
                  <span class="section-index">HOW TO READ / 02</span>
                  <h3>${uiText('atlas.stepsTitle')}</h3>
                </div>
                <span class="panel-head__note">COMMAND LEVEL VIEW</span>
              </div>
              <div class="step-list">
                ${param.steps.map((step) => `
                  <article class="step">
                    <span class="step__tag">${esc(step.tag)}</span>
                    <div class="step__body">
                      <h4>${esc(step.title)}</h4>
                      <p>${esc(step.text)}</p>
                    </div>
                  </article>
                `).join('')}
              </div>
              <div class="flow-block">
                <span class="flow-block__label">SIGNAL PATH</span>
                <div class="flow-chain">
                  ${param.flow.map((item, flowIndex) => `
                    ${flowIndex ? '<span class="flow-arrow" aria-hidden="true">→</span>' : ''}
                    <span class="flow-node${item.key ? ' is-key' : ''}"><b>${esc(item.label)}</b><small>${esc(item.sub)}</small></span>
                  `).join('')}
                </div>
              </div>
            </section>

            <section class="panel context-panel">
              <div class="panel-head">
                <div>
                  <span class="section-index">IN PRACTICE / 03</span>
                  <h3>${uiText('atlas.contextTitle')}</h3>
                </div>
                <span class="context-mark" aria-hidden="true">“</span>
              </div>
              <p class="context-copy">${esc(param.context)}</p>
            </section>

            <section class="related-panel">
              <div class="section-heading">
                <div>
                  <span class="section-index">NEIGHBORS / 04</span>
                  <h3>${uiText('atlas.relatedTitle')}</h3>
                </div>
                <span class="section-heading__rule" aria-hidden="true"></span>
              </div>
              <div class="related-grid">
                ${param.related.map((relatedId) => {
                  const related = byId.get(relatedId);
                  if (!related) return '';
                  return `
                    <a class="related-card" href="#/p/${related.id}">
                      <span class="related-card__meta">${related.categoryCode} / ${esc(related.categoryEn)}</span>
                      <strong>${symbol(related.symbol)}</strong>
                      <span class="related-card__name">${esc(pick(related.nameZh, related.nameEn))}</span>
                      <span class="related-card__arrow" aria-hidden="true">${icon('arrow')}</span>
                    </a>`;
                }).join('')}
              </div>
            </section>
          </div>

          <aside class="atlas-rail">
            <section class="panel facts-panel">
              <div class="panel-head panel-head--compact">
                <div><span class="section-index">SPEC SHEET / A</span><h3>${uiText('atlas.factsTitle')}</h3></div>
              </div>
              <dl class="fact-list">
                ${param.facts.map((fact) => `
                  <div class="fact-row"><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>
                `).join('')}
              </dl>
            </section>

            <section class="panel equation-panel">
              <div class="panel-head panel-head--compact">
                <div><span class="section-index">RELATION / B</span><h3>${uiText('atlas.relationTitle')}</h3></div>
              </div>
              <div class="equation">${esc(param.relation)}</div>
              <p>${esc(param.relationNote)}</p>
            </section>

            <section class="callout callout--warning">
              <span class="callout__label">WATCH OUT / C</span>
              <h3>${uiText('atlas.pitfallTitle')}</h3>
              <p>${esc(param.pitfall)}</p>
            </section>

            <section class="callout callout--memory">
              <span class="callout__label">MEMORY HOOK / D</span>
              <blockquote>${esc(param.memory)}</blockquote>
              <span class="callout__foot">${uiText('atlas.memoryFoot')}</span>
            </section>

            <div class="rail-note">
              <span>NOTE</span>
              <p>${uiText('atlas.railNote')}</p>
            </div>
          </aside>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------------------
     SVG waveform renderer
     ------------------------------------------------------------------ */
  let traceCounter = 0;
  const waveCw = () => 41;

  function renderTraceSVG(trace) {
    const cycles = Math.max(1, Number(trace.cycles) || 1);
    const cw = waveCw(cycles);
    const pl = 98;
    const pr = 26;
    const width = pl + cycles * cw + pr;

    const clockTop = 54;
    const clockBottom = 76;
    const cmdTop = 98;
    const cmdH = 50;
    const auxTop = cmdTop + cmdH + 18;
    const auxH = 28;
    const auxGap = 11;
    const auxLanes = trace.auxLanes || [];
    const auxCount = auxLanes.length;
    const dataBursts = trace.dataBursts || [];
    const dataTop = auxTop + (auxCount ? auxCount * (auxH + auxGap) + 2 : 0);
    const dataH = 34;
    const dataBottom = dataBursts.length ? dataTop + dataH : (auxCount ? auxTop + auxCount * (auxH + auxGap) - auxGap : cmdTop + cmdH);
    const spanTop = dataBottom + 52;

    const spans = trace.spans || [];
    const rowCount = spans.length ? Math.max(...spans.map((span) => span.row || 0)) + 1 : 0;
    const rowH = 56;
    const height = spanTop + 22 + rowCount * rowH + 18;

    const uid = `trace-${++traceCounter}`;
    const xBase = (cycle) => pl + cycle * cw;
    const xCenter = (cycle) => pl + (cycle + 0.5) * cw;

    let svg = `<svg class="trace-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(trace.caption || uiText('atlas.waveTitle'))}" style="--trace-w:${width}px">`;
    svg += `<defs>
      <pattern id="${uid}-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" stroke="var(--wave-hatch, rgba(124, 168, 188, .13))" stroke-width="1"></line>
      </pattern>
    </defs>`;

    /* time guide */
    const arrowX = width - pr - 148;
    svg += `<g class="time-axis" aria-hidden="true">
      <line x1="${arrowX}" y1="17" x2="${width - pr}" y2="17"></line>
      <path d="M${width - pr - 6} 13l6 4-6 4"></path>
      <text x="${arrowX}" y="11">TIME →</text>
    </g>`;

    /* cycle labels and vertical guides */
    for (let i = 0; i < cycles; i += 1) {
      if (i % (cycles > 16 ? 2 : 1) === 0 || i === cycles - 1) {
        svg += `<text class="cycle-label${i === 0 ? ' is-first' : ''}" x="${xCenter(i)}" y="32" text-anchor="middle">T${String(i).padStart(2, '0')}</text>`;
      }
      svg += `<line class="cycle-grid" x1="${xBase(i)}" y1="38" x2="${xBase(i)}" y2="${height - 15}"></line>`;
    }
    svg += `<line class="cycle-grid" x1="${xBase(cycles)}" y1="38" x2="${xBase(cycles)}" y2="${height - 15}"></line>`;

    /* clock waveform */
    let clockPath = `M ${xBase(0)} ${clockTop}`;
    for (let i = 0; i < cycles; i += 1) {
      clockPath += ` H ${xBase(i) + cw * 0.5} V ${clockBottom} H ${xBase(i + 1)} V ${clockTop}`;
    }
    svg += `<text class="lane-label" x="${pl - 14}" y="${(clockTop + clockBottom) / 2 + 4}" text-anchor="end">CK</text>`;
    svg += `<text class="lane-sub" x="${pl - 14}" y="${(clockTop + clockBottom) / 2 + 17}" text-anchor="end">CLOCK</text>`;
    svg += `<path class="clock-wave" d="${clockPath}"></path>`;
    for (let i = 0; i <= cycles; i += 1) {
      svg += `<circle class="clock-edge" cx="${xBase(i)}" cy="${clockTop}" r="1.6"></circle>`;
    }

    /* command bus */
    svg += `<text class="lane-label" x="${pl - 14}" y="${cmdTop + 22}" text-anchor="end">COMMAND</text>`;
    svg += `<text class="lane-sub" x="${pl - 14}" y="${cmdTop + 34}" text-anchor="end">CMD BUS</text>`;
    svg += `<rect class="command-lane-base" x="${pl}" y="${cmdTop}" width="${cycles * cw}" height="${cmdH}"></rect>`;
    svg += `<rect class="command-lane" x="${pl}" y="${cmdTop}" width="${cycles * cw}" height="${cmdH}" fill="url(#${uid}-hatch)"></rect>`;

    const commands = new Map((trace.commands || []).map((command) => [Number(command.at), command]));
    for (let i = 0; i < cycles; i += 1) {
      const command = commands.get(i);
      const left = xBase(i);
      const center = xCenter(i);
      if (command) {
        const tagLeft = left + 4;
        const tagRight = left + cw - 4;
        const tagTop = cmdTop + 12;
        const tagBottom = tagTop + 23;
        const notch = 6;
        const path = `M ${tagLeft + notch} ${tagTop} L ${tagRight - notch} ${tagTop} L ${tagRight} ${(tagTop + tagBottom) / 2} L ${tagRight - notch} ${tagBottom} L ${tagLeft + notch} ${tagBottom} L ${tagLeft} ${(tagTop + tagBottom) / 2} Z`;
        svg += `<g class="command command--${esc(command.kind || 'act')}">
          <path class="command-tag" d="${path}"></path>
          <text class="command-label" x="${center}" y="${tagTop + 15}" text-anchor="middle">${esc(command.label)}</text>
          ${command.sub ? `<text class="command-sub" x="${center}" y="${cmdTop + 46}" text-anchor="middle">${esc(command.sub)}</text>` : ''}
          ${command.mark ? `<g class="command-mark"><circle cx="${tagRight - 2}" cy="${tagTop - 1}" r="7.5"></circle><text x="${tagRight - 2}" y="${tagTop + 2.5}" text-anchor="middle">${esc(command.mark)}</text></g>` : ''}
        </g>`;
      } else {
        svg += `<text class="command-nop" x="${center}" y="${cmdTop + cmdH / 2 + 3}" text-anchor="middle">NOP</text>`;
      }
      svg += `<line class="command-divider" x1="${left}" y1="${cmdTop}" x2="${left}" y2="${cmdTop + cmdH}"></line>`;
    }

    /* bank state lanes */
    if (auxCount) {
      auxLanes.forEach((lane, laneIndex) => {
        const top = auxTop + laneIndex * (auxH + auxGap);
        svg += `<text class="lane-label lane-label--small" x="${pl - 14}" y="${top + 13}" text-anchor="end">${esc(lane.label || 'STATE')}</text>`;
        svg += `<rect class="aux-lane" x="${pl}" y="${top}" width="${cycles * cw}" height="${auxH}" rx="3"></rect>`;
        (lane.segments || []).forEach((segment) => {
          const segStart = Math.max(0, Number(segment.from));
          const segEnd = Math.min(cycles, Number(segment.to));
          if (segEnd <= segStart) return;
          const segX = xBase(segStart) + 1;
          const segW = (segEnd - segStart) * cw - 2;
          svg += `<g class="aux-segment aux-segment--${esc(segment.kind || 'active')}">
            <rect x="${segX}" y="${top + 3}" width="${segW}" height="${auxH - 6}" rx="3"></rect>
            ${segment.label ? `<text x="${segX + segW / 2}" y="${top + 18}" text-anchor="middle">${esc(segment.label)}</text>` : ''}
          </g>`;
        });
      });
    }

    /* DQ data lane */
    if (dataBursts.length) {
      svg += `<text class="lane-label" x="${pl - 14}" y="${dataTop + 15}" text-anchor="end">DQ</text>`;
      svg += `<text class="lane-sub" x="${pl - 14}" y="${dataTop + 27}" text-anchor="end">DATA</text>`;
      dataBursts.forEach((burst) => {
        const start = Math.max(0, Number(burst.from));
        const end = Math.min(cycles, Number(burst.to));
        if (end <= start) return;
        const cells = burst.cells && burst.cells.length ? burst.cells : ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
        const cellW = ((end - start) * cw) / cells.length;
        const startX = xBase(start);
        const direction = burst.kind === 'write' ? 'WRITE DATA' : 'READ DATA';
        svg += `<text class="data-direction" x="${startX}" y="${dataTop - 7}">${direction} · ${cells.length} BEATS</text>`;
        svg += `<rect class="data-lane" x="${startX}" y="${dataTop}" width="${(end - start) * cw}" height="${dataH}" rx="2"></rect>`;
        cells.forEach((cell, cellIndex) => {
          const cellX = startX + cellIndex * cellW;
          svg += `<g class="data-cell data-cell--${esc(burst.kind || 'read')}">
            <rect x="${cellX + 0.8}" y="${dataTop + 1}" width="${cellW - 1.6}" height="${dataH - 2}" rx="1.5"></rect>
            <text x="${cellX + cellW / 2}" y="${dataTop + dataH / 2 + 3}" text-anchor="middle">${esc(cell)}</text>
          </g>`;
        });
      });
    }

    /* measurement brackets */
    svg += `<line class="measure-divider" x1="${pl}" y1="${spanTop - 16}" x2="${width - pr}" y2="${spanTop - 16}"></line>`;
    svg += `<text class="lane-label lane-label--measure" x="${pl - 14}" y="${spanTop + 2}" text-anchor="end">TIMING</text>`;
    spans.forEach((span, spanIndex) => {
      const row = Number(span.row) || 0;
      const tone = toneFor(span.kind);
      const startX = xBase(Math.max(0, Number(span.from)));
      const endX = xBase(Math.min(cycles, Number(span.to)));
      const rowTop = spanTop + 18 + row * rowH;
      const lineY = rowTop + 30;
      const midX = (startX + endX) / 2;
      const label = span.label;
      const caption = span.caption || '';
      const labelWidth = Math.max(56, String(label).length * 7.3 + 36);
      const pillX = midX - labelWidth / 2;
      const title = `${label}: ${caption}`;
      svg += `<g class="measure measure--${tone}${span.target === ui.activeParam && ui.activeView === 'atlas' ? ' is-current' : ''}" data-span-index="${spanIndex}" tabindex="0" role="button" aria-label="${esc(title)}. ${esc(uiText('wave.spanAria'))}">
        <title>${esc(title)}</title>
        <rect class="span-hit" x="${startX}" y="${rowTop - 8}" width="${Math.max(1, endX - startX)}" height="${rowH - 10}" rx="6"></rect>
        <line class="span-stem" x1="${startX}" y1="${lineY}" x2="${endX}" y2="${lineY}"></line>
        <line class="span-cap" x1="${startX}" y1="${lineY - 8}" x2="${startX}" y2="${lineY + 8}"></line>
        <line class="span-cap" x1="${endX}" y1="${lineY - 8}" x2="${endX}" y2="${lineY + 8}"></line>
        <rect class="span-pill" x="${pillX}" y="${lineY - 34}" width="${labelWidth}" height="24" rx="12"></rect>
        <text class="span-text" x="${midX}" y="${lineY - 18}" text-anchor="middle">${esc(label)}</text>
        ${span.target ? `<text class="span-link" x="${pillX + labelWidth - 10}" y="${lineY - 18}" text-anchor="middle">↗</text>` : ''}
      </g>`;
    });

    /* playhead */
    svg += `<g class="playhead" data-playhead transform="translate(${pl},0)" aria-hidden="true">
      <line x1="0" y1="37" x2="0" y2="${height - 15}"></line>
      <circle cx="0" cy="37" r="3"></circle>
    </g>`;

    svg += '</svg>';
    return svg;
  }

  function wavePanelHTML(trace, options) {
    const variants = options.variants || [];
    const activeVariant = Number(options.activeVariant) || 0;
    const cw = waveCw(Math.max(1, Number(trace.cycles) || 1));
    const svg = renderTraceSVG(trace);
    const tone = (span) => toneFor(span.kind);
    const noteButtons = (trace.spans || []).map((span, index) => {
      const label = span.label;
      const noteLabel = uiText('wave.noteAria').replace('{label}', label);
      return `
      <button class="wave-note wave-note--${tone(span)}" type="button" data-span-index="${index}" aria-label="${esc(noteLabel)}">
        <span class="wave-note__top"><i></i><b>${esc(label)}</b></span>
        <span class="wave-note__caption">${esc(span.caption || '')}</span>
        <span class="wave-note__arrow" aria-hidden="true">↗</span>
      </button>
    `;
    }).join('');

    return `
      <section class="panel waveform-panel" data-wave-panel data-wave-origin="98" data-wave-step="${cw}" data-wave-cycles="${trace.cycles}">
        <div class="panel-head wave-head">
          <div>
            <span class="section-index">${esc(options.kicker || 'SIGNAL TRACE / 01')}</span>
            <h3>${esc(options.title || uiText('atlas.waveTitle'))}</h3>
          </div>
          <div class="wave-tools">
            ${trace.notToScale ? '<span class="schematic-chip">SCHEMATIC · NOT TO SCALE</span>' : ''}
            <span class="scan-readout">AT <b data-scan-cycle>T00</b></span>
            <button class="wave-play" type="button" data-wave-play aria-pressed="false" aria-label="${esc(uiText('wave.playAria'))}">
              <span class="wave-play__icons" aria-hidden="true">
                ${icon('play')}${icon('pause')}
              </span>
              <span class="wave-play__label" data-play-label>SCAN</span>
            </button>
          </div>
        </div>

        ${variants.length > 1 ? `
          <div class="variant-bar">
            <span class="variant-bar__label">VARIANT</span>
            <div class="variant-tabs" role="tablist" aria-label="${esc(uiText('wave.variantAria'))}">
              ${variants.map((variant, index) => `
                <button class="variant-tab${index === activeVariant ? ' is-active' : ''}" type="button" role="tab" aria-selected="${index === activeVariant}" data-variant="${index}">
                  <span>${String(index + 1).padStart(2, '0')}</span>${esc(variant.label)}
                </button>
              `).join('')}
            </div>
          </div>` : ''}

        <div class="wave-scroll">${svg}</div>

        <div class="wave-inspect" aria-live="polite">
          <span class="wave-inspect__key">HOVER / FOCUS</span>
          <span class="wave-inspect__main">${uiText('wave.inspect')}</span>
          <span class="wave-inspect__desc">${esc(trace.caption || '')}</span>
        </div>

        <div class="wave-notes">${noteButtons}</div>

        <div class="wave-foot">
          <span><i class="legend-measure"></i> ${uiText('wave.legend')}</span>
          <span class="wave-scroll-hint">${uiText('wave.scrollHint')}</span>
          <span>${esc(trace.caption || '')}</span>
        </div>
      </section>`;
  }

  /* ---------------------------------------------------------------------
     Waveform enhancement: inspection + scan playback
     ------------------------------------------------------------------ */
  function enhanceWave(panel, trace) {
    const groups = $$('.measure', panel);
    const notes = $$('.wave-note', panel);
    const inspect = $('.wave-inspect', panel);
    const playButton = $('[data-wave-play]', panel);
    const playLabel = $('[data-play-label]', panel);
    const scanCycle = $('[data-scan-cycle]', panel);
    const playhead = $('[data-playhead]', panel);
    const origin = Number(panel.dataset.waveOrigin) || 98;
    const step = Number(panel.dataset.waveStep) || 46;
    const cycleCount = Number(panel.dataset.waveCycles) || trace.cycles || 1;
    const spans = trace.spans || [];

    const resetInspect = () => {
      inspect.innerHTML = `<span class="wave-inspect__key">HOVER / FOCUS</span>
        <span class="wave-inspect__main">${uiText('wave.inspect')}</span>
        <span class="wave-inspect__desc">${esc(trace.caption || '')}</span>`;
      groups.forEach((group) => group.classList.remove('is-hovered'));
      notes.forEach((note) => note.classList.remove('is-hovered'));
    };

    const showInspect = (index) => {
      const span = spans[index];
      if (!span) return;
      inspect.innerHTML = `<span class="wave-inspect__key wave-inspect__key--${toneFor(span.kind)}">${esc(span.label)}</span>
        <span class="wave-inspect__main">${esc(span.caption || uiText('wave.measure'))}</span>
        <span class="wave-inspect__desc">${esc(span.desc || '')}</span>`;
      groups.forEach((group, groupIndex) => group.classList.toggle('is-hovered', groupIndex === index));
      notes.forEach((note, noteIndex) => note.classList.toggle('is-hovered', noteIndex === index));
    };

    const openSpan = (span) => {
      if (!span || !span.target) return;
      if (ui.activeView === 'atlas' && span.target === ui.activeParam) {
        showToast(`${span.label} · ${span.caption || uiText('wave.current')}`);
        panel.classList.remove('is-flashing');
        void panel.offsetWidth;
        panel.classList.add('is-flashing');
        return;
      }
      window.location.hash = `#/p/${span.target}`;
    };

    groups.forEach((group) => {
      const index = Number(group.dataset.spanIndex);
      const span = spans[index];
      group.addEventListener('pointerenter', () => showInspect(index));
      group.addEventListener('focus', () => showInspect(index));
      group.addEventListener('pointerleave', resetInspect);
      group.addEventListener('blur', resetInspect);
      group.addEventListener('click', () => openSpan(span));
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openSpan(span);
        }
      });
    });

    notes.forEach((note) => {
      const index = Number(note.dataset.spanIndex);
      note.addEventListener('pointerenter', () => showInspect(index));
      note.addEventListener('focus', () => showInspect(index));
      note.addEventListener('pointerleave', resetInspect);
      note.addEventListener('blur', resetInspect);
      note.addEventListener('click', () => openSpan(spans[index]));
    });

    const setPlayingState = (playing) => {
      panel.classList.toggle('is-playing', playing);
      playButton.setAttribute('aria-pressed', String(playing));
      playLabel.textContent = playing ? 'PAUSE' : 'SCAN';
    };

    const stop = () => {
      if (panel._raf) window.cancelAnimationFrame(panel._raf);
      panel._raf = 0;
      panel._playing = false;
      setPlayingState(false);
      if (playhead) playhead.setAttribute('transform', `translate(${origin},0)`);
      if (scanCycle) scanCycle.textContent = 'T00';
    };

    panel._stopWave = stop;

    playButton.addEventListener('click', () => {
      if (panel._playing) {
        stop();
        return;
      }
      panel._playing = true;
      setPlayingState(true);
      const duration = Math.max(2600, cycleCount * 280);
      const startedAt = performance.now();
      const tick = (now) => {
        if (!panel._playing || !panel.isConnected) return;
        const progress = ((now - startedAt) / duration) % 1;
        const x = origin + progress * cycleCount * step;
        if (playhead) playhead.setAttribute('transform', `translate(${x.toFixed(2)},0)`);
        const cycle = Math.min(cycleCount - 1, Math.floor(progress * cycleCount));
        if (scanCycle) scanCycle.textContent = `T${String(cycle).padStart(2, '0')}`;
        panel._raf = window.requestAnimationFrame(tick);
      };
      panel._raf = window.requestAnimationFrame(tick);
    });

    const scroller = $('.wave-scroll', panel);
    if (scroller) {
      const syncScrollHint = () => {
        if (!panel.isConnected) return;
        panel.classList.toggle('is-scrollable', scroller.scrollWidth > scroller.clientWidth + 10);
      };
      syncScrollHint();
      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(() => {
          if (!panel.isConnected) {
            observer.disconnect();
            return;
          }
          syncScrollHint();
        });
        observer.observe(scroller);
      }
    }
  }

  function stopAllWaves() {
    $$('[data-wave-panel]').forEach((panel) => {
      if (typeof panel._stopWave === 'function') panel._stopWave();
    });
  }

  /* ---------------------------------------------------------------------
     Sequence page
     ------------------------------------------------------------------ */
  function mountSequence() {
    const view = localizeOverview();
    const trace = view.trace;
    const phases = view.phases;
    const commands = (trace.commands || []).length;
    const measurements = (trace.spans || []).length;
    const beats = (trace.dataBursts || []).reduce((total, burst) => total + (burst.cells ? burst.cells.length : 0), 0);

    sequenceView.innerHTML = `
      <div class="view-page sequence-page">
        <header class="sequence-hero">
          <div class="sequence-hero__copy">
            <div class="eyebrow"><span class="eyebrow__signal"></span><span>SEQUENCE / ONE READ, END TO END</span></div>
            <h1>${uiText('sequence.titleA')}<br><span>${uiText('sequence.titleB')}</span></h1>
            <p>${esc(view.intro)}</p>
            <div class="hero-actions">
              <a class="button button--primary" href="#/calc">${uiText('sequence.ctaCalc')} ${icon('arrow')}</a>
              <a class="button button--ghost" href="#/p/trcd">${uiText('sequence.ctaStart')} ${icon('back')}</a>
            </div>
          </div>
          <aside class="sequence-index">
            <span class="sequence-index__eyebrow">TRACE COMPOSITION</span>
            <div class="sequence-index__rows">
              <div><span>COMMANDS</span><b>${String(commands).padStart(2, '0')}</b></div>
              <div><span>MEASUREMENTS</span><b>${String(measurements).padStart(2, '0')}</b></div>
              <div><span>DATA BEATS</span><b>${String(beats).padStart(2, '0')}</b></div>
            </div>
            <p>${esc(view.note)}</p>
            <div class="sequence-index__rail" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          </aside>
        </header>

        ${wavePanelHTML(trace, {
          kicker: 'SEQUENCE TRACE / 01',
          title: view.title
        })}

        <section class="phase-section">
          <div class="section-heading">
            <div>
              <span class="section-index">BREAK IT DOWN / 02</span>
              <h2>${uiText('sequence.phaseTitle')}</h2>
            </div>
            <p>${uiText('sequence.phaseNote')}</p>
          </div>
          <div class="phase-grid">
            ${phases.map((phase) => `
              <a class="phase-card" href="#/p/${phase.target}">
                <span class="phase-card__code">${phase.code}</span>
                <span class="phase-card__time">${esc(phase.time)}</span>
                <h3>${esc(phase.title)}</h3>
                <p>${esc(phase.text)}</p>
                <span class="phase-card__link">${uiText('sequence.openParam')} ${icon('arrow')}</span>
              </a>
            `).join('')}
          </div>
        </section>

        <section class="formula-band">
          <div class="formula-item">
            <span>READ PATH</span>
            <code>t<sub>RCD</sub> + t<sub>CL</sub> → first DQ</code>
            <p>${uiText('sequence.formulaRead')}</p>
          </div>
          <div class="formula-item">
            <span>BUS OCCUPANCY</span>
            <code>(BL ÷ 2) × t<sub>CK</sub></code>
            <p>${uiText('sequence.formulaBus')}</p>
          </div>
          <div class="formula-item">
            <span>ROW CYCLE</span>
            <code>t<sub>RAS</sub> + t<sub>RP</sub> = t<sub>RC</sub></code>
            <p>${uiText('sequence.formulaRow')}</p>
          </div>
        </section>

        <div class="page-cta">
          <div>
            <span class="section-index">NEXT / NUMBERS</span>
            <h2>${uiText('sequence.ctaTitle')}</h2>
          </div>
          <a class="button button--primary" href="#/calc">${uiText('sequence.ctaButton')} ${icon('arrow')}</a>
        </div>
      </div>`;

    const wave = $('[data-wave-panel]', sequenceView);
    if (wave) enhanceWave(wave, trace);
  }

  /* ---------------------------------------------------------------------
     Calculator
     ------------------------------------------------------------------ */
  const calcField = (key, zh, en, unit, min, max, step = 1) => {
    const primary = isEn() ? en : zh;
    const secondary = isEn() ? zh : en;
    return `
    <label class="calc-field">
      <span class="calc-field__top"><b>${esc(primary)}</b>${secondary && secondary !== primary ? `<span>${esc(secondary)}</span>` : ''}</span>
      <span class="calc-field__control">
        <input type="number" inputmode="decimal" data-calc-field="${key}" value="${esc(calc[key])}" min="${min}" max="${max}" step="${step}" aria-label="${esc(primary)}">
        <span class="calc-field__unit">${esc(unit)}</span>
      </span>
    </label>`;
  };

  const presetButtons = (group) => DATA.calcPresets
    .filter((preset) => preset.group === group)
    .map((preset) => `<button class="calc-preset" type="button" data-calc-rate="${preset.rate}">${esc(preset.label)}</button>`)
    .join('');

  function mountCalculator() {
    calculatorView.innerHTML = `
      <div class="view-page calculator-page">
        <header class="calc-hero">
          <div class="calc-hero__copy">
            <div class="eyebrow"><span class="eyebrow__signal"></span><span>CALCULATOR / PERIOD ↔ NANOSECONDS</span></div>
            <h1>${uiText('calc.titleA')}<br><span>${uiText('calc.titleB')}</span></h1>
            <p>${uiText('calc.intro')}</p>
          </div>
          <div class="calc-hero__display">
            <span>ONE CLOCK CYCLE</span>
            <div class="calc-hero__number"><strong data-calc-out="tck">0.625</strong><em>ns</em></div>
            <div class="calc-hero__meta"><b data-calc-out="binLabel">DDR4-3200</b><span>·</span><span><b data-calc-out="clockMHz">1600</b> MHz CK</span></div>
          </div>
        </header>

        <div class="calc-layout">
          <section class="panel calc-controls">
            <div class="panel-head">
              <div><span class="section-index">INPUT / 01</span><h3>${uiText('calc.inputTitle')}</h3></div>
              <span class="panel-head__note">CYCLES IN, CYCLES OUT</span>
            </div>

            <div class="preset-block">
              <div class="preset-block__head"><span>SPEED BIN</span><small>${uiText('calc.presetNote')}</small></div>
              <div class="preset-group">
                <span class="preset-group__name">DDR4</span>
                <div class="preset-list">${presetButtons('DDR4')}</div>
              </div>
              <div class="preset-group">
                <span class="preset-group__name">DDR5</span>
                <div class="preset-list">${presetButtons('DDR5')}</div>
              </div>
            </div>

            <div class="calc-fields calc-fields--three">
              ${calcField('rate', '数据率', 'Data rate', 'MT/s', 400, 12000, 100)}
              ${calcField('cl', 'CL · 读延迟', 'CL · read latency', 'tCK', 1, 128, 1)}
              ${calcField('cwl', 'CWL · 写延迟', 'CWL · write latency', 'tCK', 1, 128, 1)}
            </div>

            <div class="calc-fields calc-fields--four">
              <div class="calc-field calc-field--burst">
                <span class="calc-field__top"><b>${uiText('calc.burst')}</b><span>${isEn() ? '突发长度' : 'BURST LENGTH'}</span></span>
                <div class="burst-toggle" role="group" aria-label="${esc(uiText('calc.burst'))}">
                  <button type="button" class="burst-option${calc.bl === 8 ? ' is-active' : ''}" data-calc-bl="8" aria-pressed="${calc.bl === 8}">BL8</button>
                  <button type="button" class="burst-option${calc.bl === 16 ? ' is-active' : ''}" data-calc-bl="16" aria-pressed="${calc.bl === 16}">BL16</button>
                </div>
              </div>
              ${calcField('trcd', 'tRCD', 'tRCD', 'tCK', 0, 128, 1)}
              ${calcField('trp', 'tRP', 'tRP', 'tCK', 0, 128, 1)}
              ${calcField('tras', 'tRAS', 'tRAS', 'tCK', 0, 256, 1)}
            </div>

            <details class="calc-advanced" open>
              <summary><span>${uiText('calc.refresh')}</span><span>REFRESH / ADVANCED</span></summary>
              <div class="calc-fields calc-fields--two">
                ${calcField('trfc', 'tRFC · 刷新停摆', 'tRFC · refresh blackout', 'ns', 20, 2000, 10)}
                ${calcField('trefi', 'tREFI · 平均间隔', 'tREFI · average interval', 'µs', 1, 20, 0.1)}
              </div>
              <p class="calc-hint">${uiText('calc.hint')}</p>
            </details>

            <div class="calc-controls__foot">
              <p><span>${uiText('calc.footLabel')}</span> ${uiText('calc.foot')}</p>
              <button class="text-button" type="button" data-calc-reset>${icon('refresh')} ${uiText('calc.reset')}</button>
            </div>
          </section>

          <section class="panel calc-readout">
            <div class="panel-head">
              <div><span class="section-index">OUTPUT / 02</span><h3>${uiText('calc.readoutTitle')}</h3></div>
              <span class="panel-head__note">ABSOLUTE TIME · ns</span>
            </div>

            <div class="readout-lead">
              <span>ONE CLOCK PERIOD</span>
              <div class="readout-lead__number"><strong data-calc-out="tck">0.625</strong><em>ns</em></div>
              <p><b data-calc-out="binLabel">DDR4-3200</b><span>·</span>${uiText('calc.formulaRate')}</p>
            </div>

            <div class="calc-metrics">
              <div class="calc-metric"><span>${uiText('calc.metricCl')}</span><strong data-calc-out="clNs">—</strong><em>ns</em><small>CL × tCK</small></div>
              <div class="calc-metric"><span>${uiText('calc.metricCwl')}</span><strong data-calc-out="cwlNs">—</strong><em>ns</em><small>CWL × tCK</small></div>
              <div class="calc-metric"><span>${uiText('calc.metricBurst')} <b data-calc-out="blLabel">BL8</b></span><strong data-calc-out="burstNs">—</strong><em>ns</em><small>BL ÷ 2 × tCK</small></div>
              <div class="calc-metric"><span>${uiText('calc.metricRead')}</span><strong data-calc-out="readNs">—</strong><em>ns</em><small>tRCD + CL</small></div>
              <div class="calc-metric"><span>${uiText('calc.metricRow')}</span><strong data-calc-out="rowCycleNs">—</strong><em>ns</em><small>tRAS + tRP</small></div>
              <div class="calc-metric"><span>${uiText('calc.metricBandwidth')}</span><strong data-calc-out="bandwidth">—</strong><em>GB/s</em><small>${uiText('calc.bandwidthFormula')}</small></div>
            </div>

            <div class="latency-ladder">
              <div class="subhead"><span>ABSOLUTE LATENCY LADDER</span><span>ns</span></div>
              <div class="ladder-row"><div class="ladder-label"><span>CL</span><b data-calc-out="clNs">—</b></div><div class="ladder-track"><i class="ladder-fill ladder-fill--cyan" data-calc-bar="clNs"></i></div></div>
              <div class="ladder-row"><div class="ladder-label"><span>tRCD</span><b data-calc-out="trcdNs">—</b></div><div class="ladder-track"><i class="ladder-fill ladder-fill--amber" data-calc-bar="trcdNs"></i></div></div>
              <div class="ladder-row"><div class="ladder-label"><span>tRP</span><b data-calc-out="trpNs">—</b></div><div class="ladder-track"><i class="ladder-fill ladder-fill--muted" data-calc-bar="trpNs"></i></div></div>
              <div class="ladder-row"><div class="ladder-label"><span>tRAS</span><b data-calc-out="trasNs">—</b></div><div class="ladder-track"><i class="ladder-fill ladder-fill--violet" data-calc-bar="trasNs"></i></div></div>
              <div class="ladder-row"><div class="ladder-label"><span>${uiText('calc.metricRead')}</span><b data-calc-out="readNs">—</b></div><div class="ladder-track"><i class="ladder-fill ladder-fill--orange" data-calc-bar="readNs"></i></div></div>
            </div>

            <div class="refresh-card">
              <div class="refresh-card__head">
                <div><span>AVG REFRESH OVERHEAD</span><strong>${uiText('calc.refreshOverhead')}</strong></div>
                <div class="refresh-card__number"><strong data-calc-out="overhead">—</strong><em>%</em></div>
              </div>
              <div class="refresh-meter"><i data-calc-bar="overhead"></i></div>
              <div class="refresh-scale"><span>0%</span><span>10%</span><span>20%+</span></div>
              <p>${uiText('calc.refreshNote')}</p>
            </div>

            <div class="readout-formula">
              <span>QUICK CHECK</span>
              <code>3200 MT/s → 1600 MHz → 0.625 ns</code>
              <p>${uiText('calc.quickCheckNote')}</p>
            </div>
          </section>
        </div>

        <section class="panel probe-panel">
          <div class="panel-head">
            <div><span class="section-index">PROBE / 03</span><h3>${uiText('calc.probeTitle')}</h3></div>
            <span class="probe-live">LIVE · 1 tCK = <b data-probe-tck>0.625</b> ns</span>
          </div>
          <div class="probe-grid">
            <div class="probe-card">
              <div class="probe-card__head"><span>01</span><b>CYCLES → NANOSECONDS</b></div>
              <label class="probe-input"><input type="number" inputmode="decimal" data-probe-input="cycles" value="${esc(calc.probeCycles)}" min="0" step="1" aria-label="${esc(uiText('calc.cycles'))}"><span>tCK</span></label>
              <div class="probe-result"><span>RESULT</span><strong data-probe-out="cyclesToNs">—</strong><em>ns</em></div>
            </div>
            <div class="probe-swap" aria-hidden="true">${icon('arrow')}</div>
            <div class="probe-card">
              <div class="probe-card__head"><span>02</span><b>NANOSECONDS → CYCLES</b></div>
              <label class="probe-input"><input type="number" inputmode="decimal" data-probe-input="ns" value="${esc(calc.probeNs)}" min="0" step="0.1" aria-label="${esc(uiText('calc.nanoseconds'))}"><span>ns</span></label>
              <div class="probe-result"><span>RESULT</span><strong data-probe-out="nsToCycles">—</strong><em>tCK</em></div>
            </div>
          </div>
          <p class="probe-note">${uiText('calc.probeNote')}</p>
        </section>

        <p class="calculator-disclaimer">${uiText('calc.disclaimer')}</p>
      </div>`;

    updateCalcUI();
  }

  function getCalcValues() {
    const rate = Math.max(1, calc.rate);
    const tck = 2000 / rate;
    const trfc = Math.max(0, calc.trfc);
    const trefiNs = Math.max(0, calc.trefi) * 1000;
    return {
      rate,
      tck,
      clNs: calc.cl * tck,
      cwlNs: calc.cwl * tck,
      burstNs: (calc.bl / 2) * tck,
      trcdNs: calc.trcd * tck,
      trpNs: calc.trp * tck,
      trasNs: calc.tras * tck,
      readNs: (calc.trcd + calc.cl) * tck,
      rowCycleNs: (calc.tras + calc.trp) * tck,
      bandwidth: (rate * 8) / 1000,
      overhead: trefiNs > 0 ? (trfc / trefiNs) * 100 : 0
    };
  }

  function setCalcOutput(key, value) {
    $$(`[data-calc-out="${key}"]`, calculatorView).forEach((node) => {
      node.textContent = value;
    });
  }

  function updateCalcUI() {
    const values = getCalcValues();
    const tckText = fmt(values.tck, 3);
    setCalcOutput('tck', tckText);
    setCalcOutput('clockMHz', fmt(values.rate / 2, 0));
    setCalcOutput('binLabel', `${values.rate >= 4800 ? 'DDR5' : 'DDR4'}-${Math.round(values.rate)}`);
    setCalcOutput('clNs', ns(values.clNs));
    setCalcOutput('cwlNs', ns(values.cwlNs));
    setCalcOutput('burstNs', ns(values.burstNs));
    setCalcOutput('trcdNs', ns(values.trcdNs));
    setCalcOutput('trpNs', ns(values.trpNs));
    setCalcOutput('trasNs', ns(values.trasNs));
    setCalcOutput('readNs', ns(values.readNs));
    setCalcOutput('rowCycleNs', ns(values.rowCycleNs));
    setCalcOutput('bandwidth', fmt(values.bandwidth, 1));
    setCalcOutput('overhead', fmt(values.overhead, 2));
    setCalcOutput('blLabel', `BL${calc.bl}`);

    const maxBar = Math.max(values.clNs, values.trcdNs, values.trpNs, values.trasNs, values.readNs, 0.001);
    const bars = {
      clNs: values.clNs,
      trcdNs: values.trcdNs,
      trpNs: values.trpNs,
      trasNs: values.trasNs,
      readNs: values.readNs
    };
    Object.entries(bars).forEach(([key, value]) => {
      $$(`[data-calc-bar="${key}"]`, calculatorView).forEach((bar) => {
        bar.style.width = `${Math.max(2, (value / maxBar) * 100).toFixed(1)}%`;
      });
    });
    $$('[data-calc-bar="overhead"]', calculatorView).forEach((bar) => {
      bar.style.width = `${Math.min(100, Math.max(1.5, (values.overhead / 20) * 100)).toFixed(1)}%`;
    });

    $$('.calc-preset', calculatorView).forEach((button) => {
      button.classList.toggle('is-active', Number(button.dataset.calcRate) === Number(calc.rate));
    });
    $$('.burst-option', calculatorView).forEach((button) => {
      const active = Number(button.dataset.calcBl) === Number(calc.bl);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    $$('[data-probe-tck]', calculatorView).forEach((node) => { node.textContent = tckText; });
    updateProbeUI(values.tck);
  }

  function updateProbeUI(tck) {
    const period = Number.isFinite(tck) ? tck : getCalcValues().tck;
    const cyclesToNs = Number(calc.probeCycles) * period;
    const nsToCycles = period > 0 ? Number(calc.probeNs) / period : 0;
    $$('[data-probe-out="cyclesToNs"]', calculatorView).forEach((node) => { node.textContent = ns(cyclesToNs); });
    $$('[data-probe-out="nsToCycles"]', calculatorView).forEach((node) => { node.textContent = fmt(nsToCycles, 2); });
  }

  function handleCalcInput(field) {
    const key = field.dataset.calcField;
    if (!(key in calc)) return;
    const value = Number(field.value);
    if (!Number.isFinite(value)) return;
    if (key === 'rate' && value < 1) return;
    if (key === 'trefi' && value < 0) return;
    calc[key] = value;
    updateCalcUI();
  }

  /* ---------------------------------------------------------------------
     Events
     ------------------------------------------------------------------ */
  function bindShellEvents() {
    $$('.lang-switch__option').forEach((button) => {
      button.addEventListener('click', () => setLanguage(button.dataset.lang));
    });

    $$('.view-tab').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.view === 'atlas') {
          window.location.hash = `#/p/${ui.activeParam || DEFAULT_ID}`;
        } else if (button.dataset.view === 'sequence') {
          window.location.hash = '#/sequence';
        } else {
          window.location.hash = '#/calc';
        }
      });
    });

    paramSearch.addEventListener('input', () => {
      ui.query = paramSearch.value;
      renderNav();
    });

    searchClear.addEventListener('click', () => {
      ui.query = '';
      paramSearch.value = '';
      renderNav();
      paramSearch.focus();
    });

    paramNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeDrawer();
    });

    menuButton.addEventListener('click', () => {
      if (ui.drawerOpen) closeDrawer();
      else openDrawer();
    });
    sidebarClose.addEventListener('click', closeDrawer);
    sidebarScrim.addEventListener('click', closeDrawer);

    window.addEventListener('hashchange', renderRoute);
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1120 && ui.drawerOpen) closeDrawer();
    });

    document.addEventListener('keydown', (event) => {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      const typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (document.activeElement && document.activeElement.isContentEditable);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        paramSearch.focus();
        paramSearch.select();
        return;
      }
      if (event.key === 'Escape') {
        if (document.activeElement === paramSearch || ui.query) {
          ui.query = '';
          paramSearch.value = '';
          renderNav();
          paramSearch.blur();
        }
        if (ui.drawerOpen) closeDrawer();
      }
    });

    calculatorView.addEventListener('input', (event) => {
      const field = event.target.closest('[data-calc-field]');
      if (field) {
        handleCalcInput(field);
        return;
      }
      const probe = event.target.closest('[data-probe-input]');
      if (probe) {
        const key = probe.dataset.probeInput === 'cycles' ? 'probeCycles' : 'probeNs';
        const value = Number(probe.value);
        if (Number.isFinite(value) && value >= 0) {
          calc[key] = value;
          updateProbeUI();
        }
      }
    });

    calculatorView.addEventListener('click', (event) => {
      const preset = event.target.closest('[data-calc-rate]');
      if (preset) {
        calc.rate = Number(preset.dataset.calcRate);
        const rateField = $('[data-calc-field="rate"]', calculatorView);
        if (rateField) rateField.value = String(calc.rate);
        updateCalcUI();
        return;
      }
      const burst = event.target.closest('[data-calc-bl]');
      if (burst) {
        calc.bl = Number(burst.dataset.calcBl);
        updateCalcUI();
        return;
      }
      if (event.target.closest('[data-calc-reset]')) {
        Object.assign(calc, {
          rate: 3200,
          cl: 16,
          cwl: 16,
          bl: 8,
          trcd: 16,
          trp: 16,
          tras: 32,
          trfc: 350,
          trefi: 7.8,
          probeCycles: 16,
          probeNs: 10
        });
        mountCalculator();
        showToast(uiText('calc.resetToast'));
      }
    });

    calculatorView.addEventListener('focusout', (event) => {
      const field = event.target.closest('[data-calc-field]');
      if (!field) return;
      const key = field.dataset.calcField;
      if (!(key in calc)) return;
      let value = Number(field.value);
      if (!Number.isFinite(value)) value = calc[key];
      const min = Number(field.min);
      const max = Number(field.max);
      if (Number.isFinite(min)) value = Math.max(min, value);
      if (Number.isFinite(max)) value = Math.min(max, value);
      calc[key] = value;
      field.value = String(value);
      updateCalcUI();
    });
  }

  function init() {
    applyStaticLanguage();
    initTheme();
    renderNav();
    if (!window.location.hash) {
      window.history.replaceState(null, '', `#/p/${DEFAULT_ID}`);
    }
    bindShellEvents();
    renderRoute();
  }

  init();
})();
