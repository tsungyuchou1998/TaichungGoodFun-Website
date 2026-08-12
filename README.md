# 臺中好地 Fun

以臺中城區、屯區、海線與山線為主題的靜態旅遊導覽網站。網站由 HTML、CSS、JavaScript 與 JSON 資料組成，可直接部署至 GitHub Pages。

## 線上網站

- GitHub Pages：<https://tsungyuchou1998.github.io/TaichungGoodFun-Website/>
- 原始碼：<https://github.com/tsungyuchou1998/TaichungGoodFun-Website>

## 網站內容

- 首頁：區域導覽、精選影片、最新消息
- 區域頁：城區、屯區、海線、山線介紹與景點
- 旅人手記：旅行故事列表與文章內容
- 內容管理：在瀏覽器中編輯 JSON 資料、預覽並下載更新檔

## 本機預覽

請勿直接雙擊 `index.html`，瀏覽器會阻擋頁面讀取 JSON。請在 Windows PowerShell 執行：

```powershell
.\start-local.ps1
```

啟動後開啟：

- 公開網站：<http://127.0.0.1:4173/>
- 內容管理：<http://127.0.0.1:4173/admin/>

## 更新內容

1. 開啟 `/admin/` 編輯內容並預覽。
2. 下載更新後的 JSON 檔案。
3. 將檔案放回 `data/` 對應位置。
4. 提交並推送至 `main` 分支，GitHub Pages 會自動重新部署。

> 內容管理頁的草稿只會儲存在目前瀏覽器中，不會直接修改 GitHub 上的檔案。

## GitHub Pages 設定

此專案使用 `main` 分支根目錄作為發布來源，並以 `.nojekyll` 關閉 Jekyll 處理。所有站內資源均使用相對路徑，可在 GitHub Pages 的專案子目錄下正常運作。

## 專案結構

```text
TaichungGoodFun-Website/
├─ index.html          # 首頁
├─ pages/              # 公開內容頁
├─ admin/              # 瀏覽器端內容管理工具
├─ data/               # 網站 JSON 資料
├─ assets/             # 樣式、腳本、圖片與影片
├─ regions/            # 舊版區域入口（相容連結）
├─ legacy/             # 舊版頁面
└─ tools/              # 本機預覽與資料同步工具
```

## 使用技術

- HTML5
- CSS3
- JavaScript ES Modules
- JSON
- GitHub Pages

