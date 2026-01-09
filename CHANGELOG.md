# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-01-09

### Added
- **Condition Field Validation**: 新增條件欄位存在性驗證
  - Update 操作在執行條件更新前，會驗證所有條件欄位是否存在
  - Delete 操作在執行條件刪除前，會驗證所有條件欄位是否存在
  - 當條件欄位不存在時，會拋出清晰的錯誤訊息，指出具體哪個欄位不存在
  - 更新欄位仍可不存在，因為可能是新增計算欄位（此行為保持不變）

### Fixed
- **Error Handling Improvement**: 改善錯誤處理機制
  - 修正條件欄位不存在時可能產生的非預期行為
  - 避免因欄位名稱拼寫錯誤導致的靜默失敗
  - 提供更明確的錯誤訊息，幫助使用者快速定位問題

### Tests
- 新增 5 個單元測試案例，涵蓋條件欄位驗證功能：
  - Update 操作：單一條件欄位不存在時的錯誤處理
  - Update 操作：多個條件欄位中有一個不存在時的錯誤處理
  - Update 操作：驗證更新欄位可不存在（新增計算欄位）
  - Delete 操作：單一條件欄位不存在時的錯誤處理
  - Delete 操作：多個條件欄位中有一個不存在時的錯誤處理

## [1.1.1] - 2026-01-XX

### Fixed
- **Case Sensitive Bug Fix**: 修正 Case Sensitive（大小寫敏感）選項相關錯誤
  - 確保所有字串比較操作都能正確處理大小寫敏感設定
  - 影響 Read、Update、Delete 操作的條件比對

## [1.1.0] - 2026-01-06

### Added
- **Delete by Row Index**: 新增列索引刪除功能，與 Update Cell Position 功能保持一致
  - 支援單一列刪除（例如：`0`）
  - 支援範圍刪除（例如：`0-5`）
  - 支援多個不連續列刪除（例如：`0,2,4`）
  - 支援組合格式刪除（例如：`0-2,5,7-9`）
- 完整的單元測試覆蓋，包含 6 個新的 Delete by Row Index 測試案例

### Changed
- Delete 操作現在提供兩種模式：
  - **By Condition**: 原有的條件刪除功能（預設）
  - **By Row Index**: 新的列索引刪除功能

### Documentation
- 更新 README.md，新增 Delete by Row Index 的詳細說明
- 新增實戰案例：清理 Excel 匯入的多餘資料
- 新增實戰案例：移除測試和異常資料
- 新增疑難排解：Delete by Row Index 相關問題

## [1.0.2] - 2025-12-XX

### Added
- 初始版本發布
- 支援 CREATE、READ、UPDATE、DELETE、REMOVE DUPLICATES、STATISTICS 操作
- Update 操作支援 Cell Position 模式
- Read 操作支援 Cell Position 模式
- 完整的單元測試覆蓋

### Features
- 12 種篩選運算子
- 支援 AND/OR 邏輯組合
- 支援表達式計算
- 分組統計功能

[1.1.2]: https://github.com/code4Copilot/n8n-nodes-json-crud/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/code4Copilot/n8n-nodes-json-crud/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/code4Copilot/n8n-nodes-json-crud/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/code4Copilot/n8n-nodes-json-crud/releases/tag/v1.0.2
