import {
  assetUrl, clearDraft, clone, downloadJson, escapeHtml, hasDraft, loadAllData, loadData,
  pageUrl, readJsonFile, saveDraft, siteUrl,
} from './data-store.js';

const page = document.body.dataset.adminPage;
const app = document.querySelector('#admin-app');
const now = () => new Date().toISOString();

const field = (path, label, type = 'text', options = {}) => ({ path, label, type, ...options });
const CONFIG = {
  home: {
    dataset: 'site', title: '首頁管理', kicker: 'TAICHUNG GOOD FUN', singleton: true,
    groups: [
      ['頁面與全站共用內容', [field('page.title', '瀏覽器標題', 'text', { wide: true, required: true }), field('page.description', '搜尋摘要', 'textarea', { wide: true, required: true }), field('site.logo', '網站 Logo 路徑', 'image', { wide: true }), field('site.nav_about', '選單：關於臺中'), field('site.nav_regions', '選單：區域探索'), field('site.nav_featured', '選單：景點精選'), field('site.nav_news', '選單：最新消息'), field('site.copyright', '版權文字', 'text', { wide: true })]],
      ['旅人手記按鈕與首頁主視覺', [field('journal.label', '旅人手記按鈕'), field('journal.action', '按鈕動作'), field('journal.page_title', '旅人手記頁標題', 'text', { wide: true }), field('journal.page_description', '旅人手記頁摘要', 'textarea', { wide: true }), field('journal.eyebrow', '旅人手記英文眉題'), field('journal.heading_suffix', '區域標題後綴'), field('journal.footer_text', '旅人手記頁尾文字', 'text', { wide: true }), field('journal.back_to_top', '返回頂端文字'), field('hero.japanese', '主視覺日文標語', 'text', { wide: true }), field('hero.micro', '主視覺英文標語', 'text', { wide: true }), field('hero.primary_label', '主要按鈕'), field('hero.video_label', '影片按鈕'), field('hero.slides', '輪播照片', 'json', { wide: true, help: '陣列格式，每筆需有 image 與 alt。' })]],
      ['關於臺中', [field('about.eyebrow', '英文眉題'), field('about.title', '標題', 'textarea'), field('about.body', '中文介紹', 'textarea', { wide: true }), field('about.body_en', '英文介紹', 'textarea', { wide: true }), field('about.link_label', '連結文字'), field('about.image', '圖片路徑', 'image'), field('about.image_alt', '圖片說明'), field('about.stat_label', '統計標籤'), field('about.stat_count', '統計數字', 'number'), field('about.stat_suffix', '統計後綴'), field('about.stat_caption', '統計說明', 'text', { wide: true })]],
      ['區域探索標題', [field('regions.eyebrow', '英文眉題'), field('regions.title', '標題'), field('regions.more_label', '更多連結文字'), field('regions.more_url', '更多連結網址', 'url', { wide: true })]],
      ['景點精選影片', [field('featured.poster', '影片封面', 'image', { wide: true }), field('featured.playlist', '影片播放清單', 'json', { wide: true, help: '陣列格式，每筆包含 src、title、subtitle、object_position。' })]],
      ['最新消息區塊', [field('news.eyebrow', '英文眉題'), field('news.title', '標題'), field('news.intro', '說明', 'textarea', { wide: true }), field('news.more_label', '更多連結文字'), field('news.more_url', '更多連結網址', 'url', { wide: true })]],
      ['「觀賞臺中」彈出影片', [field('modal.title', '無障礙標題'), field('modal.poster', '影片封面', 'image'), field('modal.video', '影片路徑', 'text', { wide: true })]],
    ],
  },
  regions: {
    dataset: 'regions', title: '區域頁面', kicker: 'TAICHUNG GOOD FUN', itemLabel: '區域', allowCreate: false,
    groups: [
      ['頁面與基本資料', [field('name', '中文名稱', 'text', { required: true }), field('english_name', '英文名稱'), field('slug', '代稱', 'text', { required: true }), field('body_class', '頁面樣式名稱'), field('title', '頁面標題', 'text', { wide: true }), field('description', '頁面摘要', 'textarea', { wide: true }), field('theme_color', '主題色彩', 'color'), field('sort_order', '排序', 'number'), field('is_published', '公開顯示', 'checkbox'), field('home.jump_label', '首頁快速選單文字'), field('home.tagline', '首頁卡片標語'), field('home.card_image', '首頁卡片圖片', 'image'), field('home.card_alt', '首頁卡片圖片說明'), field('home.intro', '首頁卡片介紹', 'textarea', { wide: true })]],
      ['區域頁快速選單', [field('subnav', '頁內選單', 'json', { wide: true })]],
      ['頁首主視覺', [field('hero.eyebrow', '英文眉題'), field('hero.title', '主標題'), field('hero.subtitle', '副標題', 'text', { wide: true }), field('hero.slides', '輪播照片', 'json', { wide: true })]],
      ['區域印象', [field('story.eyebrow', '英文眉題'), field('story.title', '介紹標題', 'textarea'), field('story.paragraphs', '介紹段落', 'json', { wide: true }), field('story.districts', '行政區', 'list', { wide: true, help: '用逗號分隔。' })]],
      ['風景影像牆', [field('mosaic', '影像牆內容', 'json', { wide: true })]],
      ['旅行攻略與景點標題', [field('guide.eyebrow', '英文眉題'), field('guide.title', '標題'), field('guide.note', '說明', 'text', { wide: true }), field('journal.label', '手記選單文字'), field('journal.intro', '手記列表介紹', 'textarea', { wide: true }), field('spots', '必遊景點區塊設定', 'json', { wide: true })]],
      ['地方風味區塊', [field('flavors', '地方風味內容', 'json', { wide: true })]],
      ['推薦遊程', [field('routes', '遊程內容', 'json', { wide: true }), field('next', '下一區設定', 'json', { wide: true })]],
    ],
  },
  stories: {
    dataset: 'stories', title: '旅人手記管理', kicker: 'TAICHUNG GOOD FUN', itemLabel: '遊記', allowCreate: true,
    groups: [
      ['基本資料', [field('title', '標題', 'text', { required: true }), field('slug', '網址代稱', 'text', { required: true }), field('region', '所屬區域', 'region', { required: true }), field('sort_order', '排序', 'number'), field('subtitle', '副標題', 'text', { wide: true }), field('excerpt', '卡片摘要', 'textarea', { wide: true }), field('category', '分類'), field('administrative_districts', '經過的行政區', 'list', { wide: true }), field('reading_time', '閱讀時間'), field('is_featured', '區域頁精選', 'checkbox'), field('is_published', '公開顯示', 'checkbox')]],
      ['圖片與旅行資訊', [field('cover_image', '封面圖片', 'image', { required: true }), field('detail_image', '內文圖片', 'image'), field('travel_season', '旅行季節'), field('duration', '建議時間'), field('mood', '旅行心情'), field('published_at', '發布日期', 'date')]],
      ['文章內容', [field('lead', '導言', 'textarea', { wide: true }), field('heading_one', '第一段標題', 'text', { wide: true }), field('body_one', '第一段內容', 'textarea', { wide: true }), field('image_caption', '圖片說明', 'text', { wide: true }), field('heading_two', '第二段標題', 'text', { wide: true }), field('body_two', '第二段內容', 'textarea', { wide: true }), field('quote', '引言', 'textarea', { wide: true }), field('tip', '旅行提醒', 'textarea', { wide: true })]],
    ],
    defaults: { title: '', slug: '', region: 'city', subtitle: '', excerpt: '', cover_image: '', detail_image: '', category: '旅行靈感', administrative_districts: [], reading_time: '閱讀 5 分鐘', travel_season: '', duration: '', mood: '', lead: '', heading_one: '', body_one: '', image_caption: '', heading_two: '', body_two: '', quote: '', tip: '', is_featured: false, is_published: true, sort_order: 1, published_at: '' },
  },
  attractions: {
    dataset: 'attractions', title: '景點管理', kicker: 'TAICHUNG GOOD FUN', itemLabel: '景點', allowCreate: true,
    groups: [
      ['景點資料', [field('name', '名稱', 'text', { required: true }), field('slug', '網址代稱', 'text', { required: true }), field('region', '所屬區域', 'region'), field('category', '分類'), field('meta_label', '英文標籤'), field('sort_order', '排序', 'number'), field('summary', '簡介', 'textarea', { wide: true }), field('description', '完整說明', 'textarea', { wide: true }), field('address', '地址', 'text', { wide: true }), field('image_path', '圖片路徑', 'image', { wide: true }), field('external_url', '外部網址', 'url', { wide: true }), field('latitude', '緯度', 'number'), field('longitude', '經度', 'number'), field('is_featured', '設為精選', 'checkbox'), field('is_published', '公開顯示', 'checkbox'), field('published_at', '發布日期', 'date')]],
    ],
    defaults: { name: '', slug: '', region: 'city', category: '', meta_label: '', summary: '', description: '', address: '', image_path: '', external_url: '', latitude: null, longitude: null, is_featured: false, is_published: true, sort_order: 1, published_at: '' },
  },
  news: {
    dataset: 'news', title: '最新消息管理', kicker: 'TAICHUNG GOOD FUN', itemLabel: '消息', allowCreate: true,
    groups: [
      ['消息內容', [field('title', '標題', 'text', { required: true, wide: true }), field('category', '分類'), field('source', '資料來源'), field('source_id', '來源編號'), field('source_url', '連結網址', 'url', { wide: true }), field('source_updated_at', '更新日期', 'date'), field('event_starts_at', '活動開始', 'date'), field('event_ends_at', '活動結束', 'date'), field('is_current', '公開顯示', 'checkbox')]],
    ],
    defaults: { title: '', category: '活動', source: '自行建立', source_id: '', source_url: '', source_updated_at: new Date().toISOString().slice(0, 10), event_starts_at: '', event_ends_at: '', is_current: true },
  },
};

const getPath = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
const setPath = (object, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((current, key) => (current[key] ??= {}), object);
  target[last] = value;
};

const sidebar = (site) => `<aside class="admin-sidebar"><a class="admin-brand" href="${siteUrl('admin/index.html')}"><img src="${assetUrl(site.site.logo)}" alt="臺中好地 Fun"><span>內容管理</span></a><nav>
  <a class="${page === 'dashboard' ? 'active' : ''}" href="${siteUrl('admin/index.html')}">總覽</a>
  <a class="${page === 'home' ? 'active' : ''}" href="${siteUrl('admin/home.html')}">首頁管理</a>
  <a class="${page === 'regions' ? 'active' : ''}" href="${siteUrl('admin/regions.html')}">區域頁面</a>
  <a class="${page === 'attractions' ? 'active' : ''}" href="${siteUrl('admin/attractions.html')}">景點管理</a>
  <a class="${page === 'stories' ? 'active' : ''}" href="${siteUrl('admin/stories.html')}">旅人手記</a>
  <a class="${page === 'news' ? 'active' : ''}" href="${siteUrl('admin/news.html')}">最新消息</a>
  <a href="${pageUrl('index.html')}" target="_blank" rel="noopener">查看網站 ↗</a>
  </nav><a class="admin-side-action" href="${pageUrl('index.html', { preview: 1 })}" target="_blank" rel="noopener">預覽草稿 ↗</a></aside>`;

const shell = (site, config, content = '') => {
  const title = config?.title || '管理總覽';
  const kicker = config?.kicker || 'TAICHUNG GOOD FUN';
  const dataTools = config ? `<details class="admin-data-tools"><summary><span><small>JSON DATA</small><strong>資料檔案工具</strong></span><em>${hasDraft(config.dataset) ? '目前使用瀏覽器草稿' : `目前使用 data/${config.dataset}.json`}</em></summary><div><p>草稿只保存在目前瀏覽器。確認預覽後，請下載 JSON 並取代 <code>data/</code> 內的同名檔案。</p><div class="admin-toolbar"><button class="button" id="import-json">匯入 JSON</button><button class="button" id="download-json">下載 ${config.dataset}.json</button><button class="button danger" id="reset-draft">還原檔案內容</button><input id="json-file" type="file" accept="application/json,.json" hidden></div></div></details>` : '';
  app.innerHTML = `<div class="admin-body">${sidebar(site)}<main class="admin-main"><header class="admin-top"><div><small>${escapeHtml(kicker)}</small><h1>${escapeHtml(title)}</h1></div><span>本機 JSON 模式</span></header><div id="admin-status" class="admin-status-line" role="status"></div><div id="admin-content">${content}</div>${dataTools}</main></div>`;
};

const status = (message, error = false) => {
  const element = document.querySelector('#admin-status');
  if (!element) return;
  element.textContent = message;
  element.style.color = error ? '#a43d3d' : '#3b6c53';
};

const renderDashboard = async () => {
  const data = await loadAllData();
  shell(data.site, null);
  const regionName = (slug) => data.regions.find((region) => region.slug === slug)?.name || slug || '—';
  const recentStories = [...data.stories].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)).slice(0, 6);
  const files = [['site', '首頁設定', 1], ['regions', '區域', data.regions.length], ['stories', '遊記', data.stories.length], ['attractions', '景點', data.attractions.length], ['news', '消息', data.news.length]];
  document.querySelector('#admin-content').innerHTML = `<section class="admin-stats"><article><small>區域</small><strong>${data.regions.length}</strong></article><article><small>遊記</small><strong>${data.stories.length}</strong></article><article><small>景點</small><strong>${data.attractions.length}</strong></article><article><small>最新活動</small><strong>${data.news.filter((item) => item.is_current !== false).length}</strong></article></section>
    <section class="admin-panel"><div class="panel-heading"><div><small>RECENTLY UPDATED</small><h2>最近更新的遊記</h2></div><a class="button" href="${siteUrl('admin/stories.html')}?action=create">＋ 新增遊記</a></div><div class="admin-table-wrap"><table><thead><tr><th>遊記</th><th>區域</th><th>狀態</th><th>更新時間</th><th></th></tr></thead><tbody>${recentStories.map((story) => `<tr><td><strong>${escapeHtml(story.title)}</strong><small>${escapeHtml(story.slug)}</small></td><td>${escapeHtml(regionName(story.region))}</td><td><span class="status ${story.is_published !== false ? 'on' : 'off'}">${story.is_published !== false ? '已發布' : '草稿'}</span></td><td>${formatDateTime(story.updated_at || story.created_at)}</td><td><a href="${siteUrl('admin/stories.html')}?edit=${encodeURIComponent(story.slug)}">編輯</a></td></tr>`).join('')}</tbody></table></div></section>
    <section class="admin-panel"><div class="panel-heading"><div><small>JSON DATA</small><h2>資料檔案工具</h2></div><div class="admin-toolbar"><button class="button" id="download-backup">下載全部備份</button><a class="button primary" href="${pageUrl('index.html', { preview: 1 })}" target="_blank" rel="noopener">預覽網站</a></div></div><div class="admin-dashboard-files">${files.map(([name, label, count]) => `<div><span><i class="admin-draft-dot ${hasDraft(name) ? 'on' : ''}"></i>${label}</span><span>${hasDraft(name) ? '有瀏覽器草稿' : '使用 data 檔案'} · ${count} 筆</span></div>`).join('')}</div></section>
    <section class="admin-panel admin-help"><h2>本機管理方式</h2><p>在各管理頁儲存草稿後，可直接開啟草稿預覽。確認無誤後下載 JSON，再放回 <code>data</code> 資料夾；圖片請放進 <code>assets/images</code>。</p></section>`;
  document.querySelector('#download-backup').addEventListener('click', () => downloadJson(`taichung-good-fun-backup-${new Date().toISOString().slice(0, 10)}.json`, data));
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(String(value));
  return date.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replaceAll('/', '-');
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(String(value));
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-');
};

const SECTION_KICKERS = {
  home: ['PAGE & SITE', 'TRAVEL JOURNAL & HERO', 'ABOUT TAICHUNG', 'REGIONAL EXPLORATION', 'FEATURED VIDEOS', 'NEWS', 'INTRO VIDEO'],
  regions: ['PAGE IDENTITY', 'PAGE NAVIGATION', 'HERO', 'REGION STORY', 'PHOTO WALL', 'SECTION LABELS', 'LOCAL FLAVORS', 'JOURNEY PLANNER'],
  stories: ['STORY IDENTITY', 'IMAGES', 'ARTICLE'],
  attractions: ['ATTRACTION'],
  news: ['NEWS ARTICLE'],
};

const inputHtml = (definition, item, regions) => {
  const value = getPath(item, definition.path);
  const attributes = `${definition.required ? 'required' : ''} name="${definition.path}" id="field-${definition.path.replaceAll('.', '-')}"`;
  let control;
  if (definition.type === 'textarea') control = `<textarea ${attributes} rows="5">${escapeHtml(value ?? '')}</textarea>`;
  else if (definition.type === 'json') control = `<textarea ${attributes} rows="10">${escapeHtml(JSON.stringify(value ?? (definition.path.includes('slides') ? [] : {}), null, 2))}</textarea>`;
  else if (definition.type === 'list') control = `<textarea ${attributes} rows="2">${escapeHtml(Array.isArray(value) ? value.join('、') : (value ?? ''))}</textarea>`;
  else if (definition.type === 'checkbox') control = `<input ${attributes} type="checkbox" ${value ? 'checked' : ''}>`;
  else if (definition.type === 'region') control = `<select ${attributes}>${regions.map((region) => `<option value="${escapeHtml(region.slug)}" ${region.slug === value ? 'selected' : ''}>${escapeHtml(region.name)}</option>`).join('')}</select>`;
  else control = `<input ${attributes} type="${definition.type === 'image' ? 'text' : definition.type}" value="${escapeHtml(value ?? '')}" ${definition.type === 'number' ? 'step="any"' : ''}>`;
  const preview = definition.type === 'image' && value ? `<div class="image-preview"><img src="${assetUrl(value)}" alt=""><small>目前圖片</small></div>` : '';
  return `<label class="${definition.wide ? 'wide' : ''} ${definition.type === 'json' ? 'admin-json' : ''} ${definition.type === 'checkbox' ? 'check' : ''}"><span>${escapeHtml(definition.label)}</span>${control}${preview}${definition.help ? `<small>${escapeHtml(definition.help)}</small>` : ''}</label>`;
};

const formHtml = (config, item, regions, isNew = false) => {
  const submitLabel = config.singleton ? '儲存首頁內容' : config.dataset === 'regions' ? '儲存區域頁面' : isNew ? `建立${config.itemLabel}` : '儲存變更';
  return `<form class="admin-form admin-editor" id="content-form">${config.groups.map(([name, fields], index) => `<section class="admin-panel"><div class="panel-heading"><div><small>${SECTION_KICKERS[config.dataset === 'site' ? 'home' : config.dataset]?.[index] || 'CONTENT'}</small><h2>${escapeHtml(name)}</h2></div></div><div class="form-grid">${fields.map((definition) => inputHtml(definition, item, regions)).join('')}</div></section>`).join('')}<div class="editor-actions"><span id="form-error" class="admin-field-error">草稿會保存在目前瀏覽器。</span><button type="button" class="button" id="cancel-edit">取消</button><button type="submit" class="primary">${submitLabel}</button></div></form>`;
};

const parseForm = (form, config, original) => {
  const result = clone(original);
  for (const [, fields] of config.groups) for (const definition of fields) {
    const input = form.elements.namedItem(definition.path);
    let value;
    if (definition.type === 'checkbox') value = input.checked;
    else if (definition.type === 'number') value = input.value === '' ? null : Number(input.value);
    else if (definition.type === 'json') value = JSON.parse(input.value || 'null');
    else if (definition.type === 'list') value = input.value.split(/[、,，\n]/).map((item) => item.trim()).filter(Boolean);
    else value = input.value.trim();
    setPath(result, definition.path, value);
  }
  result.updated_at = now();
  return result;
};

const renderManager = async (config, site) => {
  let data = await loadData(config.dataset);
  const regions = config.dataset === 'regions' ? data : await loadData('regions');
  const storiesForCounts = config.dataset === 'regions' ? await loadData('stories') : [];
  let editIndex = null;
  const storyListState = { region: '', sort: 'manual', search: '' };
  shell(site, config);
  const content = document.querySelector('#admin-content');
  const regionName = (slug) => regions.find((region) => region.slug === slug)?.name || slug || '—';

  const rememberStoryListState = () => {
    if (config.dataset !== 'stories') return;
    storyListState.region = document.querySelector('#admin-region-filter')?.value || '';
    storyListState.sort = document.querySelector('#admin-sort')?.value || 'manual';
    storyListState.search = document.querySelector('#admin-search')?.value || '';
  };

  const filteredRows = () => {
    if (config.singleton) return [];
    const search = document.querySelector('#admin-search')?.value.trim().toLowerCase() || '';
    const region = document.querySelector('#admin-region-filter')?.value || '';
    const rows = data.map((item, index) => ({ item, index })).filter(({ item }) => {
      const matchesSearch = !search || `${item.title || item.name || ''} ${item.slug || ''}`.toLowerCase().includes(search);
      return matchesSearch && (!region || item.region === region || item.slug === region);
    });
    const sort = document.querySelector('#admin-sort')?.value || 'manual';
    return rows.sort((a, b) => {
      const createdA = new Date(a.item.created_at || a.item.published_at || 0).getTime();
      const createdB = new Date(b.item.created_at || b.item.published_at || 0).getTime();
      const updatedA = new Date(a.item.updated_at || 0).getTime();
      const updatedB = new Date(b.item.updated_at || 0).getTime();
      if (sort === 'created_desc') return createdB - createdA;
      if (sort === 'created_asc') return createdA - createdB;
      if (sort === 'updated_desc') return updatedB - updatedA;
      if (sort === 'updated_asc') return updatedA - updatedB;
      if (sort === 'views_desc') return Number(b.item.view_count || 0) - Number(a.item.view_count || 0);
      if (sort === 'views_asc') return Number(a.item.view_count || 0) - Number(b.item.view_count || 0);
      return Number(a.item.sort_order || 0) - Number(b.item.sort_order || 0);
    });
  };

  const renderHomeSummary = () => `<section class="admin-grid-cards admin-home-cards"><article class="admin-region-card"><img src="${assetUrl(data.hero?.slides?.[0]?.image || site.site.logo)}" alt="${escapeHtml(data.hero?.slides?.[0]?.alt || data.page?.title || '首頁主視覺')}"><div><span class="status on">已發布</span><small>HOMEPAGE</small><h2>${escapeHtml(data.page?.title || '臺中好地 Fun')}</h2><p>${escapeHtml(data.hero?.japanese || data.page?.description || '')}</p><footer><div class="admin-region-stats"><strong>${data.hero?.slides?.length || 0} 張主視覺</strong><span>JSON 靜態首頁內容</span></div><button class="button" type="button" id="edit-home">編輯首頁</button></footer></div></article></section>`;

  const renderRegionCards = () => `<section class="admin-grid-cards">${data.map((region, index) => { const count = storiesForCounts.filter((story) => story.region === region.slug).length; return `<article class="admin-region-card"><img src="${assetUrl(region.home?.card_image || region.hero?.slides?.[0]?.image)}" alt="${escapeHtml(region.name)}"><div><span class="status ${region.is_published !== false ? 'on' : 'off'}">${region.is_published !== false ? '已發布' : '未發布'}</span><small>${escapeHtml(region.english_name || region.slug)}</small><h2>${escapeHtml(region.name)}</h2><p>${escapeHtml(region.home?.tagline || region.hero?.subtitle || '')}</p><footer><div class="admin-region-stats"><span>${count} 篇遊記</span><strong>${Number(region.view_count || 0).toLocaleString()} 次瀏覽</strong></div><button class="button" type="button" data-edit="${index}">編輯區域</button></footer></div></article>`; }).join('')}</section>`;

  const featureStateHtml = (item) => {
    if (!item.is_featured) return '<small>未上架</small>';
    if (item.is_published === false) return '<small class="feature-state-pending">等待公開發布</small>';
    if (hasDraft(config.dataset)) return '<small class="feature-state-pending">草稿預覽已上架</small>';
    return '<small class="feature-state-on">前台已上架</small>';
  };

  const storyRowHtml = ({ item, index }) => `<tr id="${escapeHtml(item.slug || `story-${index}`)}"><td><div class="story-cell"><span class="story-order">#${String(item.sort_order || index + 1).padStart(2, '0')}</span><img src="${assetUrl(item.cover_image)}" alt=""><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.slug)}</small></div></div></td><td><div class="story-classification"><div><strong>${escapeHtml(regionName(item.region))}</strong><span>${escapeHtml(item.category || '未分類')}</span></div><div class="admin-tags">${(item.administrative_districts || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div></td><td><dl class="story-dates"><div><dt>建立日期</dt><dd><time>${formatDateTime(item.created_at || item.published_at)}</time></dd></div><div><dt>最後編輯日期</dt><dd><time>${formatDateTime(item.updated_at)}</time></dd></div></dl></td><td><div class="story-metrics"><div><small>瀏覽次數</small><strong>${Number(item.view_count || 0).toLocaleString()}</strong></div><span class="status ${item.is_published !== false ? 'on' : 'off'}">${item.is_published !== false ? '已發布' : '草稿'}</span></div></td><td><label class="story-feature-toggle"><input type="checkbox" data-feature="${index}" ${item.is_featured ? 'checked' : ''}><span class="feature-toggle-track" aria-hidden="true"></span><span class="feature-toggle-copy"><strong>${escapeHtml(regionName(item.region))}靈感</strong>${featureStateHtml(item)}</span></label></td><td class="story-actions-cell"><div class="story-row-actions"><a href="${pageUrl('pages/story.html', { story: item.slug, preview: 1 })}" target="_blank" rel="noopener">預覽</a><button class="edit" type="button" data-edit="${index}">編輯</button><button class="delete" type="button" data-delete="${index}">刪除</button></div></td></tr>`;

  const attractionRowHtml = ({ item, index }) => `<tr><td><div class="story-cell"><img src="${assetUrl(item.image_path)}" alt=""><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.slug)}</small></div></div></td><td>${escapeHtml(regionName(item.region))}</td><td>${Number(item.sort_order || 0)}</td><td><span class="status ${item.is_published !== false ? 'on' : 'off'}">${item.is_published !== false ? '已發布' : '草稿'}</span></td><td class="actions"><button type="button" data-edit="${index}">編輯</button><button class="delete" type="button" data-delete="${index}">刪除</button></td></tr>`;

  const newsRowHtml = ({ item, index }) => `<tr><td>${formatDate(item.source_updated_at)}</td><td><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.category || '')}</small></td><td>${escapeHtml(item.source || '—')}</td><td><span class="status ${item.is_current !== false ? 'on' : 'off'}">${item.is_current !== false ? '公開' : '過期'}</span></td><td class="actions"><button type="button" data-edit="${index}">編輯</button><button class="delete" type="button" data-delete="${index}">刪除</button></td></tr>`;

  const updateNewsFromOfficialSite = async () => {
    const button = document.querySelector('#sync-news');
    const originalText = button?.textContent || '自動更新當期活動';
    if (button) {
      button.disabled = true;
      button.textContent = '正在更新…';
    }
    status('正在讀取臺中觀光旅遊網右側的「當期活動」…');
    try {
      const endpoint = location.port === '4173'
        ? siteUrl('api/news/sync')
        : 'http://127.0.0.1:4173/api/news/sync';
      const response = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(result.articles)) throw new Error(result.message || `同步服務回應 ${response.status}`);

      const source = '臺中觀光旅遊網';
      const existingBySourceId = new Map(data.filter((item) => item.source === source).map((item) => [String(item.source_id), item]));
      const manualArticles = data.filter((item) => item.source !== source);
      let nextId = Math.max(0, ...data.map((item) => Number(item.id) || 0)) + 1;
      const syncedArticles = result.articles.map((article) => ({
        ...existingBySourceId.get(String(article.source_id)),
        ...article,
        id: existingBySourceId.get(String(article.source_id))?.id ?? nextId++,
      }));
      data = [...syncedArticles, ...manualArticles].sort((a, b) => String(b.source_updated_at || '').localeCompare(String(a.source_updated_at || '')));
      saveDraft(config.dataset, data);
      renderList();
      status(`自動更新完成：已取得 ${syncedArticles.length} 則當期活動，並儲存為瀏覽器草稿。確認後請下載 news.json。`);
    } catch (error) {
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
      status(`${error.message}。請先執行 start-local.ps1 啟動新聞同步服務。`, true);
    }
  };

  const renderList = () => {
    if (config.singleton) {
      content.innerHTML = renderHomeSummary();
      content.onclick = (event) => { if (event.target.closest('#edit-home')) openEditor(0); };
      return;
    }
    if (config.dataset === 'regions') content.innerHTML = renderRegionCards();
    if (config.dataset === 'stories') content.innerHTML = `<section class="admin-panel story-management-panel"><div class="story-management-toolbar"><div class="story-filters"><label><span>區域</span><select id="admin-region-filter"><option value="">全部區域</option>${regions.map((region) => `<option value="${escapeHtml(region.slug)}">${escapeHtml(region.name)}</option>`).join('')}</select></label><label><span>文章排序</span><select id="admin-sort"><option value="manual">區域與手動順序</option><option value="created_desc">創作日期：新到舊</option><option value="created_asc">創作日期：舊到新</option><option value="updated_desc">最後編輯：新到舊</option><option value="updated_asc">最後編輯：舊到新</option><option value="views_desc">瀏覽次數：高到低</option><option value="views_asc">瀏覽次數：低到高</option></select></label><label class="story-title-search"><span>標題搜尋</span><input id="admin-search" type="search" placeholder="輸入遊記標題" maxlength="255" aria-label="依標題搜尋遊記"></label><button class="filter-search-button" id="admin-search-button" type="button">搜尋</button></div><button class="button primary story-create-button" id="create-item" type="button">＋ 新增遊記</button></div><div class="story-list-meta"><div><small>STORY LIBRARY</small><p>目前顯示 <strong id="result-count">0</strong> 篇遊記</p></div></div><div class="admin-table-wrap story-table-wrap"><table class="story-management-table"><thead><tr><th class="story-col">遊記內容</th><th class="classification-col">區域與行政區標籤</th><th class="dates-col">日期資訊</th><th class="metrics-col">數據與發布</th><th class="featured-col">區域靈感上架</th><th class="actions-col">操作</th></tr></thead><tbody id="manager-rows"></tbody></table></div></section>`;
    if (config.dataset === 'attractions') content.innerHTML = `<section class="admin-panel"><div class="panel-heading"><label class="inline-filter">所屬區域<select id="admin-region-filter"><option value="">全部區域</option>${regions.map((region) => `<option value="${escapeHtml(region.slug)}">${escapeHtml(region.name)}</option>`).join('')}</select></label><button class="button primary" id="create-item" type="button">＋ 新增景點</button></div><div class="admin-table-wrap"><table><thead><tr><th>景點</th><th>區域</th><th>排序</th><th>狀態</th><th></th></tr></thead><tbody id="manager-rows"></tbody></table></div></section>`;
    if (config.dataset === 'news') content.innerHTML = `<section class="admin-panel"><div class="panel-heading"><div><small>HOMEPAGE NEWS</small><h2>首頁消息文章</h2><p>首頁會顯示「公開」且更新日期最新的 4 筆。</p></div><div class="admin-toolbar"><button class="button" id="sync-news" type="button">↻ 自動更新當期活動</button><button class="button primary" id="create-item" type="button">＋ 新增消息</button></div></div><div class="admin-table-wrap"><table><thead><tr><th>更新日期</th><th>消息</th><th>來源</th><th>狀態</th><th></th></tr></thead><tbody id="manager-rows"></tbody></table></div></section><section class="admin-panel admin-help"><p>「自動更新當期活動」只會讀取臺中觀光旅遊網右側 <code>right-side-info-blk</code> 中的「當期活動」，並存為瀏覽器草稿。確認內容後，請下載檔案並取代 <code>data/news.json</code>。</p></section>`;
    if (config.dataset === 'stories') {
      document.querySelector('#admin-region-filter').value = storyListState.region;
      document.querySelector('#admin-sort').value = storyListState.sort;
      document.querySelector('#admin-search').value = storyListState.search;
    }
    const redrawRows = () => {
      if (config.dataset === 'regions') return;
      const rows = filteredRows();
      const renderer = config.dataset === 'stories' ? storyRowHtml : config.dataset === 'attractions' ? attractionRowHtml : newsRowHtml;
      const columnCount = config.dataset === 'stories' ? 6 : 5;
      document.querySelector('#manager-rows').innerHTML = rows.length ? rows.map(renderer).join('') : `<tr><td class="admin-empty-state" colspan="${columnCount}">沒有符合條件的資料。</td></tr>`;
      const resultCount = document.querySelector('#result-count');
      if (resultCount) resultCount.textContent = rows.length;
    };
    redrawRows();
    content.oninput = (event) => {
      if (event.target.matches('#admin-search')) {
        rememberStoryListState();
        redrawRows();
      }
    };
    content.onkeydown = (event) => {
      if (event.target.matches('#admin-search') && event.key === 'Enter') {
        event.preventDefault();
        redrawRows();
      }
    };
    content.onchange = (event) => {
      if (event.target.matches('#admin-region-filter,#admin-sort')) {
        rememberStoryListState();
        redrawRows();
      }
      if (event.target.matches('[data-feature]')) {
        const index = Number(event.target.dataset.feature);
        data[index].is_featured = event.target.checked;
        data[index].updated_at = now();
        saveDraft(config.dataset, data);
        redrawRows();
        status('區域靈感上架狀態已儲存為瀏覽器草稿；請用草稿預覽確認，下載並更新 JSON 後才會套用正式頁面。');
      }
    };
    content.onclick = (event) => {
      if (event.target.closest('#sync-news')) { updateNewsFromOfficialSite(); return; }
      if (event.target.closest('#admin-search-button')) { rememberStoryListState(); redrawRows(); return; }
      if (event.target.closest('#create-item')) { rememberStoryListState(); openEditor(null); return; }
      const editButton = event.target.closest('[data-edit]');
      const deleteButton = event.target.closest('[data-delete]');
      if (editButton) { rememberStoryListState(); openEditor(Number(editButton.dataset.edit)); }
      if (deleteButton && confirm(`確定刪除這筆${config.itemLabel}？`)) {
        data.splice(Number(deleteButton.dataset.delete), 1); saveDraft(config.dataset, data); renderList(); status('已刪除並儲存為瀏覽器草稿。');
      }
    };
    const requestedAction = new URLSearchParams(location.search);
    const requestedEdit = requestedAction.get('edit');
    if (requestedAction.get('action') === 'create' || requestedEdit) {
      history.replaceState(null, '', location.pathname);
      const requestedIndex = requestedEdit ? data.findIndex((item) => item.slug === requestedEdit) : null;
      if (requestedEdit && requestedIndex < 0) status('找不到指定的遊記，已顯示完整列表。', true);
      else openEditor(requestedIndex);
    }
  };

  const openEditor = (index) => {
    editIndex = index;
    const original = config.singleton ? data : index === null ? { id: Math.max(0, ...data.map((item) => Number(item.id) || 0)) + 1, ...clone(config.defaults) } : data[index];
    const editorName = config.dataset === 'regions' ? original.name : original.title || original.name || config.itemLabel;
    const heading = config.singleton ? '首頁管理' : index === null ? (config.dataset === 'news' ? '新增最新消息' : `新增${config.itemLabel}`) : `編輯${editorName}`;
    document.querySelector('.admin-top h1').textContent = heading;
    content.innerHTML = formHtml(config, original, regions, index === null);
    bindForm(original);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bindForm = (original) => {
    const form = document.querySelector('#content-form');
    document.querySelector('#cancel-edit')?.addEventListener('click', () => { document.querySelector('.admin-top h1').textContent = config.title; renderList(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      try {
        const updated = parseForm(form, config, original);
        if (config.singleton) data = updated;
        else if (editIndex === null) data.push(updated);
        else data[editIndex] = updated;
        saveDraft(config.dataset, data);
        status('草稿已儲存。可開啟草稿預覽，確認後再下載 JSON。');
        document.querySelector('.admin-top h1').textContent = config.title;
        renderList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        document.querySelector('#form-error').textContent = error instanceof SyntaxError ? `JSON 格式錯誤：${error.message}` : error.message;
      }
    });
  };

  renderList();
  document.querySelector('#download-json').addEventListener('click', () => downloadJson(`${config.dataset}.json`, data));
  document.querySelector('#import-json').addEventListener('click', () => document.querySelector('#json-file').click());
  document.querySelector('#json-file').addEventListener('change', async (event) => {
    try {
      const imported = await readJsonFile(event.target.files[0]);
      if (config.singleton ? (!imported || Array.isArray(imported) || typeof imported !== 'object') : !Array.isArray(imported)) throw new Error(config.singleton ? '此頁需要 JSON 物件。' : '此頁需要 JSON 陣列。');
      data = imported; saveDraft(config.dataset, data); renderList(); status('JSON 已匯入並儲存為瀏覽器草稿。');
    } catch (error) { status(error.message, true); }
    event.target.value = '';
  });
  document.querySelector('#reset-draft').addEventListener('click', async () => {
    if (!confirm('確定清除此頁的瀏覽器草稿，還原 data 檔案內容？')) return;
    clearDraft(config.dataset); data = await loadData(config.dataset, { useDraft: false }); renderList(); status('已還原 data 檔案內容。');
  });
};

const start = async () => {
  if (page === 'dashboard') return renderDashboard();
  const config = CONFIG[page];
  if (!config) throw new Error('未知的管理頁面。');
  const site = await loadData('site');
  await renderManager(config, site);
};

start().catch((error) => {
  console.error(error);
  app.innerHTML = `<main class="admin-main"><div class="admin-alert error"><strong>管理頁載入失敗</strong><p>${escapeHtml(error.message)}</p><p>請透過本機網站伺服器開啟本站。</p></div></main>`;
});
