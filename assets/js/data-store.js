export const SITE_ROOT = new URL('../../', import.meta.url);
export const DATASETS = ['site', 'regions', 'stories', 'attractions', 'news'];

const draftKey = (name) => `taichung-good-fun:draft:${name}`;

export const clone = (value) => JSON.parse(JSON.stringify(value));

export const loadData = async (name, options = {}) => {
  if (!DATASETS.includes(name)) throw new Error(`未知的資料集：${name}`);
  const useDraft = options.useDraft ?? (
    location.pathname.includes('/admin/') || new URLSearchParams(location.search).get('preview') === '1'
  );
  if (useDraft) {
    const draft = localStorage.getItem(draftKey(name));
    if (draft) return JSON.parse(draft);
  }
  const response = await fetch(new URL(`data/${name}.json`, SITE_ROOT), { cache: 'no-store' });
  if (!response.ok) throw new Error(`無法讀取 data/${name}.json（${response.status}）`);
  return response.json();
};

export const loadAllData = async (options = {}) => Object.fromEntries(
  await Promise.all(DATASETS.map(async (name) => [name, await loadData(name, options)])),
);

export const saveDraft = (name, value) => {
  localStorage.setItem(draftKey(name), JSON.stringify(value));
  localStorage.setItem('taichung-good-fun:last-saved', new Date().toISOString());
};

export const hasDraft = (name) => localStorage.getItem(draftKey(name)) !== null;
export const clearDraft = (name) => localStorage.removeItem(draftKey(name));
export const clearAllDrafts = () => DATASETS.forEach(clearDraft);

export const downloadJson = (filename, value) => {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const readJsonFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    try { resolve(JSON.parse(reader.result)); } catch (error) { reject(new Error(`JSON 格式錯誤：${error.message}`)); }
  };
  reader.onerror = () => reject(new Error('無法讀取檔案。'));
  reader.readAsText(file, 'utf8');
});

export const siteUrl = (path = '') => new URL(path, SITE_ROOT).href;
export const assetUrl = (path = '') => {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return siteUrl(path.replace(/^\/+/, ''));
};

export const pageUrl = (page, params = {}, hash = '') => {
  const url = new URL(page, SITE_ROOT);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) url.searchParams.set(key, value);
  });
  if (hash) url.hash = hash;
  return url.href;
};

export const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const lineBreaks = (value = '') => escapeHtml(value).replaceAll('\n', '<br>');
export const shortDate = (value = '') => value ? String(value).slice(0, 10) : '';
export const query = (name, fallback = '') => new URLSearchParams(location.search).get(name) || fallback;

