# Version 1.1.0 Update Summary

## 🎉 New Feature: Delete by Row Index

### Feature Description
The Delete operation now supports **Row Index Delete mode**, maintaining consistent design with Update's Cell Position feature. You can precisely specify rows to delete just like in Excel.

### Usage

**Basic Operation:**
- Operation: `Delete`
- Delete Mode: `By Row Index`
- Row Index: Enter row indexes to delete

**Supported Formats:**
| Format | Description | Example |
|--------|-------------|---------|
| Single row | `0` | Delete row 1 |
| Range | `0-5` | Delete rows 1-6 |
| Multiple rows | `0,2,4` | Delete rows 1,3,5 |
| Combined | `0-2,5,7-9` | Delete rows 1-3,6,8-10 |

### Use Cases

1. **Remove Excel Header**
   ```
   Row Index: 0
   → Delete row 1 (header)
   ```

2. **Clean Test Data**
   ```
   Row Index: 0,5,10,15
   → Delete scattered test data
   ```

3. **Remove Report Note Rows**
   ```
   Row Index: 97-99
   → Delete last 3 rows
   ```

4. **Combined Delete**
   ```
   Row Index: 0-2,50-55,99
   → Delete multiple non-contiguous ranges at once
   ```

### Comparison with Conditional Delete

| Feature | By Row Index | By Condition |
|---------|--------------|--------------|
| Positioning | Row position (0-based) | Data content |
| When to use | Know exact position | Based on condition judgment |
| Use cases | Headers, fixed position errors | Resigned employees, expired records |
| Range support | ✅ Support flexible combination | ❌ Need to match conditions |

### Test Coverage

Added 6 complete unit tests:
- ✅ Delete single row
- ✅ Delete range rows
- ✅ Delete multiple non-contiguous rows
- ✅ Combined delete (range + specific rows)
- ✅ Out-of-range handling
- ✅ Conditional delete (existing feature)

**All 26 tests passed!**

### Documentation Updates

- ✅ README.md: Added detailed descriptions and examples
- ✅ CHANGELOG.md: Recorded version updates
- ✅ Unit tests: Complete test coverage
- ✅ Troubleshooting: Added FAQ

### Version Information

- **Version**: 1.0.2 → 1.1.0
- **Release Date**: 2026-01-06
- **Breaking Changes**: None (backward compatible)

---

## Try It Now

```bash
# Update to latest version
npm install n8n-nodes-json-crud@latest

# Or build from source
npm run build
npm test
```

**Start using Delete by Row Index now!** 🚀
