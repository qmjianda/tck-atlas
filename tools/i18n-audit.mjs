import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = (file) => {
  const win = {};
  new Function('window', readFileSync(resolve(root, file), 'utf8'))(win);
  return win;
};

const dataWin = sandbox('data.js');
const i18nWin = sandbox('i18n.js');
const data = dataWin.DDR_ATLAS;
const i18n = i18nWin.DDR_ATLAS_I18N;

const CJK = /[\u3400-\u9fff\uff00-\uffef\u3000-\u303f]/;
const walk = (value, path, out) => {
  if (typeof value === 'string') {
    if (CJK.test(value)) out.push({ path, text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, out));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => walk(item, path ? `${path}.${key}` : key, out));
  }
};

const localizeTrace = (trace, overlay) => ({
  ...trace,
  caption: overlay?.caption ?? trace.caption,
  commands: (trace.commands || []).map((cmd, i) => (overlay?.commands?.[i] ? { ...cmd, ...overlay.commands[i] } : cmd)),
  auxLanes: (trace.auxLanes || []).map((lane, i) => (overlay?.auxLanes?.[i] ? {
    ...lane,
    label: overlay.auxLanes[i].label ?? lane.label,
    segments: lane.segments.map((seg, j) => (overlay.auxLanes[i].segments?.[j] != null ? { ...seg, label: overlay.auxLanes[i].segments[j] } : seg))
  } : lane)),
  spans: (trace.spans || []).map((span, i) => (overlay?.spans?.[i] ? { ...span, ...overlay.spans[i] } : span))
});

// Mirrors app.js localizeParam (rendered fields only).
const renderedParam = (param) => {
  const overlay = i18n.params[param.id] || {};
  const copy = {
    aliases: overlay.aliases || param.aliases,
    tags: overlay.tags || param.tags,
    intro: overlay.intro ?? param.intro,
    relation: overlay.relation ?? param.relation,
    relationNote: overlay.relationNote ?? param.relationNote,
    facts: param.facts.map((f, i) => (overlay.facts?.[i] ? { label: overlay.facts[i][0], value: overlay.facts[i][1] } : f)),
    steps: param.steps.map((s, i) => (overlay.steps?.[i] ? { tag: s.tag, title: overlay.steps[i].title, text: overlay.steps[i].text } : s)),
    context: overlay.context ?? param.context,
    pitfall: overlay.pitfall ?? param.pitfall,
    memory: overlay.memory ?? param.memory,
    flow: param.flow.map((item, i) => (overlay.flow?.[i] != null ? { ...item, sub: overlay.flow[i] } : item)),
    categoryEn: param.categoryEn,
    nameEn: param.nameEn,
    traceTitle: overlay.traceTitle ?? param.traceTitle
  };
  const variants = param.variants || [];
  copy.variants = variants.length === 1
    ? [{ label: copy.traceTitle, trace: localizeTrace(variants[0].trace, overlay) }]
    : variants.map((variant, i) => ({
      label: overlay.variants?.[i]?.label ?? variant.label,
      trace: localizeTrace(variant.trace, overlay.variants?.[i] || null)
    }));
  return copy;
};

const renderedOverview = () => {
  const overlay = i18n.overview || {};
  return {
    title: overlay.title ?? data.overview.title,
    intro: overlay.intro ?? data.overview.intro,
    note: overlay.note ?? data.overview.note,
    phases: data.overview.phases.map((p, i) => (overlay.phases?.[i] ? { ...p, title: overlay.phases[i].title, text: overlay.phases[i].text } : p)),
    trace: localizeTrace(data.overview.trace, overlay)
  };
};

const report = [];

for (const param of data.params) {
  if (!i18n.params[param.id]) report.push(`MISSING overlay: ${param.id}`);
  const out = [];
  walk(renderedParam(param), param.id, out);
  out.forEach((hit) => report.push(`PARAM ${hit.path} :: ${hit.text}`));
}

const ov = [];
walk(renderedOverview(), 'overview', ov);
ov.forEach((hit) => report.push(`PARAM ${hit.path} :: ${hit.text}`));

for (const preset of data.calcPresets) {
  const out = [];
  walk({ label: preset.label }, `preset.${preset.rate}`, out);
  out.forEach((hit) => report.push(`PRESET ${hit.path} :: ${hit.text}`));
}

// UI keys used by app.js and index.html must exist in both languages.
const appSrc = readFileSync(resolve(root, 'app.js'), 'utf8');
const htmlSrc = readFileSync(resolve(root, 'index.html'), 'utf8');
const used = new Set();
for (const match of appSrc.matchAll(/uiText\('([^']+)'\)/g)) used.add(match[1]);
for (const match of htmlSrc.matchAll(/data-i18n(?:-aria|-title|-placeholder|-content)?="([^"]+)"/g)) used.add(match[1]);
for (const key of [...used].sort()) {
  if (!(key in i18n.ui.zh)) report.push(`UI missing zh: ${key}`);
  if (!(key in i18n.ui.en)) report.push(`UI missing en: ${key}`);
}

console.log(report.join('\n'));
console.log(`\nTotal findings: ${report.length}`);
