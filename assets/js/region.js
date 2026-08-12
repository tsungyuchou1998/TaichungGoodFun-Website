import { assetUrl, escapeHtml, lineBreaks, loadData, pageUrl, query, siteUrl } from './data-store.js';
import { initializePublicUi, publicFooter, publicHeader, showPageError } from './public-ui.js?v=20260812-2';

const app = document.querySelector('#app');
const richTitle = (value = '') => escapeHtml(value).replaceAll('&lt;br&gt;', '<br>');

const render = async () => {
  const [site, regionData, storyData, attractionData] = await Promise.all([
    loadData('site'), loadData('regions'), loadData('stories'), loadData('attractions'),
  ]);
  const regions = regionData.filter((item) => item.is_published !== false).sort((a, b) => a.sort_order - b.sort_order);
  const region = regions.find((item) => item.slug === query('region')) || regions[0];
  if (!region) throw new Error('找不到可顯示的區域資料。');
  const stories = storyData
    .filter((item) => item.region === region.slug && item.is_published !== false && item.is_featured === true)
    .sort((a, b) => a.sort_order - b.sort_order);
  const attractions = attractionData.filter((item) => item.region === region.slug && item.is_published !== false).sort((a, b) => a.sort_order - b.sort_order).slice(0, 3);
  document.body.className = region.body_class || `${region.slug}-page`;
  document.title = region.title || `${region.name}｜臺中好地 Fun`;
  document.querySelector('meta[name="description"]').content = region.description || region.home.intro;

  app.innerHTML = `${publicHeader(site, { region })}<main>
    <section class="city-hero" aria-label="${escapeHtml(region.name)}風景照片輪播">
      <div class="city-hero-track">${region.hero.slides.map((slide, index) => `<div class="city-hero-slide ${index === 0 ? 'active' : ''}" style="background-image:url('${assetUrl(slide.image)}')" aria-hidden="${index !== 0}"><span class="sr-only">${escapeHtml(slide.alt)}</span></div>`).join('')}</div>
      <div class="city-hero-shade"></div><div class="city-hero-copy"><p class="eyebrow light">${escapeHtml(region.hero.eyebrow)}</p><h1>${escapeHtml(region.hero.title)}</h1><p>${escapeHtml(region.hero.subtitle)}</p></div>
      <div class="city-carousel-controls"><button class="city-carousel-arrow city-prev" type="button" aria-label="上一張照片">←</button><div class="city-carousel-dots" role="tablist" aria-label="選擇照片"></div><button class="city-carousel-arrow city-next" type="button" aria-label="下一張照片">→</button></div><a class="scroll-cue" href="#story"><span>DISCOVER</span><i></i></a>
    </section>
    <nav class="city-subnav" aria-label="${escapeHtml(region.name)}頁面導覽">${region.subnav.map((item) => `<a href="#${escapeHtml(item.target)}"><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.english)}</small><span>${escapeHtml(item.description)}</span></a>`).join('')}</nav>
    <section class="city-story section" id="story"><div class="story-lead reveal"><p class="eyebrow">${escapeHtml(region.story.eyebrow)}</p><h2>${lineBreaks(region.story.title)}</h2></div><div class="story-copy reveal">${region.story.paragraphs.map((paragraph, index) => `<p class="${index === 0 ? 'dropcap' : ''}">${escapeHtml(paragraph)}</p>`).join('')}<div class="district-list" aria-label="行政區">${region.story.districts.map((district) => `<span>${escapeHtml(district)}</span>`).join('')}</div></div></section>
    <section class="city-mosaic" aria-label="${escapeHtml(region.name)}風景"><div class="mosaic-intro reveal"><p class="eyebrow">${escapeHtml(region.mosaic.eyebrow)}</p><h2>${lineBreaks(region.mosaic.title)}</h2><p>${escapeHtml(region.mosaic.intro)}</p></div><div class="mosaic-wall">${region.mosaic.items.map((item, index) => `<figure class="${['mosaic-main','mosaic-side','mosaic-nature'][index % 3]} mosaic-from-${item.alignment === 'right' ? 'right' : 'left'} reveal"><div class="mosaic-media"><img src="${assetUrl(item.image)}" alt="${escapeHtml(item.alt)}" loading="lazy"></div><figcaption><span>${escapeHtml(item.number)}</span><div><small>${escapeHtml(item.kicker)}</small>${escapeHtml(item.caption)}</div></figcaption></figure>`).join('')}</div></section>
    <section class="city-guide section" id="guide"><div class="section-heading reveal"><div><p class="eyebrow">${escapeHtml(region.guide.eyebrow)}</p><h2>${escapeHtml(region.guide.title)}</h2></div><p class="heading-note">${escapeHtml(region.guide.note)}</p></div><div class="guide-grid">${stories.map((story, index) => `<a class="guide-card ${index === 0 ? 'feature' : ''} reveal" href="${pageUrl('pages/story.html', { story: story.slug })}" aria-label="閱讀遊記：${escapeHtml(story.title)}"><img src="${assetUrl(story.cover_image)}" alt="${escapeHtml(story.title)}" loading="lazy"><span>${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(story.title)}</h3><p>${escapeHtml(story.excerpt)}</p></a>`).join('')}</div><div class="guide-more reveal"><a href="${pageUrl('pages/stories.html', { region: region.slug }, 'stories')}">尋找更多靈感 <span aria-hidden="true">→</span></a></div></section>
    <section class="city-spots section" id="spots"><div class="section-heading reveal"><div><p class="eyebrow">${escapeHtml(region.spots.eyebrow)}</p><h2>${escapeHtml(region.spots.title)}</h2></div><a class="text-link" href="${escapeHtml(region.spots.more_url)}" target="_blank" rel="noopener noreferrer">探索更多景點 <span>↗</span></a></div><div class="spot-grid">${attractions.map((item, index) => `<a class="spot-card ${index === 0 ? 'spot-large' : ''} reveal" href="${escapeHtml(item.external_url || '#')}" ${item.external_url ? 'target="_blank" rel="noopener noreferrer"' : ''}><img src="${assetUrl(item.image_path)}" alt="${escapeHtml(item.name)}" loading="lazy"><div><small>${escapeHtml(item.meta_label || item.category)}</small><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.summary)}</p></div></a>`).join('') || '<p class="empty-message">目前沒有公開景點。</p>'}</div></section>
    <section class="city-flavors" id="flavors"><div class="flavor-banner"><div class="flavor-photo" style="background-image:url('${assetUrl(region.flavors.banner_image)}')"></div><div class="flavor-shade"></div><div class="flavor-copy reveal"><p class="eyebrow light">${escapeHtml(region.flavors.eyebrow)}</p><h2>${escapeHtml(region.flavors.title)}</h2><p>${escapeHtml(region.flavors.intro)}</p><div class="flavor-tags">${region.flavors.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div></div><div class="flavor-recommend section"><div class="section-heading reveal"><div><p class="eyebrow">${escapeHtml(region.flavors.collection_eyebrow)}</p><h2>${escapeHtml(region.flavors.collection_title)}</h2></div><p class="heading-note">${escapeHtml(region.flavors.note)}</p></div><div class="flavor-grid">${region.flavors.cards.map((item) => `<a class="flavor-card reveal" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"><span class="flavor-no">${escapeHtml(item.number)}</span><div class="flavor-kind">${escapeHtml(item.meta || item.kicker)}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><dl>${(item.details || []).map((detail) => `<div><dt>${escapeHtml(detail.label)}</dt><dd>${escapeHtml(detail.value)}</dd></div>`).join('')}</dl><span class="card-link">查看店家資訊 ↗</span></a>`).join('')}</div><div class="flavor-more reveal"><a class="text-link" href="${escapeHtml(region.flavors.more_url)}" target="_blank" rel="noopener noreferrer">瀏覽全部${escapeHtml(region.name)}美食 <span>↗</span></a></div></div></section>
    <section class="city-route section" id="route"><div class="route-selector reveal" role="tablist" aria-label="選擇推薦遊程">${region.routes.tabs.map((tab, index) => `<button class="route-tab ${index === 0 ? 'active' : ''}" type="button" role="tab" aria-selected="${index === 0}" data-route="${escapeHtml(tab.key)}">${escapeHtml(tab.label)}<small>${escapeHtml(tab.english)}</small></button>`).join('')}</div><p class="route-advice reveal">${escapeHtml(region.routes.advice)}</p><div class="route-layout" id="route-panel" role="tabpanel" tabindex="0"></div></section>
    <section class="next-region"><p>NEXT JOURNEY</p><a href="${siteUrl('index.html')}#regions"><span>${escapeHtml(region.next.label || '繼續探索臺中')}</span><strong>四大區域 →</strong></a></section>
  </main>${publicFooter(site, { region })}${new URLSearchParams(location.search).get('preview') === '1' ? '<span class="preview-banner">草稿預覽</span>' : ''}`;
  initializePublicUi();
  initializeRegion(region);
};

const initializeRegion = (region) => {
  const slides = [...document.querySelectorAll('.city-hero-slide')];
  const dots = document.querySelector('.city-carousel-dots');
  let current = 0;
  let timer;
  dots.innerHTML = slides.map((_, index) => `<button type="button" data-slide="${index}" aria-label="第 ${index + 1} 張"></button>`).join('');
  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => { slide.classList.toggle('active', position === current); slide.style.opacity = position === current ? '1' : '0'; slide.setAttribute('aria-hidden', String(position !== current)); });
    dots.querySelectorAll('button').forEach((dot, position) => dot.classList.toggle('active', position === current));
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => showSlide(current + 1), 5200); };
  document.querySelector('.city-prev')?.addEventListener('click', () => { showSlide(current - 1); start(); });
  document.querySelector('.city-next')?.addEventListener('click', () => { showSlide(current + 1); start(); });
  dots.addEventListener('click', (event) => { if (event.target.dataset.slide !== undefined) { showSlide(Number(event.target.dataset.slide)); start(); } });
  if (slides.length) { showSlide(0); start(); }

  const panel = document.querySelector('#route-panel');
  const renderPlan = (key) => {
    const plan = region.routes.plans[key];
    if (!plan) return;
    panel.innerHTML = `<div class="route-intro reveal visible" aria-live="polite"><p class="eyebrow">${escapeHtml(plan.eyebrow)}</p><h2>${richTitle(plan.title)}</h2><p>${escapeHtml(plan.description)}</p><div class="route-meta">${plan.meta.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div></div><ol class="route-line reveal visible" aria-live="polite">${plan.stops.map((stop) => `<li>${stop[4] ? `<span class="route-day-badge">${escapeHtml(stop[4])}</span>` : ''}<time>${escapeHtml(stop[0])}</time><div><small>${escapeHtml(stop[1])}</small><h3>${escapeHtml(stop[2])}</h3><p>${escapeHtml(stop[3])}</p></div></li>`).join('')}</ol>`;
  };
  const tabs = [...document.querySelectorAll('.route-tab')];
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((item) => { item.classList.toggle('active', item === tab); item.setAttribute('aria-selected', String(item === tab)); });
    renderPlan(tab.dataset.route);
  }));
  if (tabs[0]) renderPlan(tabs[0].dataset.route);
};

render().catch(showPageError);
