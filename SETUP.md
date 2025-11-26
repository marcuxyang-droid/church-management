# Church Management System - Setup Guide

## 快速開始指南

### 第一步：創建 Google Spreadsheet

1. 前往 [Google Sheets](https://sheets.google.com)
2. 創建新的試算表
3. 將試算表分享給：`blessing-haven@amiable-evening-476910-p6.iam.gserviceaccount.com`（編輯者權限）
4. 從 URL 複製 Sheet ID（格式：`https://docs.google.com/spreadsheets/d/SHEET_ID/edit`）

### 第二步：初始化 Sheets

```bash
cd scripts
npm install
export GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'  # 完整的 JSON
export GOOGLE_SHEET_ID='your_sheet_id_here'
npm run init-sheets
```

### 第三步：創建管理員帳號

在 Google Sheets 的 `Users` sheet 中手動新增第一個管理員：

| id | member_id | email | password_hash | role | permissions | line_user_id | last_login | created_at |
|----|-----------|-------|---------------|------|-------------|--------------|------------|------------|
| (UUID) | (留空) | admin@church.com | (使用 bcrypt hash) | admin | {} | | | 2024-01-01T00:00:00Z |

**密碼 Hash 生成**：
```javascript
// 在 Node.js 中執行
const crypto = require('crypto');
const password = 'your_password';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log(hash);
```

### 第四步：配置環境變數

#### 前端 (.env)
```env
VITE_API_URL=https://church-management.your-subdomain.workers.dev
VITE_SHEET_ID=your_google_sheet_id
```

#### 後端 (workers/.dev.vars)
```env
GOOGLE_SHEETS_CREDENTIALS='完整的 JSON 憑證'
GOOGLE_SHEET_ID=your_sheet_id
RESEND_API_KEY=re_YayNmedz_3wagLr5yfckFTN4nw4bH8bZN
EMAIL_FROM=notify@blessing-haven.club
EMAIL_FROM_NAME=Church Management
JWT_SECRET=請生成一個隨機字串
```

### 第五步：本地測試

```bash
# 前端
npm install
npm run dev

# 後端（新終端）
cd workers
npm install
npm run dev
```

訪問 http://localhost:3000 測試系統

### 第六步：部署到 Cloudflare

#### 設定 Wrangler

```bash
cd workers
npx wrangler login
```

#### 創建 KV Namespace

```bash
npx wrangler kv:namespace create "SESSIONS"
```

將返回的 ID 更新到 `workers/wrangler.toml`

#### 創建 R2 Bucket

```bash
npx wrangler r2 bucket create church-media
```

#### 設定 Secrets

```bash
npx wrangler secret put GOOGLE_SHEETS_CREDENTIALS
# 貼上完整的 JSON 憑證

npx wrangler secret put RESEND_API_KEY
# 輸入: re_YayNmedz_3wagLr5yfckFTN4nw4bH8bZN

npx wrangler secret put JWT_SECRET
# 輸入一個隨機字串
```

#### 部署

**建議**：直接在專案根目錄執行 `./deploy.ps1` 或 `bash ./deploy.sh`。腳本會驗證 `.deploystamp`、建置前端、部署 Workers 以及發佈到 Pages Production Branch，能避免誤用舊版專案資料夾。

**若需手動操作**：

```bash
# 部署 Workers
cd workers
npm run deploy

# 部署 Pages
cd ..
npm run build
npx wrangler pages deploy dist --project-name=church-management --branch=production
```

### 第七步：配置自訂網域（選用）

1. 前往 Cloudflare Dashboard
2. Pages > church-management > Custom domains
3. 新增您的網域
4. Workers & Pages > church-management (worker) > Settings > Triggers
5. 新增自訂網域

### 完成！

系統現在已經部署完成，您可以：

1. 訪問您的網站
2. 使用管理員帳號登入
3. 開始新增會友、活動等資料

## 常見問題

### Q: 如何重置管理員密碼？

A: 直接在 Google Sheets 的 Users sheet 中更新 `password_hash` 欄位

### Q: 如何備份資料？

A: Google Sheets 會自動保存版本歷史，也可以定期下載為 Excel 檔案

### Q: 如何新增更多管理員？

A: 登入後台，使用「註冊」功能（需要 admin 權限）

### Q: Email 沒有發送？

A: 檢查 Resend API Key 是否正確，以及發信域名是否已驗證

## 技術支援

如有問題，請查看 README.md 或聯繫開發團隊。
