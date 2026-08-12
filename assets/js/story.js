import { assetUrl, escapeHtml, loadData, pageUrl, query, siteUrl } from './data-store.js';
import { showPageError } from './public-ui.js';

const app = document.querySelector('#app');

const render = async () => {
  const [site, regions, stories] = await Promise.all([loadData('site'), loadData('regions'), loadData('stories')]);
  const story = stories.find((item) => item.slug === query('story') && item.is_published !== false);
  if (!story) throw new Error('找不到這篇遊記，可能已下架或網址不正確。');
  const region = regions.find((item) => item.slug === story.region);
  const siblings = stories.filter((item) => item.region === story.region && item.is_published !== false).sort((a, b) => a.sort_order - b.sort_order);
  const index = siblings.indexOf(story);
  const previous = siblings[(index - 1 + siblings.length) % siblings.length];
  const next = siblings[(index + 1) % siblings.length];
  document.title = `${story.title}｜${region.name}旅行手記｜臺中好地 Fun`;
  document.querySelector('meta[name="description"]').content = story.excerpt;
  app.innerHTML = `<header class="note-header"><a class="brand" href="${siteUrl('index.html')}" aria-label="臺中好地 Fun 首頁"><img src="${assetUrl(site.site.logo)}" alt="臺中好地 Fun"></a><nav class="note-header-links" aria-label="遊記導覽"><a class="back-link" href="${pageUrl('pages/region.html', { region: region.slug }, 'guide')}">← 回到${escapeHtml(region.name)}靈感</a><a class="back-link" href="${pageUrl('pages/stories.html', { region: region.slug })}">查看旅人手記</a></nav></header>
    <main><article><header class="note-hero"><img id="story-image" src="${assetUrl(story.cover_image)}" alt="${escapeHtml(story.title)}"><div class="note-hero-shade"></div><div class="note-hero-copy"><p class="eyebrow">${escapeHtml(region.slug.toUpperCase())} JOURNAL · <span>${String(story.sort_order).padStart(2, '0')}</span></p><div class="note-district-tags" aria-label="遊記經過的行政區">${(story.administrative_districts || []).map((district) => `<span>${escapeHtml(district)}</span>`).join('')}</div><h1>${escapeHtml(story.title)}</h1><p>${escapeHtml(story.subtitle)}</p></div></header><div class="note-layout"><aside class="note-meta"><p><small>TRAVEL DATE</small><span>${escapeHtml(story.travel_season || '')}</span></p><p><small>DURATION</small><span>${escapeHtml(story.duration || '')}</span></p><p><small>MOOD</small><span>${escapeHtml(story.mood || '')}</span></p></aside><div class="note-content"><p class="note-lead">${escapeHtml(story.lead || '')}</p><h2>${escapeHtml(story.heading_one || '')}</h2><p>${escapeHtml(story.body_one || '')}</p>${story.detail_image ? `<figure><img src="${assetUrl(story.detail_image)}" alt="${escapeHtml(story.image_caption || story.title)}"><figcaption>${escapeHtml(story.image_caption || '')}</figcaption></figure>` : ''}<h2>${escapeHtml(story.heading_two || '')}</h2><p>${escapeHtml(story.body_two || '')}</p>${story.quote ? `<blockquote>${escapeHtml(story.quote)}</blockquote>` : ''}${story.tip ? `<div class="note-tip"><small>TRAVEL NOTE</small><p>${escapeHtml(story.tip)}</p></div>` : ''}</div></div></article><nav class="note-next" aria-label="其他旅行手記"><a href="${pageUrl('pages/story.html', { story: previous.slug })}"><small>PREVIOUS STORY</small><span>← ${escapeHtml(previous.title)}</span></a><a href="${pageUrl('pages/story.html', { story: next.slug })}"><small>NEXT STORY</small><span>${escapeHtml(next.title)} →</span></a></nav></main>
    <footer class="note-footer"><a class="note-footer-logo" href="${siteUrl('index.html')}"><img src="${assetUrl(site.site.logo)}" alt="臺中好地 Fun"></a><div class="note-footer-explore"><p class="note-footer-heading">查閱更多靈感</p><nav>${regions.filter((item) => item.is_published !== false).map((item) => `<a href="${pageUrl('pages/stories.html', { region: item.slug }, 'stories')}">${escapeHtml(item.name)}</a>`).join('')}</nav></div><p class="note-footer-copyright">${escapeHtml(site.site.copyright)}</p></footer>${new URLSearchParams(location.search).get('preview') === '1' ? '<span class="preview-banner">草稿預覽</span>' : ''}`;

  const noteHeader = document.querySelector('.note-header');
  const updateNoteHeader = () => noteHeader?.classList.toggle('scrolled', scrollY > 100);
  updateNoteHeader();
  addEventListener('scroll', updateNoteHeader, { passive: true });
};

render().catch(showPageError);
