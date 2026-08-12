const OFFICIAL_ORIGIN = 'https://travel.taichung.gov.tw';
const OFFICIAL_NEWS_URL = `${OFFICIAL_ORIGIN}/zh-tw/event/news`;

const decodeHtml = (value = '') => String(value)
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');

const plainText = (value = '') => decodeHtml(value.replace(/<[^>]+>/g, ' '))
  .replace(/\s+/g, ' ')
  .trim();

const attributeValue = (markup, name) => {
  const match = markup.match(new RegExp(`${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return decodeHtml(match?.[1] ?? match?.[2] ?? match?.[3] ?? '');
};

export const parseCurrentEventLinks = (html) => {
  const sections = html.match(/<section\b[^>]*class=(?:"[^"]*\bright-side-info-blk\b[^"]*"|'[^']*\bright-side-info-blk\b[^']*'|right-side-info-blk)[^>]*>[\s\S]*?<\/section>/gi) || [];
  const currentEvents = sections.find((section) => {
    const heading = section.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || '';
    return plainText(heading) === '當期活動';
  });
  if (!currentEvents) throw new Error('官方頁面右側找不到「當期活動」區塊，頁面結構可能已變更。');

  const links = [];
  const anchors = currentEvents.match(/<a\b[^>]*href=(?:"[^"]*\/event\/activitydetail\/[^"]*"|'[^']*\/event\/activitydetail\/[^']*'|[^\s>]*\/event\/activitydetail\/[^\s>]*)[^>]*>/gi) || [];
  for (const anchor of anchors) {
    const href = attributeValue(anchor, 'href');
    if (href) links.push(new URL(href, OFFICIAL_ORIGIN).href);
  }
  const unique = [...new Set(links)];
  if (!unique.length) throw new Error('官方頁面的「當期活動」區塊中沒有可辨識的活動連結。');
  return unique;
};

export const parseCurrentEvent = (html, sourceUrl) => {
  const title = plainText(html.match(/<h2\b[^>]*class=(?:"[^"]*\bunit-title\b[^"]*"|'[^']*\bunit-title\b[^']*'|unit-title)[^>]*>[\s\S]*?<span\b[^>]*class=(?:"[^"]*\bname\b[^"]*"|'[^']*\bname\b[^']*'|name)[^>]*>([\s\S]*?)<\/span>[\s\S]*?<\/h2>/i)?.[1] || '');
  const publishInfo = html.match(/<div\b[^>]*class=(?:"[^"]*\bnews-publish-info-blk\b[^"]*"|'[^']*\bnews-publish-info-blk\b[^']*'|news-publish-info-blk)[^>]*>([\s\S]*?)<\/div>/i)?.[1] || '';
  const sourceUpdatedAt = publishInfo.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
  const eventInfoStart = html.search(/<div\b[^>]*class=(?:"[^"]*\bbg-event-info\b[^"]*"|'[^']*\bbg-event-info\b[^']*'|bg-event-info)[^>]*>/i);
  const eventDates = eventInfoStart >= 0
    ? [...html.slice(eventInfoStart, eventInfoStart + 2500).matchAll(/\d{4}-\d{2}-\d{2}/g)].map((match) => match[0])
    : [];

  if (!title || !sourceUpdatedAt) throw new Error(`無法解析官方當期活動頁：${sourceUrl}`);
  return {
    source: '臺中觀光旅遊網',
    source_id: new URL(sourceUrl).pathname.split('/').filter(Boolean).at(-1),
    category: '當期活動',
    title,
    source_url: sourceUrl,
    event_starts_at: eventDates[0] || null,
    event_ends_at: eventDates[1] || eventDates[0] || null,
    source_updated_at: sourceUpdatedAt,
    is_current: true,
  };
};

const fetchHtml = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'TaichungGoodFun/1.0 (+local content manager)',
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`官方頁面回應 ${response.status}：${url}`);
  return response.text();
};

export const syncOfficialNews = async () => {
  const links = parseCurrentEventLinks(await fetchHtml(OFFICIAL_NEWS_URL));
  const articles = await Promise.all(links.map(async (url) => parseCurrentEvent(await fetchHtml(url), url)));
  const syncedAt = new Date().toISOString();
  return {
    source_url: OFFICIAL_NEWS_URL,
    synced_at: syncedAt,
    articles: articles.map((article) => ({ ...article, synced_at: syncedAt, updated_at: syncedAt })),
  };
};

