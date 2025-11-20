# Church Management System (ChMS)

完整的教會管理系統，包含會友管理、奉獻管理、活動報名、課程管理、小組管理等功能。

## 🚀 技術棧

- **前端**: React + Vite + Vanilla CSS
- **後端**: Cloudflare Workers + Hono
- **資料庫**: Google Sheets API
- **儲存**: Cloudflare R2
- **郵件**: Resend
- **部署**: Cloudflare Pages + Workers

## 📋 功能特色

### 公開網站
- ✅ 形象首頁
- ✅ 教會簡介
- ✅ 活動訊息
- ✅ 主日訊息
- ✅ 線上奉獻資訊
- ✅ 新朋友登記

### 管理後台
- ✅ 會友管理（CRUD、搜尋、標籤）
- ✅ 奉獻管理（記錄、收據、統計）
- ✅ 活動管理（報名、QR報到、候補）
- ✅ 課程管理
- ✅ 小組管理
- ✅ 志工管理
- ✅ 財務管理
- ✅ 問卷系統
- ✅ 媒體庫
- ✅ 權限控管（RBAC）

### 自動化功能
- ✅ 奉獻收據自動發送
- ✅ 活動報名確認信
- ✅ 生日祝福郵件
- ✅ 活動提醒通知
- ✅ QR Code 生成

## 🛠️ 安裝與設定

### 1. 克隆專案

```bash
git clone https://github.com/marcuxyang-droid/church-management.git
cd church-management
```

### 2. 安裝依賴

```bash
# 前端
npm install

# 後端
cd workers
npm install
```

### 3. 環境變數設定

#### 前端 (.env)
```env
VITE_API_URL=https://church-management.your-subdomain.workers.dev
VITE_SHEET_ID=your_google_sheet_id
```

#### 後端 (workers/.dev.vars)
```env
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'
GOOGLE_SHEET_ID=your_sheet_id
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=notify@blessing-haven.club
EMAIL_FROM_NAME=Church Management
JWT_SECRET=your_random_secret_key
```

### 4. 初始化 Google Sheets

1. 創建新的 Google Spreadsheet
2. 將 `blessing-haven@amiable-evening-476910-p6.iam.gserviceaccount.com` 加入編輯者
3. 複製 Sheet ID（從 URL 中取得）
4. 運行初始化腳本（見下方）

### 5. 本地開發

```bash
# 前端開發伺服器
npm run dev

# 後端開發伺服器
cd workers
npm run dev
```

### 6. 部署

#### 部署前端到 Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy dist --project-name=church-management
```

#### 部署後端到 Cloudflare Workers

```bash
cd workers

# 設定 secrets
npx wrangler secret put GOOGLE_SHEETS_CREDENTIALS
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put JWT_SECRET

# 部署
npm run deploy
```

## 📊 Google Sheets 結構

系統使用單一 Spreadsheet 包含以下 sheets:

1. **Members** - 會友資料
2. **Offerings** - 奉獻記錄
3. **Events** - 活動資訊
4. **Event_Registrations** - 活動報名
5. **Courses** - 課程資訊
6. **Course_Enrollments** - 課程報名
7. **Attendance** - 出席記錄
8. **Cell_Groups** - 小組資料
9. **Cell_Group_Meetings** - 小組聚會
10. **Volunteers** - 志工資料
11. **Volunteer_Schedules** - 志工排班
12. **Finance_Transactions** - 財務交易
13. **Surveys** - 問卷
14. **Survey_Responses** - 問卷回覆
15. **Media_Library** - 媒體庫
16. **Users** - 系統使用者

## 🔐 權限角色

- **Admin** - 系統管理員（所有權限）
- **Pastor** - 牧師（除系統設定外的所有權限）
- **Leader** - 小組長（會友、活動、課程、小組）
- **Staff** - 同工（會友、活動、課程）
- **Volunteer** - 志工（活動報到）
- **ReadOnly** - 唯讀（僅查看）

## 📧 Email 範本

系統包含以下自動化郵件：

- 奉獻收據
- 活動報名確認
- 生日祝福
- 活動提醒

## 🔧 API 端點

### 認證
- `POST /api/auth/login` - 登入
- `POST /api/auth/register` - 註冊（需 admin 權限）
- `GET /api/auth/me` - 取得當前使用者
- `POST /api/auth/change-password` - 更改密碼

### 會友
- `GET /api/members` - 取得會友列表
- `GET /api/members/:id` - 取得單一會友
- `POST /api/members` - 新增會友
- `PUT /api/members/:id` - 更新會友
- `DELETE /api/members/:id` - 刪除會友

### 奉獻
- `GET /api/offerings` - 取得奉獻記錄
- `POST /api/offerings` - 新增奉獻
- `GET /api/offerings/member/:memberId` - 取得會友奉獻

### 活動
- `GET /api/events` - 取得活動列表
- `POST /api/events` - 新增活動
- `POST /api/events/:id/register` - 報名活動
- `POST /api/events/:id/checkin` - QR 報到

## 📝 待辦事項

- [ ] 完善所有管理頁面的 CRUD 功能
- [ ] 實作課程管理 API
- [ ] 實作小組管理 API
- [ ] 實作志工管理 API
- [ ] 實作財務管理 API
- [ ] 實作問卷系統 API
- [ ] 實作媒體庫 API
- [ ] 加入圖表與統計功能
- [ ] LINE Official Account 整合
- [ ] 行事曆 (.ics) 生成
- [ ] PDF 收據生成
- [ ] 匯出功能（CSV/Excel）

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📄 授權

MIT License

## 📞 聯絡

如有任何問題，請聯繫開發團隊。
