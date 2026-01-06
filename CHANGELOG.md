# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: https://github.com/code4Copilot/n8n-nodes-json-crud/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/code4Copilot/n8n-nodes-json-crud/releases/tag/v1.0.2
