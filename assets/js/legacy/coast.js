const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

const updateHeader = () => header?.classList.toggle('scrolled', scrollY > 100);
updateHeader();
addEventListener('scroll', updateHeader, { passive: true });

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach(item => item.classList.add('visible'));
}

const slides = [...document.querySelectorAll('.city-hero-slide')];
const dotsWrap = document.querySelector('.city-carousel-dots');
let current = 0;
let carouselTimer;
if (slides.length && dotsWrap) {
  slides.forEach((slide, index) => {
    slide.id = `coast-slide-${index + 1}`;
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `顯示第 ${index + 1} 張海線照片`);
    dot.setAttribute('aria-controls', slide.id);
    dot.setAttribute('aria-selected', 'false');
    dot.tabIndex = -1;
    dot.addEventListener('click', () => showSlide(index, true));
    dot.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + slides.length) % slides.length;
      dots[next].focus();
      showSlide(next, true);
    });
    dotsWrap.append(dot);
  });
  const dots = [...dotsWrap.children];
  const restartCarousel = () => {
    clearInterval(carouselTimer);
    if (!reducedMotion) carouselTimer = setInterval(() => showSlide(current + 1), 5500);
  };
  function showSlide(index, user = false) {
    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');
    dots[current].tabIndex = -1;
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
    dots[current].tabIndex = 0;
    if (user) restartCarousel();
  }
  showSlide(0);
  restartCarousel();
  document.querySelector('.city-prev')?.addEventListener('click', () => showSlide(current - 1, true));
  document.querySelector('.city-next')?.addEventListener('click', () => showSlide(current + 1, true));
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(carouselTimer) : restartCarousel());
}

const parallaxPhotos = [...document.querySelectorAll('[data-parallax]')];
if (parallaxPhotos.length && !reducedMotion) {
  let ticking = false;
  const updateParallax = () => {
    const mobileFactor = innerWidth <= 560 ? .3 : (innerWidth <= 900 ? .65 : 1);
    parallaxPhotos.forEach(photo => {
      const rect = photo.getBoundingClientRect();
      const distance = rect.top + rect.height / 2 - innerHeight / 2;
      const offset = Math.max(-24, Math.min(24, distance * Number(photo.dataset.parallax) * mobileFactor));
      const media = photo.querySelector('.mosaic-media');
      if (media) media.style.transform = `translate3d(0,${offset}px,0)`;
    });
    ticking = false;
  };
  updateParallax();
  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }, { passive: true });
  addEventListener('resize', updateParallax, { passive: true });
}

const routePlans = {
  day: {
    eyebrow: 'ONE DAY JOURNEY',
    title: '海線一日，<br>追著夕陽前進。',
    description: '從大甲信仰小鎮出發，沿海岸一路走到高美濕地，把香火、海味與夕照排進同一天。',
    meta: ['大眾運輸＋步行', '約 10 小時'],
    stops: [
      ['09:00', 'FAITH', '大甲鎮瀾宮', '從百年廟宇與蔣公路商圈開始，感受小鎮晨間節奏。'],
      ['11:30', 'OLD TOWN', '清水老街・眷村園區', '走訪老街與歷史空間，品嚐一碗在地米糕。'],
      ['14:00', 'HARBOR', '梧棲觀光漁港', '逛漁市、嚐海鮮，到港邊吹一會兒海風。'],
      ['16:30', 'SUNSET', '高美濕地', '依潮汐安排木棧道散步，等待夕陽染亮潮間帶。'],
      ['19:00', 'NIGHT', '沙鹿商圈', '以肉圓仔湯與街邊小吃，為向海的一天收尾。']
    ]
  },
  'two-days': {
    eyebrow: 'TWO DAYS JOURNEY',
    title: '兩天一夜，<br>讀懂海岸與小鎮。',
    description: '第一天沿北海線感受信仰與田野，第二天從港灣走向濕地，讓旅程保留更多停留。',
    meta: ['鐵道＋公車＋步行', '2 天 1 夜'],
    stops: [
      ['09:00', 'FAITH', '大甲鎮瀾宮・蔣公路', 'DAY 1｜參拜後逛商圈，嚐糕餅與小吃。', 'DAY 1'],
      ['13:30', 'COUNTRYSIDE', '外埔忘憂谷', 'DAY 1｜沿田間小路散步，欣賞季節農村風景。'],
      ['16:00', 'SEASIDE', '大安濱海樂園', 'DAY 1｜到海邊散步看晚霞，可依行程安排濱海住宿。'],
      ['09:30', 'ART', '港區藝術中心', 'DAY 2｜從展覽與園林建築開始清水藝文散策。', 'DAY 2'],
      ['12:30', 'HARBOR', '梧棲觀光漁港', 'DAY 2｜在漁市享用海鮮午餐，沿港邊走走。'],
      ['15:00', 'OCEAN', '台中海洋館', 'DAY 2｜認識臺中河川與海洋生態，留意預約與開放資訊。'],
      ['17:30', 'SUNSET', '高美濕地', 'DAY 2｜以潮間帶夕陽為兩天旅程收尾。']
    ]
  },
  bike: {
    eyebrow: 'CYCLING JOURNEY',
    title: '迎風踩踏，<br>沿著港灣去旅行。',
    description: '以清水與梧棲為核心，串連文化園區、港區與濱海景觀；請依體力與風勢調整路線。',
    meta: ['自行車', '約 22–28 公里'],
    stops: [
      ['08:30', 'START', '清水車站', '檢查車況與補給，從海線鐵道小鎮出發。'],
      ['09:00', 'HERITAGE', '清水眷村文化園區', '在老屋與展覽空間停留，閱讀眷村生活記憶。'],
      ['10:30', 'ART', '港區藝術中心', '穿過林蔭與園區，安排一段藝文休息。'],
      ['12:30', 'HARBOR', '梧棲觀光漁港', '享用海鮮午餐，補充午後騎行體力。'],
      ['15:30', 'COAST', '高美濕地周邊', '沿海岸迎風前進，在遊客中心附近停車步行。'],
      ['17:30', 'RETURN', '清水市區', '依日落時間與天候提早返程，避免夜間濱海騎行。']
    ]
  },
  drive: {
    eyebrow: 'ROAD TRIP',
    title: '一路向海，<br>收藏八區風景。',
    description: '自駕串連較分散的北海線景點，從大甲信仰、外埔田野一路走到港灣與濕地夕照。',
    meta: ['自駕', '約 55 公里・10 小時'],
    stops: [
      ['08:30', 'FAITH', '大甲鎮瀾宮', '早晨參拜並逛蔣公路商圈，避開午後人潮。'],
      ['10:30', 'HILLS', '鐵砧山風景特定區', '登高散步，從綠意與歷史遺跡認識大甲。'],
      ['12:30', 'COUNTRYSIDE', '外埔忘憂谷', '沿田野短暫停留，拍下季節限定的稻田景色。'],
      ['14:30', 'HARBOR', '梧棲觀光漁港', '吃海鮮、逛漁市，再到港區吹風。'],
      ['17:00', 'SUNSET', '高美濕地', '預留停車與步行時間，依潮汐欣賞濕地夕陽。'],
      ['19:30', 'NIGHT', '沙鹿商圈', '以在地小吃結束行程，再從容返家。']
    ]
  }
};

const routeTabs = [...document.querySelectorAll('.route-tab')];
const routeLine = document.querySelector('.route-line');
const routeIntro = document.querySelector('.route-intro');
const routePanel = document.querySelector('#route-panel');
let switchTimer;

const renderRoute = key => {
  const plan = routePlans[key];
  if (!plan || !routeLine || !routeIntro) return;
  clearTimeout(switchTimer);
  routeLine.classList.add('switching');
  switchTimer = setTimeout(() => {
    routeIntro.querySelector('.eyebrow').textContent = plan.eyebrow;
    routeIntro.querySelector('h2').innerHTML = plan.title;
    routeIntro.querySelector(':scope > p:last-of-type').textContent = plan.description;
    routeIntro.querySelector('.route-meta').innerHTML = plan.meta.map(item => `<span>${item}</span>`).join('');
    routeLine.innerHTML = plan.stops.map(stop => `<li${stop[4] ? ` data-day="${stop[4]}"` : ''}>${stop[4] ? `<span class="route-day">${stop[4]}</span>` : ''}<time>${stop[0]}</time><div><small>${stop[1]}</small><h3>${stop[2]}</h3><p>${stop[3]}</p></div></li>`).join('');
    routeLine.classList.remove('switching');
  }, 180);
};

routeTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    routeTabs.forEach(item => {
      item.classList.remove('active');
      item.setAttribute('aria-selected', 'false');
      item.tabIndex = -1;
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.tabIndex = 0;
    routePanel?.setAttribute('aria-labelledby', tab.id);
    renderRoute(tab.dataset.route);
  });
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + routeTabs.length) % routeTabs.length;
    routeTabs[next].focus();
    routeTabs[next].click();
  });
});
