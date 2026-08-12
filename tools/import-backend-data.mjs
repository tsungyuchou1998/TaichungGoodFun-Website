import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const siteDirectory = resolve(toolDirectory, '..');
const sourcePath = resolve(siteDirectory, '..', 'backend', 'database', 'data', 'static-content.json');
const outputDirectory = join(siteDirectory, 'data');

const districtMap = {
  'east-old-town': ['東區'],
  'night-market': ['中區', '北區'],
  architecture: ['西屯區'],
  liuchuan: ['中區'],
  dessert: ['中區'],
  shenji: ['西區'],
  'science-museum': ['北區'],
  'city-night': ['西屯區'],
  'tun-jukuiju': ['烏日區'],
  'tun-laiyuan': ['霧峰區'],
  'tun-guangfu': ['霧峰區'],
  'tun-zhigao': ['烏日區'],
  'tun-asia-museum': ['霧峰區'],
  'tun-success-station': ['烏日區'],
  'tun-bodhisattva': ['大里區'],
  'tun-daliart': ['大里區'],
  'coast-gaomei': ['清水區'],
  'coast-wuqi': ['梧棲區'],
  'coast-dajia': ['大甲區'],
  'coast-waipu': ['外埔區'],
  'coast-aofeng': ['清水區'],
  'coast-railway': ['后里區'],
  'coast-qingshui-art': ['清水區'],
  'coast-lishui': ['龍井區'],
  'mountain-tanyashen': ['潭子區', '大雅區', '神岡區'],
  'mountain-houli-flowers': ['后里區'],
  'mountain-miaodong': ['豐原區'],
  'mountain-dongfeng': ['豐原區', '石岡區', '東勢區'],
  'mountain-xinshe-garden': ['新社區'],
  'mountain-guguan': ['和平區'],
  'mountain-daxueshan': ['和平區'],
  'mountain-deji': ['和平區'],
};

const regionMetadata = {
  city: { name: '城區', english_name: 'CITY CENTER', theme_color: '#8c7358' },
  tun: { name: '屯區', english_name: 'TUN DISTRICT', theme_color: '#526b55' },
  coast: { name: '海線', english_name: 'COAST LINE', theme_color: '#376a78' },
  mountain: { name: '山線', english_name: 'MOUNTAIN LINE', theme_color: '#355f4b' },
};

const normalizePaths = (value) => {
  if (Array.isArray(value)) return value.map(normalizePaths);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizePaths(item)]));
  }
  if (typeof value === 'string' && value.startsWith('images/')) {
    return `assets/${value}`;
  }
  return value;
};

const json = JSON.parse(await readFile(sourcePath, 'utf8'));
const generatedAt = json.generated_at || new Date().toISOString();

const site = normalizePaths(json.home_page);
const regions = normalizePaths(json.regions).map((region, index) => ({
  id: index + 1,
  ...regionMetadata[region.slug],
  ...region,
  is_published: true,
  sort_order: index + 1,
  view_count: 0,
  updated_at: generatedAt,
}));

const stories = normalizePaths(json.stories).map((story, index) => ({
  id: index + 1,
  ...story,
  administrative_districts: districtMap[story.slug] || [],
  view_count: 0,
  created_at: generatedAt,
  updated_at: generatedAt,
}));

let attractionId = 0;
const attractions = regions.flatMap((region) => region.spots.cards.map((card, index) => ({
  id: ++attractionId,
  name: card.title,
  slug: card.slug || `${region.slug}-spot-${index + 1}`,
  region: region.slug,
  category: card.kicker || card.meta || '必遊景點',
  meta_label: card.meta || '',
  summary: card.description || '',
  description: Array.isArray(card.details) ? card.details.join('｜') : (card.details || ''),
  address: '',
  image_path: card.image,
  external_url: card.url,
  latitude: null,
  longitude: null,
  is_featured: index === 0,
  is_published: true,
  sort_order: card.sort_order || index + 1,
  published_at: generatedAt,
  updated_at: generatedAt,
})));

const news = [
  ['旅遊', '暑假到台中入住特色文創旅宿，深度漫遊舊城', '2026-07-24'],
  ['美食', '台中星光再添新頁，特色餐廳入選米其林指南', '2026-07-22'],
  ['活動', '石岡熱氣球嘉年華登場，感受山城夏日魅力', '2026-07-22'],
  ['海線', '台中海洋觀光季系列活動，邀你熱血玩海線', '2026-07-21'],
].map(([category, title, date], index) => ({
  id: index + 1,
  source: '臺中觀光旅遊網',
  source_id: `static-${index + 1}`,
  category,
  title,
  source_url: 'https://travel.taichung.gov.tw/zh-tw/event/news',
  event_starts_at: null,
  event_ends_at: null,
  source_updated_at: date,
  is_current: true,
  synced_at: generatedAt,
  updated_at: generatedAt,
}));

const files = { site, regions, stories, attractions, news };
for (const [name, value] of Object.entries(files)) {
  await writeFile(join(outputDirectory, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  console.log(`Created data/${name}.json`);
}
