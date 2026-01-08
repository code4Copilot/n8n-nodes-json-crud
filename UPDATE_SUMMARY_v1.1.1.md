# Version 1.1.1 Update Summary

## 🐛 Bug Fix: Case Sensitive Feature Improvement

### Fix Details
This version fixes bugs related to the **Case Sensitive** option, ensuring all string comparison operations correctly handle case sensitivity settings.

### Affected Scope

**Affected Operations:**
- **Read** operation's conditional filtering
- **Update** operation's conditional updates
- **Delete** operation's conditional deletion

**Affected Operators:**
| Operator | Description |
|----------|-------------|
| `equals` | Equals |
| `notEquals` | Not equals |
| `contains` | Contains |
| `notContains` | Not contains |
| `startsWith` | Starts with |
| `endsWith` | Ends with |

### Fix Description

**Problem Before Fix:**
- Case Sensitive option couldn't be correctly applied in some cases
- String comparisons might not behave consistently with expected case sensitivity

**Behavior After Fix:**
- ✅ Case Sensitive = `true`: Strictly distinguish case
  ```
  "Apple" ≠ "apple"
  "APPLE" ≠ "Apple"
  ```

- ✅ Case Sensitive = `false`: Ignore case (default)
  ```
  "Apple" = "apple" = "APPLE"
  "Test" = "test" = "TEST"
  ```

### Usage Examples

#### Read Operation Example

**Case-sensitive query:**
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
Result: Will only find "Apple", not "apple" or "APPLE"

**Case-insensitive query:**
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
Result: Will find "Apple", "apple", "APPLE", "Pineapple", etc.

#### Update Operation Example

**Case-sensitive update:**
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
Result: Will only update records with status = "Active", not "active" or "ACTIVE"

### Test Verification

All Case Sensitive related unit tests passed:

**Read Operations:**
- ✅ equals operator (case sensitive)
- ✅ notEquals operator (case sensitive)
- ✅ contains operator (case sensitive)
- ✅ startsWith operator (case sensitive)
- ✅ endsWith operator (case sensitive)

**Update Operations:**
- ✅ equals operator (case sensitive)
- ✅ contains operator (case sensitive)

**Delete Operations:**
- ✅ equals operator (case sensitive)
- ✅ notEquals operator (case sensitive)
- ✅ contains operator (case sensitive)

**All 26 tests passed!**

### Compatibility Notes

- **Breaking Changes**: None
- **Backward Compatible**: Fully compatible
- **Upgrade Recommendation**: Recommended for all users using Case Sensitive feature

### Version Information

- **Version**: 1.1.0 → 1.1.1
- **Release Date**: 2026-01-08
- **Type**: Bug Fix

---

## Upgrade Now

```bash
# Update to latest version
npm install n8n-nodes-json-crud@latest

# Or specify version
npm install n8n-nodes-json-crud@1.1.1
```

**Enjoy more stable Case Sensitive functionality!** 🎯
