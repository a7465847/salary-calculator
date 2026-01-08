# 💰 薪資試算模擬器 (Salary Calculator)

這是一個基於 **React** 的互動式薪資試算工具，  
協助使用者快速計算 **月薪結構、年度獎金、分紅** 以及 **預估稅前總年薪**。

---

## ✨ 功能特色

- 🔢 **即時試算**  
  輸入數值後自動計算月薪與年薪總額

- 📊 **結構分析**  
  提供圖表化的薪資結構分析（底薪、津貼、獎金佔比）

- 🛡️ **防呆機制**  
  防止輸入非數字、負數，優化輸入體驗

- 🤖 **自動化計算**
  - 全勤獎金依據薪額自動推算  
  - 持股信託與留才增給自動同步收支抵銷

- 📱 **RWD 響應式設計**  
  支援手機與電腦版瀏覽

- 📦 **PWA 支援**  
  可安裝至手機桌面，支援離線使用

---

## 🛠️ 技術堆疊

| 類型 | 技術 |
|---|---|
| 核心框架 | React + Vite |
| 樣式處理 | Tailwind CSS |
| 圖示庫 | Lucide React |
| 部署環境 | GitHub Pages / AWS S3（可選） |

---

## 💻 本地開發（Local Development）

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

#啟動後請開啟瀏覽器前往： http://localhost:5173


## 🚀 部署流程一：GitHub Pages（目前使用方式）

### 1️⃣ 加入暫存區
```bash
git add .
git commit -m "修正：新增薪資計算邏輯與樣式"
git push origin main
npm run deploy

## ☁️ 部署流程二：AWS S3（靜態網站託管）

### 步驟 1️⃣：打包專案
```bash
npm run build

### 步驟 2️⃣：建立 S3 Bucket
    - Bucket name：全球唯一（例：my-salary-app-2026）
    - 取消勾選 Block all public access

### 步驟 3️⃣：啟用靜態網站託管（Static Website Hosting）
    - Static website hosting：Enable
    - Index document：index.html

### 步驟 4️⃣：設定 Bucket Policy（公開讀取）
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::您的-bucket-名稱/*"
    }
  ]
}

### 步驟 5️⃣：上傳檔案
    - 上傳 dist/ 內 所有檔案與資料夾