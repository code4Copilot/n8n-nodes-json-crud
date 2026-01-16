# Version 1.1.3 更新摘要

## 🎯 新功能：自動型態轉換

### 更新概述
此版本引入了**自動型態轉換**功能，這是一個強大的功能，能夠智慧地將字串輸入轉換為適當的資料型態。使用者在節點介面中輸入值時，不再需要手動轉換型態 - 系統會自動識別並轉換數字、布林值、null 值、日期和 JSON 物件。

### 主要功能

#### 1. 智慧型態識別
系統可以自動識別並轉換以下型態：

- **數字** 🔢
  - 整數：`"123"` → `123`
  - 小數：`"4.75"` → `4.75`
  - 負數：`"-250"` → `-250`

- **布林值** ✓
  - `"true"` → `true`
  - `"false"` → `false`

- **空值** ∅
  - `"null"` → `null`
  - `"undefined"` → `undefined`

- **日期** 📅
  - ISO 日期：`"2026-01-16"` → `Date` 物件
  - ISO 日期時間：`"2026-01-16T10:30:00Z"` → `Date` 物件

- **JSON 物件/陣列** 📦
  - 物件：`'{"key": "value"}'` → `{ key: "value" }`
  - 陣列：`'["a", "b", "c"]'` → `["a", "b", "c"]`

- **字串** 📝
  - 無法轉換的值保持為字串
  - 空字串保持為空字串

#### 2. 應用範圍
型態轉換應用於：

- ✅ **篩選條件**：篩選操作中的所有比較值
- ✅ **更新條件**：條件更新中的所有條件值
- ✅ **更新值**：更新操作中設定的新值
- ✅ **儲存格更新**：基於儲存格的更新操作中的值
- ✅ **刪除條件**：刪除操作中的所有條件值

### 為什麼需要這個功能？

**之前（手動型態轉換）：**
```javascript
// 使用者必須知道確切的型態
篩選：price > 75    // 只有當 price 是數字時才能運作
篩選：price > "75"  // 字串比較 - 可能無法如預期運作
```

**現在（自動轉換）：**
```javascript
// 直接輸入值即可
篩選：price > "75"  // 自動轉換為數字 75
篩選：active = "true"  // 自動轉換為布林值 true
篩選：description = "null"  // 自動轉換為 null
```

### 使用範例

#### 範例 1：數值比較變得簡單

**輸入資料：**
```json
[
  { "name": "產品 A", "price": 100 },
  { "name": "產品 B", "price": 200 },
  { "name": "產品 C", "price": 50 }
]
```

**篩選設定：**
```json
{
  "operation": "read",
  "readMode": "filter",
  "filterConditions": {
    "conditions": [
      { "field": "price", "operator": "greaterThan", "value": "75" }
    ]
  }
}
```

**結果：**
```json
[
  { "name": "產品 A", "price": 100 },
  { "name": "產品 B", "price": 200 }
]
```
✨ 字串 `"75"` 自動轉換為數字 `75` 進行比較。

#### 範例 2：布林值更新

**輸入資料：**
```json
[
  { "name": "使用者 A", "verified": false },
  { "name": "使用者 B", "verified": false }
]
```

**更新設定：**
```json
{
  "operation": "update",
  "updateMode": "condition",
  "updateConditions": {
    "conditions": [
      { "field": "verified", "operator": "equals", "value": "false" }
    ]
  },
  "fieldsToUpdate": {
    "fields": [
      { "name": "verified", "value": "true" }
    ]
  }
}
```

**結果：**
```json
[
  { "name": "使用者 A", "verified": true },
  { "name": "使用者 B", "verified": true }
]
```
✨ `"false"`（條件）和 `"true"`（更新值）都自動轉換為布林型態。

#### 範例 3：處理 Null 值

**輸入資料：**
```json
[
  { "name": "項目 A", "description": "某些內容" },
  { "name": "項目 B", "description": null },
  { "name": "項目 C", "description": null }
]
```

**篩選設定：**
```json
{
  "operation": "read",
  "readMode": "filter",
  "filterConditions": {
    "conditions": [
      { "field": "description", "operator": "equals", "value": "null" }
    ]
  }
}
```

**結果：**
```json
[
  { "name": "項目 B", "description": null },
  { "name": "項目 C", "description": null }
]
```
✨ 字串 `"null"` 自動轉換為實際的 `null` 值。

#### 範例 4：日期比較

**輸入資料：**
```json
[
  { "name": "活動 A", "date": "2026-01-10T00:00:00.000Z" },
  { "name": "活動 B", "date": "2026-01-20T00:00:00.000Z" },
  { "name": "活動 C", "date": "2026-01-05T00:00:00.000Z" }
]
```

**篩選設定：**
```json
{
  "operation": "read",
  "readMode": "filter",
  "filterConditions": {
    "conditions": [
      { "field": "date", "operator": "greaterThan", "value": "2026-01-15" }
    ]
  }
}
```

**結果：**
```json
[
  { "name": "活動 B", "date": "2026-01-20T00:00:00.000Z" }
]
```
✨ ISO 日期字串 `"2026-01-15"` 自動轉換為 Date 物件進行比較。

#### 範例 5：更新中的 JSON 物件

**輸入資料：**
```json
[
  { "name": "項目 A", "metadata": null }
]
```

**更新設定：**
```json
{
  "operation": "update",
  "updateMode": "cell",
  "rowIndex": "0",
  "cellFieldName": "metadata",
  "cellValue": "{\"status\": \"active\", \"priority\": 5}"
}
```

**結果：**
```json
[
  { 
    "name": "項目 A", 
    "metadata": { "status": "active", "priority": 5 }
  }
]
```
✨ JSON 字串自動解析為物件。

### 實際應用場景

#### 場景 1：Excel 資料處理
從 Excel 匯入資料時，數值通常會變成字串：

```javascript
// Excel 匯入資料
{ "employee": "張三", "salary": "50000" }  // salary 是字串

// 之前：需要手動轉換
// 現在：直接篩選或更新
篩選：salary > "45000"  // 自動運作！
```

#### 場景 2：批次布林值更新
啟用多個使用者帳戶：

```javascript
// 之前：需要複雜的表達式
更新：verified = {{ true }}

// 現在：簡單的字串輸入
更新：verified = "true"  // 自動轉換為布林值
```

#### 場景 3：清理空值
統一資料集中的空值：

```javascript
// 之前：複雜的 null 處理
// 現在：簡單的字串輸入
更新：description = "null"  // 自動轉換為 null
```

### 技術實作

型態轉換由 `parseValue()` 函數處理：

```typescript
private parseValue(value: any): any {
    // 1. 非字串直接返回
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();

    // 2. 處理特殊值
    if (trimmed === '') return '';
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // 3. 處理數字（整數、小數、負數）
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (!isNaN(num)) return num;
    }

    // 4. 處理 ISO 日期字串
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(trimmed)) {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) return date;
    }

    // 5. 處理 JSON（物件和陣列）
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
            return JSON.parse(trimmed);
        } catch {
            // 解析失敗，返回字串
        }
    }

    // 6. 返回原字串
    return value;
}
```

### 完整測試

此版本包含 **28 個新的單元測試**，專門針對型態轉換：

#### Filter 操作測試（6 個測試）
- ✅ 字串數字轉換
- ✅ 字串布林值轉換
- ✅ 字串 null 轉換
- ✅ ISO 日期字串轉換
- ✅ 負數處理
- ✅ 小數處理

#### Update 操作測試（5 個測試）
- ✅ 更新中的數字轉換
- ✅ 更新中的布林值轉換
- ✅ 更新中的 null 轉換
- ✅ 小數更新
- ✅ 負數更新

#### Cell Update 測試（3 個測試）
- ✅ 儲存格更新中的數字轉換
- ✅ 儲存格更新中的布林值轉換
- ✅ 儲存格更新中的 null 轉換

#### Delete 操作測試（2 個測試）
- ✅ 刪除條件中的數字轉換
- ✅ 刪除條件中的布林值轉換

#### 邊界情況測試（12 個測試）
- ✅ 一般字串保持不變
- ✅ 空字串處理
- ✅ JSON 物件解析
- ✅ JSON 陣列解析
- ✅ ISO 日期時間轉換
- ✅ 偽數字字串保持為字串
- ✅ 空白字元處理
- 以及更多...

**測試套件總計：**
```
測試套件：1 通過，共 1 個
測試：74 通過，共 74 個
時間：~1.6 秒
```

### 優勢

1. **提升使用者體驗** 🎨
   - 不需要手動型態轉換
   - 更直覺的介面互動
   - 降低學習曲線

2. **減少錯誤** 🛡️
   - 自動型態匹配
   - 減少型態不匹配錯誤
   - 更可預測的行為

3. **提高生產力** ⚡
   - 更快的工作流程設定
   - 減少在型態轉換上花費的時間
   - 更專注於業務邏輯

4. **向後相容** ✅
   - 現有工作流程繼續運作
   - 無破壞性變更
   - 無縫升級

### 遷移注意事項

**不需要任何動作！** 這是一個非破壞性的增強功能：

- 現有工作流程將繼續如常運作
- 新工作流程將受益於自動型態轉換
- 您可以立即開始使用此功能

### 升級前後對比

#### v1.1.3 之前：
```javascript
// 需要複雜的表達式進行型態轉換
篩選：price > {{ $json.threshold }}
更新：quantity = {{ parseInt("150") }}
更新：active = {{ true }}
```

#### v1.1.3 之後：
```javascript
// 簡單、自然的值輸入
篩選：price > "75"
更新：quantity = "150"
更新：active = "true"
```

### 效能

- ⚡ **無效能影響**：型態轉換非常輕量
- 🔍 **智慧偵測**：只處理字串值
- 💪 **高效率**：使用優化的正則表達式模式

### 文件

有關型態轉換的詳細資訊：
- 查看 `TYPE_CONVERSION_FEATURE.md` 以獲取完整的功能文件
- 所有 74 個測試通過，確保可靠性

---

## 版本比較

| 功能 | v1.1.2 | v1.1.3 |
|------|--------|--------|
| 條件欄位驗證 | ✅ | ✅ |
| 列索引刪除 | ✅ | ✅ |
| **自動型態轉換** | ❌ | ✅ |
| 測試覆蓋率 | 46 個測試 | 74 個測試 |

---

## 升級指南

1. 更新到版本 1.1.3：
   ```bash
   npm install n8n-nodes-json-crud@1.1.3
   ```

2. 重新啟動您的 n8n 實例

3. 開始在工作流程中使用自動型態轉換！

---

## 需要協助？

- 📖 [完整文件](https://github.com/code4Copilot/n8n-nodes-json-crud)
- 🐛 [回報問題](https://github.com/code4Copilot/n8n-nodes-json-crud/issues)
- 💬 [討論區](https://github.com/code4Copilot/n8n-nodes-json-crud/discussions)

---

**祝您自動化愉快！🚀**
