# 自動型態轉換功能說明

## 概述

JsonCrud 節點現在支援智慧型態轉換，能夠自動識別並轉換使用者在介面欄位中輸入的值。

## 支援的型態轉換

### 1. 數字 (Numbers)
- **整數**: `"123"` → `123`
- **小數**: `"4.75"` → `4.75`
- **負數**: `"-250"` → `-250`

### 2. 布林值 (Booleans)
- `"true"` → `true`
- `"false"` → `false`

### 3. 空值 (Null/Undefined)
- `"null"` → `null`
- `"undefined"` → `undefined`

### 4. 日期 (Dates)
- **ISO 日期**: `"2026-01-16"` → `Date` 物件
- **ISO 日期時間**: `"2026-01-16T10:30:00Z"` → `Date` 物件

### 5. JSON 物件和陣列
- **物件**: `'{"key": "value"}'` → `{ key: "value" }`
- **陣列**: `'["a", "b", "c"]'` → `["a", "b", "c"]`

### 6. 字串 (Strings)
- 無法轉換的值保持為字串
- 空字串保持為空字串
- 正常文字保持為字串

## 應用範圍

型態轉換功能應用於以下操作：

### Filter (篩選) 操作
- 條件值會自動轉換
- 支援數字比較、布林值比較、null 值比較等

```javascript
// 範例：篩選價格大於 75 的項目
// 輸入字串 "75" 會自動轉換為數字 75
條件: price > "75"  // 實際比較: price > 75
```

### Update (更新) 操作

#### Condition-based Update (條件更新)
- 條件值自動轉換
- 更新的值自動轉換

```javascript
// 範例：將折扣更新為 15
// 輸入字串 "15" 會自動轉換為數字 15
更新欄位: discount = "15"  // 實際儲存: discount = 15
```

#### Cell-based Update (儲存格更新)
- 新值自動轉換

```javascript
// 範例：更新庫存數量
// 輸入字串 "150" 會自動轉換為數字 150
更新儲存格: quantity = "150"  // 實際儲存: quantity = 150
```

### Delete (刪除) 操作
- 條件值自動轉換

```javascript
// 範例：刪除庫存少於 10 的項目
// 輸入字串 "10" 會自動轉換為數字 10
條件: stock < "10"  // 實際比較: stock < 10
```

## 測試覆蓋

完整的單元測試包含：

### Filter 型態轉換測試
- ✅ 字串數字轉換
- ✅ 字串布林值轉換
- ✅ 字串 null 轉換
- ✅ ISO 日期字串轉換
- ✅ 負數轉換
- ✅ 小數轉換

### Update 型態轉換測試
- ✅ 條件更新中的數字轉換
- ✅ 條件更新中的布林值轉換
- ✅ 條件更新中的 null 轉換
- ✅ 小數和負數轉換

### Cell Update 型態轉換測試
- ✅ 儲存格更新中的數字轉換
- ✅ 儲存格更新中的布林值轉換
- ✅ 儲存格更新中的 null 轉換

### Delete 型態轉換測試
- ✅ 刪除條件中的數字轉換
- ✅ 刪除條件中的布林值轉換

### 邊界情況測試
- ✅ 保持一般字串為字串
- ✅ 正確處理空字串
- ✅ JSON 物件字串轉換
- ✅ JSON 陣列字串轉換
- ✅ ISO 日期時間字串轉換
- ✅ 看似數字但實際是字串的值處理
- ✅ 值中的空白字元處理

## 實作細節

### parseValue() 函數

```typescript
private parseValue(value: any): any {
    // 1. 非字串直接返回
    if (typeof value !== 'string') {
        return value;
    }

    const trimmed = value.trim();

    // 2. 處理特殊值
    if (trimmed === '') return '';
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // 3. 處理數字
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (!isNaN(num)) return num;
    }

    // 4. 處理日期
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(trimmed)) {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) return date;
    }

    // 5. 處理 JSON
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

## 優點

1. **使用者友善**: 使用者不需要手動轉換型態
2. **減少錯誤**: 自動處理型態轉換，避免型態不匹配的錯誤
3. **直覺**: 行為符合使用者預期
4. **彈性**: 支援多種資料型態
5. **向後相容**: 不會破壞現有功能

## 範例使用場景

### 場景 1: Excel 資料處理
```javascript
// 從 Excel 匯入的數字可能是字串
// 自動轉換讓數值比較正常運作
篩選條件: salary > "50000"
結果: 正確比較數值，找出薪資大於 50000 的員工
```

### 場景 2: 批次更新布林值
```javascript
// 批次啟用所有未驗證的使用者
條件: verified = "false"
更新: verified = "true"
結果: 正確處理布林值比較和更新
```

### 場景 3: 清理空值
```javascript
// 將空值統一為 null
條件: description isEmpty
更新: description = "null"
結果: 將欄位設為 null
```

## 測試結果

```
Test Suites: 1 passed, 1 total
Tests:       74 passed, 74 total
Snapshots:   0 total
Time:        1.614 s
```

所有 74 個測試全部通過，包括：
- 原有的 CRUD 操作測試
- 新增的自動型態轉換測試
- 邊界情況測試

## 技術實作

型態轉換在以下位置被應用：

1. **handleFilter()**: 篩選條件值
2. **handleConditionUpdate()**: 更新條件值和更新值
3. **handleCellUpdate()**: 儲存格更新值
4. **handleConditionDelete()**: 刪除條件值

每個操作都使用 `parseValue()` 函數來自動轉換使用者輸入的值。
