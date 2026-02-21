# Version 1.1.4 更新摘要

## 🛠️ 修正：Cell Position 列索引空白

### 更新說明
本版本修正 Cell Position 篩選資料時：

- **Row Index 空白**：現在會回傳全部記錄（原本會回傳空陣列）。
- **Field Names 空白**：仍回傳全部欄位。

### 主要變更
- Cell Position 查詢行為更直覺。
- 新增單元測試驗證 Row Index 空白回傳全部記錄。

### 升級方式
請執行：

   npm install n8n-nodes-json-crud@1.1.4

---
# ...existing code...