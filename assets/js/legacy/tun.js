const header=document.querySelector('.site-header'),toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}));
const updateHeader=()=>header?.classList.toggle('scrolled',scrollY>100);updateHeader();addEventListener('scroll',updateHeader,{passive:true});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reducedMotion&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(item=>observer.observe(item))}else document.querySelectorAll('.reveal').forEach(item=>item.classList.add('visible'));

const slides=[...document.querySelectorAll('.city-hero-slide')],dotsWrap=document.querySelector('.city-carousel-dots');let current=0,timer;
if(slides.length&&dotsWrap){
  slides.forEach((slide,index)=>{slide.id=`tun-slide-${index+1}`;const dot=document.createElement('button');dot.type='button';dot.setAttribute('role','tab');dot.setAttribute('aria-label',`顯示第 ${index+1} 張屯區照片`);dot.setAttribute('aria-controls',slide.id);dot.addEventListener('click',()=>showSlide(index,true));dotsWrap.append(dot)});
  const dots=[...dotsWrap.children],restart=()=>{clearInterval(timer);if(!reducedMotion)timer=setInterval(()=>showSlide(current+1),5500)};
  function showSlide(index,user=false){slides[current].classList.remove('active');slides[current].setAttribute('aria-hidden','true');dots[current].classList.remove('active');dots[current].setAttribute('aria-selected','false');current=(index+slides.length)%slides.length;slides[current].classList.add('active');slides[current].setAttribute('aria-hidden','false');dots[current].classList.add('active');dots[current].setAttribute('aria-selected','true');if(user)restart()}
  slides[0].classList.add('active');dots[0].classList.add('active');dots[0].setAttribute('aria-selected','true');restart();
  document.querySelector('.city-prev')?.addEventListener('click',()=>showSlide(current-1,true));document.querySelector('.city-next')?.addEventListener('click',()=>showSlide(current+1,true));document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):restart());
}

const parallaxPhotos=[...document.querySelectorAll('[data-parallax]')];
if(parallaxPhotos.length&&!reducedMotion){let ticking=false;const update=()=>{const factor=innerWidth<=560?.3:(innerWidth<=900?.65:1);parallaxPhotos.forEach(photo=>{const rect=photo.getBoundingClientRect(),distance=rect.top+rect.height/2-innerHeight/2,offset=Math.max(-24,Math.min(24,distance*Number(photo.dataset.parallax)*factor)),media=photo.querySelector('.mosaic-media');if(media)media.style.transform=`translate3d(0,${offset}px,0)`});ticking=false};update();addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update,{passive:true})}

const routePlans={
  day:{eyebrow:'ONE DAY JOURNEY',title:'屯區一日，<br>循著故事慢慢走。',description:'從霧峰歷史與藝術出發，午後轉進大里與太平綠地，感受屯區新舊交會。',meta:['自駕／包車','約 9 小時'],stops:[
    ['09:00','HERITAGE','霧峰林家宮保第園區','從傳統宅園與歷史展陳認識霧峰人文，建議事先確認導覽場次。'],
    ['11:30','CREATIVE','光復新村','逛老眷舍、文創店家與街角小景，並在周邊安排午餐。'],
    ['14:00','ART','亞洲大學現代美術館','欣賞清水模建築與當期展覽；週一通常休館，出發前請查詢公告。'],
    ['16:00','OLD STREET','大里老街','散步街區、尋找地方小吃，感受大里的生活節奏。'],
    ['17:30','GREEN','坪林森林公園','在大片草地與林蔭中放慢腳步，為一日行程輕鬆收尾。']
  ]},
  'two-days':{eyebrow:'TWO DAYS JOURNEY',title:'兩天四區，<br>慢慢讀懂屯區。',description:'第一天聚焦霧峰、大里的人文藝術；第二天走烏日圳道與太平山麓，減少往返。',meta:['自駕','2 天／每日約 8 小時'],stops:[
    ['09:00','HISTORY','霧峰林家宮保第','DAY 1｜上午走訪歷史宅園，為屯區旅程建立人文脈絡。','DAY 1'],
    ['11:30','VILLAGE','光復新村','DAY 1｜在老眷村吃午餐、逛店家，保留拍照與休息時間。'],
    ['14:00','MUSEUM','921地震教育園區','DAY 1｜透過斷層與校舍遺址理解土地記憶。'],
    ['16:00','ART','亞洲大學現代美術館','DAY 1｜以建築與藝術展覽結束第一天。'],
    ['09:00','WATERWAY','知高圳步道','DAY 2｜趁上午涼爽沿水圳散步，雨後注意路面。','DAY 2'],
    ['12:00','DALI','大里老街・午餐','DAY 2｜品嚐地方小吃，再前往太平。'],
    ['14:30','PARK','坪林森林公園','DAY 2｜安排草地野餐或親子活動。'],
    ['16:30','COUNTRYSIDE','頭汴坑休閒農業區','DAY 2｜沿山路看田園風景，依季節體驗採果或農遊。']
  ]},
  nature:{eyebrow:'NATURE JOURNEY',title:'靠近山野，<br>讓呼吸慢下來。',description:'以烏日水圳和太平山麓為主軸，適合喜歡步道、田野與季節農遊的旅人。',meta:['自駕＋步行','約 7–8 小時'],stops:[
    ['08:30','TRAIL','知高圳步道','沿圳道樹蔭散步，欣賞田野與鐵道風景。'],
    ['11:00','PICNIC','坪林森林公園','在大草原休息或野餐，親子旅客可多留一些時間。'],
    ['13:30','FARM','頭汴坑休閒農業區','循山路進入農村地景，依當季活動安排採果體驗。'],
    ['16:30','SCENERY','太平山麓慢行','傍晚沿山麓小旅行，遇天候不佳請提早下山。']
  ]},
  culture:{eyebrow:'CULTURE JOURNEY',title:'一日人文，<br>從古宅走到當代。',description:'把霧峰最具代表性的歷史、眷村、教育與現代藝術場域串成一條文化路線。',meta:['自駕／計程車','約 8 小時'],stops:[
    ['09:00','HERITAGE','霧峰林家宮保第園區','細看傳統宅園的空間格局、木雕與彩繪。'],
    ['11:30','VILLAGE','光復新村','在老眷村聚落午餐，逛青年創業店家。'],
    ['13:30','MEMORY','921地震教育園區','從真實遺址理解地震、防災與重建。'],
    ['16:00','MODERN ART','亞洲大學現代美術館','在安藤忠雄建築與當代展覽之間結束旅程。']
  ]}
};
const tabs=[...document.querySelectorAll('.route-tab')],line=document.querySelector('.route-line'),intro=document.querySelector('.route-intro'),panel=document.querySelector('#route-panel');let switchTimer;
const renderRoute=key=>{const plan=routePlans[key];if(!plan||!line||!intro)return;clearTimeout(switchTimer);line.classList.add('switching');switchTimer=setTimeout(()=>{intro.querySelector('.eyebrow').textContent=plan.eyebrow;intro.querySelector('h2').innerHTML=plan.title;intro.querySelector(':scope>p:last-of-type').textContent=plan.description;intro.querySelector('.route-meta').innerHTML=plan.meta.map(item=>`<span>${item}</span>`).join('');line.innerHTML=plan.stops.map(stop=>`<li${stop[4]?` data-day="${stop[4]}"`:''}>${stop[4]?`<span class="route-day">${stop[4]}</span>`:''}<time>${stop[0]}</time><div><small>${stop[1]}</small><h3>${stop[2]}</h3><p>${stop[3]}</p></div></li>`).join('');line.classList.remove('switching')},180)};
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>{tabs.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-selected','false');item.tabIndex=-1});tab.classList.add('active');tab.setAttribute('aria-selected','true');tab.tabIndex=0;panel?.setAttribute('aria-labelledby',tab.id);renderRoute(tab.dataset.route)});tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click()})});
renderRoute('day');
