import { assetUrl, escapeHtml, lineBreaks, loadData, pageUrl } from './data-store.js';
import { initializePublicUi, publicFooter, publicHeader, showPageError } from './public-ui.js?v=20260812-2';

const app = document.querySelector('#app');

const render = async () => {
  const [site, allRegions, allNews] = await Promise.all([
    loadData('site'), loadData('regions'), loadData('news'),
  ]);
  const regions = allRegions.filter((region) => region.is_published !== false).sort((a, b) => a.sort_order - b.sort_order);
  const news = allNews.filter((article) => article.is_current !== false)
    .sort((a, b) => String(b.source_updated_at).localeCompare(String(a.source_updated_at))).slice(0, 4);
  const playlist = site.featured.playlist || [];
  const firstVideo = playlist[0] || {};
  document.title = site.page.title;
  document.querySelector('meta[name="description"]').content = site.page.description;

  app.innerHTML = `${publicHeader(site)}
    <a class="travel-journal" href="${pageUrl('pages/stories.html')}" aria-label="開啟旅人手記">
      <span class="journal-book" aria-hidden="true"><span class="journal-pages"><b>${escapeHtml(site.journal.label)}</b><i>${escapeHtml(site.journal.action)}</i></span><span class="journal-cover"><span class="journal-string"></span><span class="journal-knot"></span></span></span>
    </a>
    <main>
      <section class="hero" aria-label="臺中風景照片輪播">
        <div class="hero-track">${site.hero.slides.map((slide, index) => `<article class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image:url('${assetUrl(slide.image)}')" aria-hidden="${index !== 0}"><span class="sr-only">${escapeHtml(slide.alt)}</span></article>`).join('')}</div>
        <div class="hero-shade"></div>
        <div class="hero-copy"><p class="japanese">${escapeHtml(site.hero.japanese)}</p><p class="micro">${escapeHtml(site.hero.micro)}</p><div class="hero-actions"><a class="button primary" href="#regions">${escapeHtml(site.hero.primary_label)}</a><button class="button ghost video-btn" type="button"><span class="play">▶</span> ${escapeHtml(site.hero.video_label)}</button></div></div>
        <div class="carousel-controls"><button class="carousel-arrow prev" aria-label="上一張照片">←</button><div class="carousel-dots" role="tablist" aria-label="選擇照片"></div><button class="carousel-arrow next" aria-label="下一張照片">→</button></div>
        <a class="scroll-cue" href="#about"><span>SCROLL</span><i></i></a>
      </section>
      <nav class="region-jump" aria-label="快速選擇區域">${regions.map((region) => `<a href="${pageUrl('pages/region.html', { region: region.slug })}"><b>${escapeHtml(region.name)}</b><small>${escapeHtml(region.english_name)}</small><span>${escapeHtml(region.home.jump_label || region.home.tagline)}</span></a>`).join('')}</nav>
      <section class="about section" id="about">
        <div class="about-copy reveal"><p class="eyebrow">${escapeHtml(site.about.eyebrow)}</p><h2>${lineBreaks(site.about.title)}</h2><p>${escapeHtml(site.about.body)}</p><p class="en-copy">${escapeHtml(site.about.body_en)}</p><a class="text-link" href="#regions">${escapeHtml(site.about.link_label)} <span>→</span></a></div>
        <div class="about-visual reveal parallax"><img src="${assetUrl(site.about.image)}" alt="${escapeHtml(site.about.image_alt)}" loading="lazy"><div class="stat-card"><small>${escapeHtml(site.about.stat_label)}</small><strong data-count="${Number(site.about.stat_count) || 0}" data-suffix="${escapeHtml(site.about.stat_suffix)}">0</strong><span>${escapeHtml(site.about.stat_caption)}</span></div></div>
      </section>
      <section class="regions section" id="regions">
        <div class="section-heading reveal"><div><p class="eyebrow">${escapeHtml(site.regions.eyebrow)}</p><h2>${escapeHtml(site.regions.title)}</h2></div><a class="text-link" href="${escapeHtml(site.regions.more_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(site.regions.more_label)} <span>→</span></a></div>
        <div class="region-grid">${regions.map((region) => `<a class="region-card reveal" id="${escapeHtml(region.slug)}" href="${pageUrl('pages/region.html', { region: region.slug })}"><img src="${assetUrl(region.home.card_image)}" alt="${escapeHtml(region.home.card_alt)}" loading="lazy"><div class="card-overlay"><small>${escapeHtml(region.english_name)}</small><h3>${escapeHtml(region.name)}</h3><span>${escapeHtml(region.home.tagline)}</span></div><p>${escapeHtml(region.home.intro)}</p></a>`).join('')}</div>
      </section>
      ${playlist.length ? `<section class="featured" id="featured"><video class="featured-video" id="featured-video" autoplay muted playsinline preload="metadata" poster="${assetUrl(site.featured.poster)}" aria-hidden="true"><source src="${assetUrl(firstVideo.src)}" type="video/mp4"></video><div class="featured-shade"></div><button class="featured-arrow featured-prev" type="button" aria-label="播放上一段影片">←</button><button class="featured-arrow featured-next" type="button" aria-label="播放下一段影片">→</button><div class="featured-copy reveal" aria-live="polite"><h2 class="featured-title">${escapeHtml(firstVideo.title)}</h2><span class="featured-subtitle">${escapeHtml(firstVideo.subtitle)}</span></div></section>` : ''}
      <section class="news section" id="news"><div class="news-intro reveal"><p class="eyebrow">${escapeHtml(site.news.eyebrow)}</p><h2>${escapeHtml(site.news.title)}</h2><p>${escapeHtml(site.news.intro)}</p></div><div class="news-list reveal" id="latest-news" aria-live="polite">${news.length ? news.map((article) => `<a href="${escapeHtml(article.source_url)}" target="_blank" rel="noopener noreferrer"><time datetime="${escapeHtml(article.source_updated_at)}">${escapeHtml(article.source_updated_at.replaceAll('-', '.'))}</time><span class="tag">${escapeHtml(article.category)}</span><b>${escapeHtml(article.title)}</b><i>↗</i></a>`).join('') : '<p>目前沒有公開消息。</p>'}<div class="news-more-row"><a class="news-more" href="${escapeHtml(site.news.more_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(site.news.more_label)}</a></div></div></section>
    </main>
    <dialog class="video-modal" aria-labelledby="modal-video-title"><button class="modal-close" aria-label="關閉">×</button><h2 class="sr-only" id="modal-video-title">${escapeHtml(site.modal.title)}</h2><video class="modal-video" controls muted playsinline preload="metadata" poster="${assetUrl(site.modal.poster)}"><source src="${assetUrl(site.modal.video)}" type="video/mp4"></video></dialog>
    ${publicFooter(site)}
    ${new URLSearchParams(location.search).get('preview') === '1' ? '<span class="preview-banner">草稿預覽</span>' : ''}`;

  initializePublicUi();
  initializeHome(site);
};

const initializeHome = (site) => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = document.querySelector('.carousel-dots');
  let current = 0;
  let timer;
  dots.innerHTML = slides.map((_, index) => `<button type="button" data-slide="${index}" aria-label="第 ${index + 1} 張"></button>`).join('');
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.classList.toggle('active', position === current);
      slide.setAttribute('aria-hidden', String(position !== current));
    });
    dots.querySelectorAll('button').forEach((dot, position) => dot.classList.toggle('active', position === current));
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => show(current + 1), 5500); };
  document.querySelector('.carousel-arrow.prev')?.addEventListener('click', () => { show(current - 1); start(); });
  document.querySelector('.carousel-arrow.next')?.addEventListener('click', () => { show(current + 1); start(); });
  dots.addEventListener('click', (event) => { if (event.target.dataset.slide !== undefined) { show(Number(event.target.dataset.slide)); start(); } });
  if (slides.length) { show(0); start(); }

  const stat = document.querySelector('[data-count]');
  if (stat) stat.textContent = `${Number(stat.dataset.count).toLocaleString('zh-TW')}${stat.dataset.suffix || ''}`;

  const playlist = site.featured.playlist || [];
  const video = document.querySelector('#featured-video');
  let videoIndex = 0;
  const changeVideo = (direction) => {
    if (!video || !playlist.length) return;
    videoIndex = (videoIndex + direction + playlist.length) % playlist.length;
    const item = playlist[videoIndex];
    video.src = assetUrl(item.src);
    video.style.objectPosition = item.object_position || '50% 50%';
    document.querySelector('.featured-title').textContent = item.title;
    document.querySelector('.featured-subtitle').textContent = item.subtitle;
    video.play().catch(() => {});
  };
  document.querySelector('.featured-prev')?.addEventListener('click', () => changeVideo(-1));
  document.querySelector('.featured-next')?.addEventListener('click', () => changeVideo(1));
  video?.addEventListener('ended', () => changeVideo(1));

  const modal = document.querySelector('.video-modal');
  const modalVideo = modal?.querySelector('video');
  document.querySelector('.video-btn')?.addEventListener('click', () => { modal?.showModal(); modalVideo?.play().catch(() => {}); });
  modal?.querySelector('.modal-close')?.addEventListener('click', () => { modalVideo?.pause(); modal.close(); });
  modal?.addEventListener('click', (event) => { if (event.target === modal) { modalVideo?.pause(); modal.close(); } });
};

render().catch(showPageError);
