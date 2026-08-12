import { assetUrl, escapeHtml, pageUrl, siteUrl } from './data-store.js';

export const publicHeader = (site, options = {}) => {
  const home = siteUrl('index.html');
  const links = options.region
    ? `<a href="#story">${escapeHtml(options.region.name)}印象</a><a href="#guide">旅行攻略</a><a href="#spots">必遊景點</a><a href="#flavors">地方風味</a><a href="#route">推薦遊程</a>`
    : `<a href="${home}#about">${escapeHtml(site.site.nav_about)}</a><a href="${home}#regions">${escapeHtml(site.site.nav_regions)}</a><a href="${home}#featured">${escapeHtml(site.site.nav_featured)}</a><a href="${home}#news">${escapeHtml(site.site.nav_news)}</a>`;
  return `<header class="site-header" id="top">
    <a class="brand" href="${home}" aria-label="回到首頁"><img src="${assetUrl(site.site.logo)}" alt="臺中好地 Fun"></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav"><span></span><span></span></button>
    <nav id="main-nav" aria-label="主要選單">${links}<a class="lang" href="${home}">HOME</a></nav>
  </header>`;
};

export const publicFooter = (site) => `<footer>
  <div><img src="${assetUrl(site.site.logo)}" alt="臺中好地 Fun"></div>
  <nav><a href="${siteUrl('index.html')}">回到首頁</a><a href="#top">返回頂端</a><a href="${pageUrl('admin/index.html')}">內容管理</a></nav>
  <p>${escapeHtml(site.site.copyright)}</p>
</footer>`;

export const initializePublicUi = () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  toggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(Boolean(open)));
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
  const updateHeader = () => header?.classList.toggle('scrolled', scrollY > 80);
  updateHeader();
  addEventListener('scroll', updateHeader, { passive: true });

  const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      reveal.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((item) => reveal.observe(item));
};

export const showPageError = (error) => {
  console.error(error);
  const root = document.querySelector('#app') || document.body;
  root.innerHTML = `<main class="static-error"><p class="eyebrow">DATA ERROR</p><h1>頁面資料無法載入</h1><p>${escapeHtml(error.message)}</p><p>請重新整理頁面；若在本機預覽，請確認已透過網站伺服器開啟，而不是直接雙擊 HTML 檔案。</p><p><a class="text-link" href="${siteUrl('index.html')}">返回首頁 →</a></p></main>`;
};
