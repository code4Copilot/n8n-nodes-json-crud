# n8n-nodes-json-crud

這是一個 n8n 社群節點，讓您輕鬆對 JSON 資料執行 CRUD（新增、讀取、更新、刪除）操作。

**特別適合處理從 Excel 轉換而來的 JSON 資料！** 

## 🎯 為什麼需要這個節點？

當您使用 n8n 處理 Excel 檔案時，通常需要：
1. 使用 `Extract from File` 將 Excel 轉為 JSON
2. 組合多個節點（Filter、Edit Fields、Code 等）來處理資料
3. 使用 `Convert to File` 轉回 Excel

**這個節點簡化了第 2 步**，將多個操作整合在一個節點中，對初學者更友好！

## ✨ 功能特色

### 📝 CREATE（新增）
- 新增單筆或多筆資料
- 選擇加在最前或最後
- 支援 JSON 格式輸入

### 🔍 READ（讀取/篩選）
- **Filter（篩選）**：12 種比較運算子，支援 AND/OR 邏輯
- **Sort（排序）**：升序或降序排序
- **Search（搜尋）**：全文搜尋或指定欄位搜尋
- **Limit（限制）**：分頁功能，支援 offset
- **By Cell Position（儲存格讀取）**：類似 Excel 的精確讀取
  - 支援單一列：`0`（第 1 列）
  - 支援範圍：`0-5`（第 1-6 列）
  - 支援多個列：`0,2,4`（第 1,3,5 列）
  - 支援組合：`0-2,5,7-9`（第 1-3,6,8-10 列）
  - 可選擇特定欄位或讀取全部欄位

### ✏️ UPDATE（更新）
- **條件更新**：根據條件批量更新多個欄位
- **儲存格更新**：類似 Excel 的 A1/B2 定位方式更新指定儲存格
  - 支援單一列：`0`（第 1 列）
  - 支援範圍：`0-5`（第 1-6 列）
  - 支援多個列：`0,2,4`（第 1,3,5 列）
  - 支援組合：`0-2,5,7-9`（第 1-3,6,8-10 列）
- 支援表達式計算

### 🗑️ DELETE（刪除）
- 根據條件刪除資料
- 支援多條件組合
- 保留不符合條件的資料

### 🔄 REMOVE DUPLICATES（去重）
- 根據指定欄位去重
- 或比較所有欄位去重

### 📊 STATISTICS（統計）
- 計算 count、sum、avg、min、max
- 支援分組統計
- 快速產生報表資料

## 📦 安裝

### 方法 1：從 npm 安裝（發布後）
```bash
npm install n8n-nodes-json-crud
```

### 方法 2：從 GitHub 安裝
```bash
cd ~/.n8n/nodes
npm install git+https://github.com/fchart/n8n-nodes-json-crud.git
```

### 方法 3：手動安裝（開發用）
```bash
# 1. Clone 專案
git clone https://github.com/fchart/n8n-nodes-json-crud.git
cd n8n-nodes-json-crud

# 2. 安裝依賴
npm install

# 3. 編譯
npm run build

# 4. 連結到 n8n
npm link
cd ~/.n8n
npm link n8n-nodes-json-crud

# 5. 重啟 n8n
```

## 🚀 使用範例

### 範例 1：處理員工 Excel 檔案

```
┌─────────────────┐
│ Read Binary File│  讀取 employees.xlsx
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract from    │  轉換為 JSON
│ File (XLSX)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JSON CRUD       │  操作：Filter
│ 篩選技術部       │  條件：部門 = "技術部"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JSON CRUD       │  操作：Update
│ 加薪 10%        │  更新：薪資 = 薪資 * 1.1
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JSON CRUD       │  操作：Sort
│ 薪資排序         │  欄位：薪資（降序）
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Convert to File │  轉回 Excel
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Write Binary    │  儲存檔案
│ File            │
└─────────────────┘
```

### 範例 2：新增資料

**操作設定：**
- Operation: `Create`
- Position: `Append`
- Data to Add:
```json
{
  "員工編號": "E0099",
  "姓名": "王小明",
  "部門": "技術部",
  "薪資": 50000
}
```

或批量新增：
```json
[
  {"姓名": "張三", "部門": "業務部", "薪資": 45000},
  {"姓名": "李四", "部門": "行政部", "薪資": 40000}
]
```

### 範例 3：篩選資料

**操作設定：**
- Operation: `Read`
- Read Mode: `Filter`
- Conditions:
  - 條件 1: 部門 `equals` "技術部"
  - 條件 2: 薪資 `greater than` 45000
- Condition Logic: `AND`

結果：只返回技術部且薪資大於 45000 的員工

### 範例 3-1：⭐ 儲存格讀取（類似 Excel）

#### 情境 1：讀取單一列的所有欄位
**操作設定：**
- Operation: `Read`
- Read Mode: `By Cell Position`
- Row Index: `0`（第 1 列）
- Field Names: 留空（讀取所有欄位）

結果：只返回第 1 列的完整資料

#### 情境 2：讀取範圍列的特定欄位
**操作設定：**
- Operation: `Read`
- Read Mode: `By Cell Position`
- Row Index: `0-4`（第 1-5 列）
- Field Names: `姓名,薪資`

結果：返回第 1-5 列，但每列只包含姓名和薪資兩個欄位

#### 情境 3：讀取多個不連續列
**操作設定：**
- Operation: `Read`
- Read Mode: `By Cell Position`
- Row Index: `0,5,10`（第 1,6,11 列）
- Field Names: 留空

結果：返回第 1,6,11 列的完整資料

#### 情境 4：提取表頭和資料範圍
**操作設定：**
- Operation: `Read`
- Read Mode: `By Cell Position`
- Row Index: `0-2,10-12`（第 1-3 和 11-13 列）
- Field Names: `姓名,部門,薪資`

結果：返回第 1-3 列和第 11-13 列，只包含指定的三個欄位

### 範例 4：條件更新資料

**操作設定：**
- Operation: `Update`
- Update Mode: `By Condition`
- Update Conditions:
  - 部門 `equals` "技術部"
- Fields to Update:
  - 欄位：薪資，值：`{{ $json.薪資 * 1.15 }}`
  - 欄位：更新日期，值：`{{ $now }}`

結果：技術部員工薪資增加 15%

### 範例 5：⭐ 儲存格更新（類似 Excel）

#### 情境 1：更新單一儲存格
**操作設定：**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0`（第 1 列，0-based）
- Field Name: `薪資`
- New Value: `60000`

結果：只更新第 1 列的薪資欄位為 60000

#### 情境 2：更新範圍儲存格
**操作設定：**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0-4`（第 1-5 列）
- Field Name: `部門`
- New Value: `技術部`

結果：第 1-5 列的部門欄位全部更新為「技術部」

#### 情境 3：更新多個不連續儲存格
**操作設定：**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0,2,4,6`（第 1,3,5,7 列）
- Field Name: `狀態`
- New Value: `已審核`

結果：只更新第 1,3,5,7 列的狀態欄位

#### 情境 4：組合範圍和單一儲存格
**操作設定：**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0-2,5,8-10`（第 1-3,6,9-11 列）
- Field Name: `標記`
- New Value: `重要`

結果：更新第 1-3,6,9-11 列的標記欄位

#### 情境 5：使用表達式更新特定列
**操作設定：**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0`
- Field Name: `薪資`
- New Value: `{{ $json.薪資 * 1.2 }}`

結果：第 1 列的薪資增加 20%

### 範例 6：刪除資料

**操作設定：**
- Operation: `Delete`
- Delete Conditions:
  - 狀態 `equals` "離職"

結果：移除所有離職員工的資料

### 範例 7：搜尋功能

**操作設定：**
- Operation: `Read`
- Read Mode: `Search`
- Search Field: 留空（搜尋所有欄位）
- Search Value: "工程師"
- Case Sensitive: false

結果：返回任何欄位包含「工程師」的資料

### 範例 8：分組統計

**操作設定：**
- Operation: `Statistics`
- Statistics Field: `薪資`
- Group By Field: `部門`

結果：
```json
[
  {
    "group": "技術部",
    "count": 15,
    "sum": 750000,
    "avg": 50000,
    "min": 40000,
    "max": 70000
  },
  {
    "group": "業務部",
    "count": 10,
    "sum": 450000,
    "avg": 45000,
    "min": 38000,
    "max": 55000
  }
]
```

## 📚 詳細功能說明

### Read（讀取）模式說明

#### 模式 1：Filter（篩選）
- 根據條件篩選記錄
- 支援多種運算子和邏輯組合
- 適合批量過濾符合特定條件的資料

#### 模式 2：Sort（排序）
- 根據指定欄位排序
- 支援升序和降序
- 適合產生排名或有序列表

#### 模式 3：Search（搜尋）
- 全文搜尋或指定欄位搜尋
- 支援大小寫敏感選項
- 適合關鍵字查詢

#### 模式 4：Limit（限制）
- 分頁功能，支援 offset
- 適合處理大量資料時的分批讀取

#### 模式 5：By Cell Position（儲存格讀取）
- 類似 Excel 的精確定位讀取
- 使用列索引（0-based）+ 可選欄位名稱
- 支援靈活的範圍選擇

**列索引格式：**
| 格式 | 說明 | 範例 |
|------|------|------|
| 單一列 | `0` | 只讀取第 1 列 |
| 範圍 | `0-5` | 讀取第 1-6 列 |
| 多個列 | `0,2,4` | 讀取第 1,3,5 列 |
| 組合 | `0-2,5,7-9` | 讀取第 1-3,6,8-10 列 |

**欄位選擇：**
- 留空：讀取所有欄位
- 指定：只讀取指定欄位（逗號分隔），如 `姓名,薪資,部門`

**使用情境：**
- 提取 Excel 的表頭列
- 讀取特定範圍的資料進行分析
- 抽取不連續列的資料
- 只提取需要的欄位減少資料量

### Filter（篩選）支援的運算子

| 運算子 | 說明 | 範例 |
|--------|------|------|
| Equals | 等於 | 部門 = "技術部" |
| Not Equals | 不等於 | 狀態 ≠ "離職" |
| Contains | 包含 | 姓名包含 "王" |
| Not Contains | 不包含 | 職位不包含 "實習" |
| Greater Than | 大於 | 薪資 > 40000 |
| Greater or Equal | 大於等於 | 薪資 >= 45000 |
| Less Than | 小於 | 年齡 < 30 |
| Less or Equal | 小於等於 | 年齡 <= 35 |
| Starts With | 開頭是 | 員工編號開頭是 "E" |
| Ends With | 結尾是 | Email 結尾是 "@company.com" |
| Is Empty | 為空 | 備註為空 |
| Is Not Empty | 不為空 | 電話不為空 |

### Update（更新）兩種模式

#### 模式 1：By Condition（條件更新）
- 根據條件篩選要更新的記錄
- 可以同時更新多個欄位
- 支援複雜條件組合
- 適合批量更新符合特定條件的資料

**使用情境：**
- 將所有技術部員工加薪 10%
- 更新所有在職員工的狀態
- 標準化符合條件的資料格式

#### 模式 2：By Cell Position（儲存格更新）
- 類似 Excel 的 A1/B2 定位方式
- 使用列索引（0-based）+ 欄位名稱
- 支援靈活的範圍選擇

**列索引格式：**
| 格式 | 說明 | 範例 |
|------|------|------|
| 單一列 | `0` | 只更新第 1 列 |
| 範圍 | `0-5` | 更新第 1-6 列 |
| 多個列 | `0,2,4` | 更新第 1,3,5 列 |
| 組合 | `0-2,5,7-9` | 更新第 1-3,6,8-10 列 |

**注意：** 列索引是 0-based，即第一列是 0，第二列是 1，依此類推。

**使用情境：**
- 修正特定列的資料錯誤
- 更新報表的表頭或總計列
- 標記特定位置的資料
- 批量更新連續或不連續的儲存格

### Update（更新）支援表達式

在更新欄位值時，可以使用 n8n 表達式：

**重要：** 表達式會針對**每一筆符合條件的資料**分別評估，確保每筆資料都用自己的值計算！

```javascript
// 數字計算
{{ $json.薪資 * 1.1 }}                    // 加薪 10%（每筆用自己的薪資）
{{ $json.價格 - 100 }}                    // 減 100
{{ $json.數量 + 5 }}                      // 加 5

// 字串操作
{{ $json.姓名 + " (已更新)" }}             // 字串連接
{{ $json.Email.toLowerCase() }}           // 轉小寫
{{ $json.代碼.toUpperCase() }}            // 轉大寫

// 日期時間
{{ $now }}                                 // 當前時間
{{ $now.format('YYYY-MM-DD') }}           // 格式化日期

// 條件判斷
{{ $json.薪資 > 50000 ? "高薪" : "一般" }} // 三元運算（每筆獨立判斷）
{{ $json.年齡 >= 60 ? "退休" : "在職" }}   // 年齡判斷

// 數學函數
{{ Math.round($json.薪資 * 1.1) }}        // 四捨五入
{{ Math.ceil($json.價格 * 0.9) }}         // 無條件進位
{{ Math.floor($json.金額 / 100) * 100 }}  // 無條件捨去到百位
```

**範例：技術部加薪 15%**
```
Update Mode: By Condition
Condition: 部門 = "技術部"
Field: 薪資
Value: {{ $json.薪資 * 1.15 }}

結果：
- 員工 A (技術部, 50000) → 57500
- 員工 B (技術部, 60000) → 69000  ✅ 每筆用自己的薪資計算
- 員工 C (業務部, 45000) → 45000  (不變)
```

## 🔧 與其他節點的比較

| 功能 | 傳統方式 | JSON CRUD 節點 |
|------|---------|---------------|
| 篩選資料 | Filter 節點 | ✅ 單一節點完成 |
| 更新資料 | Edit Fields + IF | ✅ 單一節點完成 |
| 儲存格更新 | Code 節點 + 複雜邏輯 | ✅ 視覺化設定 |
| 刪除資料 | Filter（反向） | ✅ 更直觀的刪除 |
| 搜尋 | Code 節點 | ✅ 內建搜尋功能 |
| 統計 | Aggregate | ✅ 更簡單的設定 |
| 組合操作 | 需要 3-5 個節點 | ✅ 一個節點串接 |

## 💡 最佳實踐

### 1. 處理 Excel 的完整流程
```
Read Binary File 
→ Extract from File 
→ JSON CRUD (Remove Duplicates)
→ JSON CRUD (Filter)
→ JSON CRUD (Update)
→ JSON CRUD (Sort)
→ Convert to File
→ Write Binary File
```

### 2. 資料驗證流程
```
Extract from File
→ JSON CRUD (Filter 移除無效資料)
→ JSON CRUD (Update 標準化格式)
→ JSON CRUD (Statistics 檢查資料品質)
→ Convert to File
```

### 4. ⭐ 儲存格精確處理流程（適合複雜 Excel 處理）
```
Extract from File
→ JSON CRUD (Read by Cell - 提取表頭)
→ JSON CRUD (Read by Cell - 提取資料範圍)
→ JSON CRUD (Update by Cell - 修正特定錯誤)
→ JSON CRUD (Filter - 篩選有效資料)
→ JSON CRUD (Statistics - 統計分析)
→ Convert to File
```

### 5. 混合模式工作流程
```
Extract from File
→ JSON CRUD (Read by Cell - 只讀取需要的列和欄位)
→ JSON CRUD (Filter - 進一步條件篩選)
→ JSON CRUD (Update by Condition - 批量更新)
→ JSON CRUD (Update by Cell - 修正特殊情況)
→ JSON CRUD (Sort - 排序)
→ Convert to File
```

### 3. 報表生成流程
```
Extract from File
→ JSON CRUD (Filter 選擇時間範圍)
→ JSON CRUD (Statistics 分組統計)
→ JSON CRUD (Sort 排序)
→ Convert to File
```

### 4. ⭐ 儲存格修正流程
```
Extract from File
→ JSON CRUD (Update by Cell - 修正表頭列)
→ JSON CRUD (Update by Cell - 更新特定錯誤資料)
→ JSON CRUD (Filter 篩選有效資料)
→ Convert to File
```

## 🎯 實戰案例

### 案例 1：提取並分析 Excel 特定範圍資料
**情境：**從一個大型 Excel 檔案中，只需要提取第 10-50 列的姓名、部門、薪資三個欄位進行分析

**解決方案：**
```
步驟 1: Extract from File
- 將 Excel 轉換為 JSON

步驟 2: JSON CRUD (Read by Cell)
- Row Index: 9-49  (第 10-50 列，0-based)
- Field Names: 姓名,部門,薪資

步驟 3: JSON CRUD (Statistics)
- 對提取的資料進行統計分析
```

**優點：**
- 大幅減少記憶體使用
- 提升處理速度
- 只處理需要的資料

### 案例 2：Excel 報表資料重組
**情境：**Excel 報表中，第 1 列是表頭，第 2-10 列是本月資料，第 50-60 列是去年同期資料，需要分別提取進行比較

**解決方案：**
```
步驟 1: JSON CRUD (Read by Cell) - 提取本月資料
- Row Index: 1-9  (第 2-10 列)
- Field Names: 留空（讀取所有欄位）
- 輸出至下一步

步驟 2: JSON CRUD (Read by Cell) - 提取去年資料
- Row Index: 49-59  (第 50-60 列)
- Field Names: 留空
- 輸出至下一步

步驟 3: 比較分析兩組資料
```

### 案例 3：修正 Excel 匯入的錯誤資料
**情境：**匯入的 Excel 檔案中，第 1 列（表頭）的部門欄位錯誤，且第 5-8 列的薪資需要統一更新

**解決方案：**
```
步驟 1: JSON CRUD (Update by Cell)
- Row Index: 0
- Field Name: 部門
- New Value: Department

步驟 2: JSON CRUD (Update by Cell)
- Row Index: 4-7  (第 5-8 列，0-based)
- Field Name: 薪資
- New Value: {{ $json.薪資 * 1.05 }}
```

### 案例 4：批量處理客戶資料
**情境：**需要將特定客戶的狀態標記為「VIP」，並更新他們的折扣率

**解決方案：**
```
步驟 1: JSON CRUD (Filter)
- 篩選出目標客戶

步驟 2: JSON CRUD (Update by Condition)
- 條件：客戶等級 = "白金"
- 更新：狀態 = "VIP"，折扣率 = 0.15
```

## ⚠️ 注意事項

1. **資料備份**
   - 處理重要資料前，請先備份原始檔案

2. **條件邏輯**
   - Filter 的多個條件預設是 AND 邏輯
   - 可以切換為 OR 邏輯

3. **列索引規則**
   - 列索引從 0 開始（0 = 第 1 列）
   - 範圍是包含首尾的（0-5 表示第 1-6 列）
   - 超出範圍的索引會被自動忽略

4. **效能考量**
   - 處理大量資料（> 10,000 筆）時，建議分批處理
   - 優先使用 Filter 減少資料量
   - Cell Update 適合精確修改，不適合大範圍批量更新

5. **資料型別**
   - 數字比較會自動轉換型別
   - 字串比較區分大小寫（除非使用 Search 的 Case Sensitive 選項）

## 🐛 疑難排解

### 問題：節點沒有出現在 n8n 中
**解決方案：**
```bash
# 確認環境變數
export N8N_COMMUNITY_PACKAGES_ENABLED=true

# 重啟 n8n
n8n stop
n8n start
```

### 問題：篩選沒有結果
**解決方案：**
- 檢查欄位名稱是否正確（區分大小寫）
- 檢查比較值的格式
- 使用 Search 功能測試資料

### 問題：更新沒有生效
**解決方案：**
- 確認 Update Conditions 是否正確
- 檢查表達式語法
- 先不加條件測試是否全部更新

### 問題：Cell Update 更新了錯誤的列
**解決方案：**
- 確認列索引是 0-based（第 1 列 = 0）
- 檢查索引格式是否正確（單一：0，範圍：0-5，多個：0,2,4）
- 使用 Table 視圖檢查資料的實際行號

### 問題：範圍更新超出預期
**解決方案：**
- 檢查輸入資料的總行數
- 範圍會自動限制在有效範圍內
- 使用 Limit 操作先確認資料筆數

### 問題：Cell Read 讀取的欄位不完整
**解決方案：**
- 檢查 Field Names 的拼寫是否正確（區分大小寫）
- 確認欄位名稱與實際資料的欄位名稱一致
- 留空 Field Names 可以讀取所有欄位進行檢查

### 問題：Cell Read 返回空結果
**解決方案：**
- 確認列索引範圍是否在資料範圍內
- 檢查資料的實際行數（可使用 Limit 模式查看）
- 驗證列索引格式是否正確（0-based）

### 問題：如何同時讀取多個不連續的範圍？
**解決方案：**
- 使用組合格式：`0-5,10-15,20-25`
- 或分多次 JSON CRUD 節點讀取，然後合併結果

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 🔗 相關資源

- [n8n 官方文檔](https://docs.n8n.io)
- [n8n 社群節點開發指南](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n 論壇](https://community.n8n.io)

## 📧 聯絡方式

如有問題或建議，請：
- 開 Issue: https://github.com/fchart/n8n-nodes-json-crud/issues
- Email: hueyan.chen@gmail.com

---

**讓 Excel 資料處理變得簡單！** 🚀