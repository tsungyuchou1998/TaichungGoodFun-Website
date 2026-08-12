const header=document.querySelector('.site-header'),toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'關閉主選單':'開啟主選單')});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}));
const updateHeader=()=>header?.classList.toggle('scrolled',scrollY>100);updateHeader();addEventListener('scroll',updateHeader,{passive:true});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reducedMotion&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(item=>observer.observe(item))}else document.querySelectorAll('.reveal').forEach(item=>item.classList.add('visible'));

const slides=[...document.querySelectorAll('.city-hero-slide')],dotsWrap=document.querySelector('.city-carousel-dots');let current=0,timer;
if(slides.length&&dotsWrap){
  slides.forEach((slide,index)=>{slide.id=`mountain-slide-${index+1}`;const dot=document.createElement('button');dot.type='button';dot.setAttribute('role','tab');dot.setAttribute('aria-label',`顯示第 ${index+1} 張山線照片`);dot.setAttribute('aria-controls',slide.id);dot.addEventListener('click',()=>showSlide(index,true));dotsWrap.append(dot)});
  const dots=[...dotsWrap.children],restart=()=>{clearInterval(timer);if(!reducedMotion)timer=setInterval(()=>showSlide(current+1),5500)};
  function showSlide(index,user=false){slides[current].classList.remove('active');slides[current].setAttribute('aria-hidden','true');dots[current].classList.remove('active');dots[current].setAttribute('aria-selected','false');current=(index+slides.length)%slides.length;slides[current].classList.add('active');slides[current].setAttribute('aria-hidden','false');dots[current].classList.add('active');dots[current].setAttribute('aria-selected','true');if(user)restart()}
  slides[0].classList.add('active');dots[0].classList.add('active');dots[0].setAttribute('aria-selected','true');restart();
  document.querySelector('.city-prev')?.addEventListener('click',()=>showSlide(current-1,true));document.querySelector('.city-next')?.addEventListener('click',()=>showSlide(current+1,true));document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):restart());
}

const parallaxPhotos=[...document.querySelectorAll('[data-parallax]')];
if(parallaxPhotos.length&&!reducedMotion){let ticking=false;const update=()=>{const factor=innerWidth<=560?.3:(innerWidth<=900?.65:1);parallaxPhotos.forEach(photo=>{const rect=photo.getBoundingClientRect(),distance=rect.top+rect.height/2-innerHeight/2,offset=Math.max(-24,Math.min(24,distance*Number(photo.dataset.parallax)*factor)),media=photo.querySelector('.mosaic-media');if(media)media.style.transform=`translate3d(0,${offset}px,0)`});ticking=false};update();addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update,{passive:true})}

const routePlans={
  day:{eyebrow:'ONE DAY JOURNEY',title:'山線一日，<br>從鐵道騎進山城。',description:'以豐原為起點，串聯后里、石岡與東勢，把老街小吃、舊鐵道和河谷風景收進一天。',meta:['單車＋步行','約 9 小時'],stops:[
    ['09:00','START','豐原車站','抵達山線門戶，租借單車或轉乘前往后里。'],
    ['10:00','CYCLING','后豐鐵馬道','穿越九號隧道與花梁鋼橋，沿大甲溪谷迎風騎行。'],
    ['12:30','RIVER','石岡水壩','在河岸休息看水景，再銜接東豐自行車綠廊。'],
    ['15:00','HAKKA','東勢客家文化園區','走進舊車站與客庄記憶，品嚐一份山城點心。'],
    ['18:00','NIGHT','豐原廟東復興商圈','以排骨麵、蚵仔煎和鳳梨冰為今日收尾。']
  ]},
  'two-days':{eyebrow:'TWO DAYS JOURNEY',title:'花園與溫泉，<br>住進山城兩日。',description:'第一天慢遊后里與新社，第二天沿大甲溪谷深入谷關，兼顧花景、田園與泡湯時光。',meta:['自駕建議','2 天 1 夜'],stops:[
    ['09:00','FLOWERS','中社觀光花市','DAY 1：在季節花田迎接山線的明亮早晨。','DAY 1'],
    ['12:00','COUNTRYSIDE','新社菇園午餐','DAY 1：品嚐鮮菇料理，認識山城農產。'],
    ['14:30','GARDEN','新社山城花園','DAY 1：在香草、花園與林間步道散步。'],
    ['09:30','VALLEY','谷關溫泉公園','DAY 2：沿溪谷散步，在泡腳池感受溫泉暖意。','DAY 2'],
    ['12:00','LOCAL FOOD','谷關午餐','DAY 2：補充體力，品嚐山產與地方料理。'],
    ['14:00','TRAIL','谷關步道散策','DAY 2：依體力選擇親山步道，欣賞溪谷森林。'],
    ['16:30','HOT SPRING','谷關泡湯','DAY 2：用一池溫泉替兩日山旅溫柔收尾。']
  ]},
  bike:{eyebrow:'CYCLING JOURNEY',title:'雙綠廊串騎，<br>追一段舊山線。',description:'以后里為起點，串聯后豐鐵馬道與東豐自行車綠廊；隧道、鐵橋、水壩與客庄一次收藏。',meta:['自行車','約 6–8 小時'],stops:[
    ['08:30','START','后里馬場','租車整備後出發，先感受百年馬場周邊風景。'],
    ['09:30','TUNNEL','舊山線九號隧道','騎進涼爽隧道，穿越舊鐵道留下的時光廊道。'],
    ['10:30','BRIDGE','花梁鋼橋','從橋上眺望大甲溪與峽谷，欣賞山線代表景觀。'],
    ['12:30','REST','石岡水壩','在河岸休息午餐，觀察水利地景。'],
    ['15:00','TERMINUS','東勢客家文化園區','抵達舊東勢車站，在客庄街區散步補給。']
  ]},
  drive:{eyebrow:'HIGHLAND JOURNEY',title:'沿山路向上，<br>遇見雲霧與果香。',description:'安排兩至三天走訪大雪山或梨山，讓森林、雲海與高山聚落成為旅程主角。',meta:['自駕／預約交通','建議 2–3 天'],stops:[
    ['08:00','DEPARTURE','東勢山城出發','確認天候與道路資訊，備妥保暖衣物、飲水與補給。'],
    ['10:30','FOREST','大雪山森林遊樂區','循步道拜訪神木與天池，放慢速度觀察森林生態。'],
    ['15:30','SUNSET','高山觀景點','在安全開放區域等待雲霧變化與山間暮色。'],
    ['09:00','HIGHLAND','梨山風景區','翌日走訪高山聚落、果園與茶園，眺望層疊群峰。','DAY 2'],
    ['13:30','SEASON','武陵農場','依季節賞櫻、楓紅或高山景觀，預留充足步行時間。']
  ]}
};

const tabs=[...document.querySelectorAll('.route-tab')],line=document.querySelector('.route-line'),intro=document.querySelector('.route-intro'),panel=document.querySelector('#route-panel');let switchTimer;
const renderRoute=key=>{const plan=routePlans[key];if(!plan||!line||!intro)return;clearTimeout(switchTimer);line.classList.add('switching');switchTimer=setTimeout(()=>{intro.querySelector('.eyebrow').textContent=plan.eyebrow;intro.querySelector('h2').innerHTML=plan.title;intro.querySelector(':scope>p:last-of-type').textContent=plan.description;intro.querySelector('.route-meta').innerHTML=plan.meta.map(item=>`<span>${item}</span>`).join('');line.innerHTML=plan.stops.map(stop=>`<li${stop[4]?` data-day="${stop[4]}"`:''}>${stop[4]?`<span class="route-day">${stop[4]}</span>`:''}<time>${stop[0]}</time><div><small>${stop[1]}</small><h3>${stop[2]}</h3><p>${stop[3]}</p></div></li>`).join('');line.classList.remove('switching')},180)};
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>{tabs.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-selected','false');item.tabIndex=-1});tab.classList.add('active');tab.setAttribute('aria-selected','true');tab.tabIndex=0;panel?.setAttribute('aria-labelledby',tab.id);renderRoute(tab.dataset.route)});tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click()})});
renderRoute('day');
