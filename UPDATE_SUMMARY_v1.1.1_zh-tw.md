# 版本 1.1.1 更新摘要

## 🐛 錯誤修正：Case Sensitive 功能改善

### 修正內容
此版本修正了 **Case Sensitive**（大小寫敏感）選項相關的錯誤，確保所有字串比較操作都能正確處理大小寫敏感設定。

### 影響範圍

**受影響的操作：**
- **Read** 操作的條件篩選
- **Update** 操作的條件更新
- **Delete** 操作的條件刪除

**受影響的運算子：**
| 運算子 | 說明 |
|--------|------|
| `equals` | 等於 |
| `notEquals` | 不等於 |
| `contains` | 包含 |
| `notContains` | 不包含 |
| `startsWith` | 開頭是 |
| `endsWith` | 結尾是 |

### 修正說明

**修正前的問題：**
- Case Sensitive 選項在某些情況下無法正確套用
- 字串比較可能與預期的大小寫敏感行為不一致

**修正後的行為：**
- ✅ Case Sensitive = `true`：嚴格區分大小寫
  ```
  "Apple" ≠ "apple"
  "APPLE" ≠ "Apple"
  ```

- ✅ Case Sensitive = `false`：忽略大小寫（預設）
  ```
  "Apple" = "apple" = "APPLE"
  "Test" = "test" = "TEST"
  ```

### 使用範例

#### Read 操作示例

**區分大小寫查詢：**
```json
{
  "operation": "Read",
  "filters": [
    {
      "field": "name",
      "operator": "equals",
      "value": "Apple",
      "caseSensitive": true
    }
  ]
}
```
結果：只會找到 "Apple"，不會找到 "apple" 或 "APPLE"

**不區分大小寫查詢：**
```json
{
  "operation": "Read",
  "filters": [
    {
      "field": "name",
      "operator": "contains",
      "value": "apple",
      "caseSensitive": false
    }
  ]
}
```
結果：會找到 "Apple"、"apple"、"APPLE"、"Pineapple" 等

#### Update 操作示例

**區分大小寫更新：**
```json
{
  "operation": "Update",
  "condition": {
    "field": "status",
    "operator": "equals",
    "value": "Active",
    "caseSensitive": true
  },
  "updates": { "verified": true }
}
```
結果：只會更新 status = "Active" 的記錄，不會更新 "active" 或 "ACTIVE"

### 測試驗證

所有 Case Sensitive 相關的單元測試均已通過：

**Read 操作：**
- ✅ equals operator (case sensitive)
- ✅ notEquals operator (case sensitive)
- ✅ contains operator (case sensitive)
- ✅ startsWith operator (case sensitive)
- ✅ endsWith operator (case sensitive)

**Update 操作：**
- ✅ equals operator (case sensitive)
- ✅ contains operator (case sensitive)

**Delete 操作：**
- ✅ equals operator (case sensitive)
- ✅ notEquals operator (case sensitive)
- ✅ contains operator (case sensitive)

**所有 26 個測試全部通過！**

### 相容性說明

- **Breaking Changes**: 無
- **向後相容**: 完全相容
- **建議升級**: 建議所有使用 Case Sensitive 功能的用戶升級

### 版本資訊

- **版本號**: 1.1.0 → 1.1.1
- **發布日期**: 2026-01-08
- **類型**: Bug Fix（錯誤修正）

---

## 立即升級

```bash
# 更新到最新版本
npm install n8n-nodes-json-crud@latest

# 或指定版本
npm install n8n-nodes-json-crud@1.1.1
```

**享受更穩定的 Case Sensitive 功能！** 🎯
