import { assetUrl, escapeHtml, loadData, pageUrl, query } from './data-store.js';
import { initializePublicUi, publicFooter, publicHeader, showPageError } from './public-ui.js';

const app = document.querySelector('#app');

const render = async () => {
  const [site, regionData, storyData] = await Promise.all([loadData('site'), loadData('regions'), loadData('stories')]);
  const regions = regionData.filter((item) => item.is_published !== false).sort((a, b) => a.sort_order - b.sort_order);
  const activeRegion = regions.find((item) => item.slug === query('region')) || regions[0];
  const regionStories = storyData.filter((item) => item.region === activeRegion.slug && item.is_published !== false).sort((a, b) => a.sort_order - b.sort_order);
  const districts = [...new Set(regionStories.flatMap((story) => story.administrative_districts || []))];
  const requestedDistrict = query('district');
  const activeDistrict = districts.includes(requestedDistrict) ? requestedDistrict : '';
  document.title = site.journal.page_title;
  document.querySelector('meta[name="description"]').content = site.journal.page_description;

  app.innerHTML = `${publicHeader(site, { regions, activeRegion })}<main>
    <section class="story-hero city-hero" aria-label="精選遊記輪播"><div class="hero-track city-hero-track" id="hero-track"></div><div class="hero-shade city-hero-shade"></div><div class="hero-content city-hero-copy"><p class="eyebrow light">${escapeHtml(site.journal.eyebrow)}</p><p class="hero-count"><span id="hero-current">01</span> / <span id="hero-total">00</span></p><h1 id="hero-title"></h1><p class="hero-desc" id="hero-desc"></p></div><div class="hero-controls city-carousel-controls"><button class="city-carousel-arrow" type="button" id="hero-prev" aria-label="上一張">←</button><div class="hero-dots city-carousel-dots" id="hero-dots" role="tablist"></div><button class="city-carousel-arrow" type="button" id="hero-next" aria-label="下一張">→</button></div><a class="scroll-cue" href="#stories"><span>DISCOVER</span><i></i></a></section>
    <nav class="region-nav city-subnav" aria-label="依區域瀏覽遊記">${regions.map((region) => `<a class="region-switch ${region.slug === activeRegion.slug ? 'active' : ''}" href="${pageUrl('pages/stories.html', { region: region.slug }, 'stories')}"><b>${escapeHtml(region.name)}</b><small>${escapeHtml(region.english_name)}</small><span>${escapeHtml(region.journal.label)}</span></a>`).join('')}</nav>
    <section class="stories" id="stories"><header class="section-heading"><div><p class="kicker">${escapeHtml(activeRegion.english_name)} STORIES</p><h2><span>${escapeHtml(activeRegion.name)}</span>${escapeHtml(site.journal.heading_suffix)}</h2></div><p>${escapeHtml(activeRegion.journal.intro)}</p></header><div class="story-filter-bar"><div class="district-filter-form"><label for="district-filter">AREA FILTER</label><span class="district-select-wrap"><select id="district-filter"><option value="">全部行政區</option>${districts.map((district) => `<option value="${escapeHtml(district)}" ${district === activeDistrict ? 'selected' : ''}>${escapeHtml(district)}</option>`).join('')}</select></span></div></div><div class="story-grid" id="story-grid" aria-live="polite"></div></section>
  </main>${publicFooter(site, { journal: true })}${new URLSearchParams(location.search).get('preview') === '1' ? '<span class="preview-banner">草稿預覽</span>' : ''}`;
  initializePublicUi();
  initializeStories(regionStories, activeDistrict);
};

const initializeStories = (allStories, initialDistrict) => {
  let stories = allStories;
  let slide = 0;
  let timer;
  const track = document.querySelector('#hero-track');
  const dots = document.querySelector('#hero-dots');
  const grid = document.querySelector('#story-grid');
  const renderCards = () => {
    grid.innerHTML = stories.length ? stories.map((story, index) => `<article class="story-card"><a class="card-image" href="${pageUrl('pages/story.html', { story: story.slug })}"><img src="${assetUrl(story.cover_image)}" alt="${escapeHtml(story.title)}" loading="lazy"><span class="card-number">${String(index + 1).padStart(2, '0')}</span></a><div class="card-body"><div class="card-meta"><span>${escapeHtml(story.category)}</span><span>${escapeHtml(story.reading_time)}</span></div><h3>${escapeHtml(story.title)}</h3><p>${escapeHtml(story.excerpt)}</p><div class="story-district-tags" aria-label="遊記經過的行政區">${(story.administrative_districts || []).map((district) => `<span>${escapeHtml(district)}</span>`).join('')}</div><a class="card-link" href="${pageUrl('pages/story.html', { story: story.slug })}">閱讀遊記 →</a></div></article>`).join('') : '<p class="story-empty">目前沒有符合這個行政區的公開遊記。</p>';
  };
  const show = (index) => {
    if (!stories.length) return;
    slide = (index + stories.length) % stories.length;
    track.querySelectorAll('.hero-slide').forEach((item, position) => { item.classList.toggle('active', position === slide); item.setAttribute('aria-hidden', String(position !== slide)); item.tabIndex = position === slide ? 0 : -1; });
    dots.querySelectorAll('button').forEach((item, position) => item.classList.toggle('active', position === slide));
    document.querySelector('#hero-current').textContent = String(slide + 1).padStart(2, '0');
    document.querySelector('#hero-title').textContent = stories[slide].title;
    document.querySelector('#hero-desc').textContent = stories[slide].excerpt;
  };
  const renderHero = () => {
    track.innerHTML = stories.map((story, index) => `<a class="hero-slide city-hero-slide ${index === 0 ? 'active' : ''}" href="${pageUrl('pages/story.html', { story: story.slug })}" style="background-image:url('${assetUrl(story.cover_image)}')" aria-label="閱讀遊記：${escapeHtml(story.title)}"></a>`).join('');
    dots.innerHTML = stories.map((_, index) => `<button type="button" data-slide="${index}" aria-label="第 ${index + 1} 張"></button>`).join('');
    document.querySelector('#hero-total').textContent = String(stories.length).padStart(2, '0');
    show(0);
  };
  const restart = () => { clearInterval(timer); if (stories.length > 1) timer = setInterval(() => show(slide + 1), 5500); };
  const applyFilter = (district) => {
    stories = district ? allStories.filter((story) => (story.administrative_districts || []).includes(district)) : allStories;
    renderCards(); renderHero(); restart();
    const url = new URL(location.href); district ? url.searchParams.set('district', district) : url.searchParams.delete('district'); history.replaceState({}, '', url);
  };
  document.querySelector('#district-filter').addEventListener('change', (event) => applyFilter(event.target.value));
  document.querySelector('#hero-prev').addEventListener('click', () => { show(slide - 1); restart(); });
  document.querySelector('#hero-next').addEventListener('click', () => { show(slide + 1); restart(); });
  dots.addEventListener('click', (event) => { if (event.target.dataset.slide !== undefined) { show(Number(event.target.dataset.slide)); restart(); } });
  applyFilter(initialDistrict);
};

render().catch(showPageError);
