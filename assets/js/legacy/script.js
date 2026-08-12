const slides = [...document.querySelectorAll('.hero-slide')];
const dotsWrap = document.querySelector('.carousel-dots');
let current = 0, timer;
slides.forEach((_, i) => { const b = document.createElement('button'); b.setAttribute('role', 'tab'); b.setAttribute('aria-label', `顯示第 ${i + 1} 張照片`); b.addEventListener('click', () => showSlide(i, true)); dotsWrap.append(b) });
const dots = [...dotsWrap.children];
function showSlide(i, user = false) { slides[current].classList.remove('active'); slides[current].setAttribute('aria-hidden', 'true'); dots[current].classList.remove('active'); current = (i + slides.length) % slides.length; slides[current].classList.add('active'); slides[current].setAttribute('aria-hidden', 'false'); dots[current].classList.add('active'); if (user) restart() }
function restart() { clearInterval(timer); timer = setInterval(() => showSlide(current + 1), 5500) }
dots[0].classList.add('active');
requestAnimationFrame(() => {
  slides[0].classList.add('active');
  restart();
});
document.querySelector('.prev').addEventListener('click', () => showSlide(current - 1, true));
document.querySelector('.next').addEventListener('click', () => showSlide(current + 1, true));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearInterval(timer);
  else restart();
});

const travelJournal = document.querySelector('.travel-journal');
const heroSection = document.querySelector('.hero');
const syncTravelJournal = () => {
  const heroEnd = heroSection.offsetTop + heroSection.offsetHeight;
  travelJournal.classList.toggle('is-visible', scrollY >= heroEnd);
};
syncTravelJournal();
window.addEventListener('scroll', syncTravelJournal, { passive: true });
window.addEventListener('resize', syncTravelJournal);

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', open) });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false') }));

const revealObserver = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target) } }), { threshold: .16 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const stat = document.querySelector('[data-count]'); let counted = false;
const countObserver = new IntersectionObserver(([e]) => { if (!e.isIntersecting || counted) return; counted = true; const end = +stat.dataset.count, suffix = stat.dataset.suffix ?? '+', start = performance.now(), duration = 1600; const tick = now => { const p = Math.min((now - start) / duration, 1), ease = 1 - Math.pow(1 - p, 3); stat.textContent = Math.floor(end * ease).toLocaleString() + suffix; if (p < 1) requestAnimationFrame(tick) }; requestAnimationFrame(tick) }, { threshold: .6 }); countObserver.observe(stat);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
header.classList.toggle('scrolled', scrollY > 100);
if (!reduced) { let ticking = false; window.addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { const y = scrollY; header.classList.toggle('scrolled', y > 100); document.querySelectorAll('.parallax').forEach(el => { const r = el.getBoundingClientRect(), speed = +el.dataset.speed || .08; if (r.bottom > 0 && r.top < innerHeight) el.style.transform = `translate3d(0,${(r.top - innerHeight / 2) * speed}px,0)` }); ticking = false }) }, { passive: true }) } else { window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 100), { passive: true }) }

const modal = document.querySelector('.video-modal');
const modalVideo = document.querySelector('.modal-video');
const openModalVideo = () => {
  modal.showModal();
  modalVideo.play().catch(() => { });
};
const closeModalVideo = () => {
  modalVideo.pause();
  modal.close();
};
document.querySelector('.video-btn').addEventListener('click', openModalVideo);
document.querySelector('.modal-close').addEventListener('click', closeModalVideo);
modal.addEventListener('click', e => { if (e.target === modal) closeModalVideo() });
modal.addEventListener('cancel', () => modalVideo.pause());

// Latest current events synchronized by the Laravel API.
const latestNews = document.querySelector('#latest-news');
if (latestNews) {
  const renderNewsArticle = (article) => {
    const link = document.createElement('a');
    const date = document.createElement('time');
    const tag = document.createElement('span');
    const title = document.createElement('b');
    const arrow = document.createElement('i');

    link.href = article.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${article.title}（前往臺中觀光旅遊網）`);

    date.dateTime = article.updated_at;
    date.textContent = article.updated_at.replaceAll('-', '.');
    tag.className = 'tag';
    tag.textContent = article.category;
    title.textContent = article.title;
    arrow.textContent = '↗';

    link.append(date, tag, title, arrow);
    return link;
  };

  fetch('http://127.0.0.1:8000/api/news', {
    headers: { Accept: 'application/json' }
  })
    .then(response => {
      if (!response.ok) throw new Error(`API 回應 ${response.status}`);
      return response.json();
    })
    .then(({ data }) => {
      if (!Array.isArray(data) || data.length === 0) return;

      latestNews.querySelectorAll(':scope > a').forEach(item => item.remove());
      const moreRow = latestNews.querySelector('.news-more-row');
      data.forEach(article => latestNews.insertBefore(renderNewsArticle(article), moreRow));
    })
    .catch(error => {
      console.warn('無法載入最新活動，暫時顯示預設內容。', error);
    });
}

// Featured destination video playlist.
const featuredVideo = document.querySelector('#featured-video');
if (featuredVideo) {
  const featuredPlaylist = [
    {
      src: 'images/台中縮時 _ 高美濕地即時影像縮時攝影_精選片段.mp4',
      title: '高美濕地',
      subtitle: 'GAOMEI WETLANDS · WHERE LAND MEETS THE SEA',
      objectPosition: '50% 50%'
    },
    {
      src: 'images/【參山美景】攬勝樓啞口.mp4',
      title: '攬勝樓',
      subtitle: 'LISHAN RANGE ROVER BUILDING · WHERE MOUNTAINS MEET THE SEA OF CLOUDS',
      objectPosition: '50% 40%'
    },
    {
      src: 'images/台中即時影像 _ 望高寮夜景片段1.mp4',
      title: '望高寮',
      subtitle: 'WANGGAOLIAO · WHERE CITY LIGHTS MEET THE NIGHT',
      objectPosition: '50% 60%'
    }
  ];
  let featuredIndex = 0;
  const featuredTitle = document.querySelector('.featured-title');
  const featuredSubtitle = document.querySelector('.featured-subtitle');
  const renderFeatured = (item) => {
    featuredTitle.textContent = item.title;
    featuredSubtitle.textContent = item.subtitle;
    featuredVideo.style.objectPosition = item.objectPosition;
  };
  const playFeatured = (nextIndex) => {
    featuredIndex = (nextIndex + featuredPlaylist.length) % featuredPlaylist.length;
    const item = featuredPlaylist[featuredIndex];
    renderFeatured(item);
    featuredVideo.src = item.src;
    featuredVideo.load();
    featuredVideo.play().catch(() => { });
  };
  featuredVideo.addEventListener('ended', () => playFeatured(featuredIndex + 1));
  featuredVideo.addEventListener('error', () => playFeatured(featuredIndex + 1));
  document.querySelector('.featured-prev')?.addEventListener('click', () => playFeatured(featuredIndex - 1));
  document.querySelector('.featured-next')?.addEventListener('click', () => playFeatured(featuredIndex + 1));
  renderFeatured(featuredPlaylist[featuredIndex]);
}
