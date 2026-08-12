const header=document.querySelector('.site-header'),toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}));
const updateHeader=()=>header?.classList.toggle('scrolled',scrollY>100);updateHeader();addEventListener('scroll',updateHeader,{passive:true});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reducedMotion&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(item=>observer.observe(item))}else{document.querySelectorAll('.reveal').forEach(item=>item.classList.add('visible'))}

const citySlides=[...document.querySelectorAll('.city-hero-slide')];
const cityDotsWrap=document.querySelector('.city-carousel-dots');
let cityCurrent=0,cityTimer;
if(citySlides.length&&cityDotsWrap){
  citySlides.forEach((slide,index)=>{slide.id=`city-slide-${index+1}`;const dot=document.createElement('button');dot.type='button';dot.setAttribute('role','tab');dot.setAttribute('aria-label',`顯示第 ${index+1} 張城區照片`);dot.setAttribute('aria-controls',slide.id);dot.setAttribute('aria-selected','false');dot.tabIndex=-1;dot.addEventListener('click',()=>showCitySlide(index,true));dot.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+citySlides.length)%citySlides.length;cityDots[next].focus();showCitySlide(next,true)});cityDotsWrap.append(dot)});
  const cityDots=[...cityDotsWrap.children];
  const restartCityCarousel=()=>{clearInterval(cityTimer);if(!reducedMotion)cityTimer=setInterval(()=>showCitySlide(cityCurrent+1),5500)};
  function showCitySlide(index,user=false){citySlides[cityCurrent].classList.remove('active');citySlides[cityCurrent].setAttribute('aria-hidden','true');cityDots[cityCurrent].classList.remove('active');cityDots[cityCurrent].setAttribute('aria-selected','false');cityDots[cityCurrent].tabIndex=-1;cityCurrent=(index+citySlides.length)%citySlides.length;citySlides[cityCurrent].classList.add('active');citySlides[cityCurrent].setAttribute('aria-hidden','false');cityDots[cityCurrent].classList.add('active');cityDots[cityCurrent].setAttribute('aria-selected','true');cityDots[cityCurrent].tabIndex=0;if(user)restartCityCarousel()}
  citySlides[0].classList.add('active');cityDots[0].classList.add('active');cityDots[0].setAttribute('aria-selected','true');cityDots[0].tabIndex=0;restartCityCarousel();
  document.querySelector('.city-prev')?.addEventListener('click',()=>showCitySlide(cityCurrent-1,true));
  document.querySelector('.city-next')?.addEventListener('click',()=>showCitySlide(cityCurrent+1,true));
  document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(cityTimer):restartCityCarousel());
}

const parallaxPhotos=[...document.querySelectorAll('[data-parallax]')];
if(parallaxPhotos.length&&!reducedMotion){
  let parallaxTicking=false;
  const updatePhotoParallax=()=>{
    const mobileFactor=innerWidth<=560?.3:(innerWidth<=900?.65:1);
    parallaxPhotos.forEach(photo=>{const rect=photo.getBoundingClientRect();const distance=rect.top+rect.height/2-innerHeight/2;const offset=Math.max(-24,Math.min(24,distance*Number(photo.dataset.parallax)*mobileFactor));const media=photo.querySelector('.mosaic-media');if(media)media.style.transform=`translate3d(0,${offset}px,0)`});
    parallaxTicking=false;
  };
  updatePhotoParallax();
  addEventListener('scroll',()=>{if(!parallaxTicking){parallaxTicking=true;requestAnimationFrame(updatePhotoParallax)}},{passive:true});
  addEventListener('resize',updatePhotoParallax,{passive:true});
}

const routePlans={
  day:{eyebrow:'ONE DAY JOURNEY',title:'城區一日，<br>剛剛好的相遇。',description:'以臺中車站為起點，步行搭配公車，把舊城、水岸、西區藝文與夜市串成一條順路行程。',meta:['大眾運輸＋步行','約 10 小時'],stops:[
    ['09:00','START','臺中車站・綠川','從舊站建築走到綠川水岸，先用一段輕鬆散步認識舊城入口。'],
    ['10:30','OLD TOWN','宮原眼科・第二市場','步行品嚐冰品，再到第二市場享用午餐；兩地之間約 15–20 分鐘腳程。'],
    ['13:30','ART WALK','國美館・審計新村','搭公車前往國美館，逛展後步行約 10 分鐘到審計新村。'],
    ['16:30','CITY GREEN','草悟道・PARK2','沿草悟道向北散步，在綠廊、選物店與咖啡空間之間休息。'],
    ['18:30','NIGHT','一中商圈','搭公車前往一中商圈，用豐仁冰、半月燒等小吃為旅程收尾。']
  ]},
  'two-days':{eyebrow:'TWO DAYS JOURNEY',title:'兩天慢遊，<br>讀懂城區新舊。',description:'第一天集中舊城與西區，第二天走北區、西屯；避免往返折返，也保留逛展與用餐時間。',meta:['公車＋捷運＋YouBike','2 天／每日約 8 小時'],stops:[
    ['09:00','OLD CITY','臺中車站・綠川・宮原眼科','DAY 1｜從車站周邊歷史建築與水岸開始，上午以步行探索舊城。','DAY 1'],
    ['11:30','LOCAL FOOD','第二市場','DAY 1｜在市場安排午餐，再沿柳川散步消化，前往西區。'],
    ['14:00','WEST DIST.','國美館・審計新村','DAY 1｜先逛國美館，再步行走訪審計新村與美術園道。'],
    ['17:00','GREEN WALK','草悟道・公益路','DAY 1｜沿綠廊散步，晚餐安排在公益路或勤美周邊。'],
    ['09:30','SCIENCE','科博館・植物園','DAY 2｜預留半天給展館與植物園，親子旅客可依興趣延長停留。','DAY 2'],
    ['13:30','LANDMARK','臺中國家歌劇院','DAY 2｜從市政府站轉乘公車或 YouBike，參觀曲牆空間及屋頂花園。'],
    ['16:30','SUNSET','秋紅谷','DAY 2｜由歌劇院步行約 15 分鐘抵達，休息並等待傍晚光線。'],
    ['18:30','NIGHT MARKET','逢甲夜市','DAY 2｜搭公車前往逢甲商圈，以夜市小吃結束兩日行程。']
  ]},
  bike:{eyebrow:'CYCLING JOURNEY',title:'騎進街區，<br>收藏城市細節。',description:'以公共自行車串接城中城人文自行車路線與西區綠廊；平坦路段為主，過路口請下車牽行。',meta:['YouBike／自備單車','約 16–20 km'],stops:[
    ['09:00','RENT','臺中車站借車','確認胎壓與座高，從車站沿綠空鐵道 1908 向南暖身。'],
    ['09:40','EAST DIST.','綠空鐵道・帝國製糖廠','沿鐵道綠廊騎到湧泉公園，園區內以牽車散步為主。'],
    ['11:30','OLD TOWN','第二市場午餐','回到中區停車用餐，市場周邊人流密集，建議使用鄰近租賃站還車再借。'],
    ['13:30','RIVER','柳川水岸','沿外圍道路騎行，水岸步道內依現場標示牽車，接續前往國美館。'],
    ['15:00','ART & GREEN','國美館・審計新村・草悟道','串接西區藝文景點；人行空間與市集區請下車牽行。'],
    ['17:30','RETURN','市民廣場周邊還車','於勤美周邊租賃站還車，晚餐可接續公益路或一中商圈。']
  ]},
  drive:{eyebrow:'ROAD TRIP',title:'自駕穿城，<br>追一日建築光影。',description:'參考官方建築藝文一日遊，從西側校園一路進城，最後到望高寮看夜景；各站保留找停車位的緩衝。',meta:['自駕','約 35 km／10 小時'],stops:[
    ['09:00','CAMPUS','東海大學・路思義教堂','上午光線適合看建築；車輛依校方規定停放，校園內以步行移動。'],
    ['11:30','URBAN PARK','中央公園','前往水湳園區散步，午餐可安排中央公園或逢甲周邊。'],
    ['14:30','LANDMARK','臺中國家歌劇院','使用周邊停車場，預留約 1.5 小時參觀建築與展覽空間。'],
    ['16:30','CREATIVE','審計新村・草悟道','開車約 15–25 分鐘；假日車位較緊張，建議停外圍停車場再步行。'],
    ['18:30','NIGHT VIEW','望高寮夜景公園','傍晚駕車上大肚台地看夕陽與夜景；山區道路減速，避免違規臨停。']
  ]}
};
const routeTabs=[...document.querySelectorAll('.route-tab')],routeLine=document.querySelector('.route-line'),routeIntro=document.querySelector('.route-intro'),routePanel=document.querySelector('#route-panel');
let routeSwitchTimer;
const renderRoute=key=>{const plan=routePlans[key];if(!plan||!routeLine||!routeIntro)return;clearTimeout(routeSwitchTimer);routeLine.classList.add('switching');routeSwitchTimer=setTimeout(()=>{routeIntro.querySelector('.eyebrow').textContent=plan.eyebrow;routeIntro.querySelector('h2').innerHTML=plan.title;routeIntro.querySelector(':scope>p:last-of-type').textContent=plan.description;routeIntro.querySelector('.route-meta').innerHTML=plan.meta.map(item=>`<span>${item}</span>`).join('');routeLine.innerHTML=plan.stops.map(stop=>`<li${stop[4]?` data-day="${stop[4]}"`:''}>${stop[4]?`<span class="route-day">${stop[4]}</span>`:''}<time>${stop[0]}</time><div><small>${stop[1]}</small><h3>${stop[2]}</h3><p>${stop[3]}</p></div></li>`).join('');routeLine.classList.remove('switching')},180)};
routeTabs.forEach((tab,index)=>{tab.addEventListener('click',()=>{routeTabs.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-selected','false');item.tabIndex=-1});tab.classList.add('active');tab.setAttribute('aria-selected','true');tab.tabIndex=0;routePanel?.setAttribute('aria-labelledby',tab.id);renderRoute(tab.dataset.route)});tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+routeTabs.length)%routeTabs.length;routeTabs[next].focus();routeTabs[next].click()})});
if(routeTabs.length)renderRoute('day');
