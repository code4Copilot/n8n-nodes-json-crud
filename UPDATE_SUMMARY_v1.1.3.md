# Version 1.1.3 Update Summary

## 🎯 New Feature: Automatic Type Conversion

### Update Overview
This version introduces **Automatic Type Conversion**, a powerful feature that intelligently converts string inputs to their appropriate data types. Users no longer need to manually convert types when entering values in the node interface - the system automatically recognizes and converts numbers, booleans, null values, dates, and JSON objects.

### Key Features

#### 1. Intelligent Type Recognition
The system can automatically identify and convert the following types:

- **Numbers** 🔢
  - Integers: `"123"` → `123`
  - Decimals: `"4.75"` → `4.75`
  - Negative numbers: `"-250"` → `-250`

- **Booleans** ✓
  - `"true"` → `true`
  - `"false"` → `false`

- **Null Values** ∅
  - `"null"` → `null`
  - `"undefined"` → `undefined`

- **Dates** 📅
  - ISO dates: `"2026-01-16"` → `Date` object
  - ISO datetime: `"2026-01-16T10:30:00Z"` → `Date` object

- **JSON Objects/Arrays** 📦
  - Objects: `'{"key": "value"}'` → `{ key: "value" }`
  - Arrays: `'["a", "b", "c"]'` → `["a", "b", "c"]`

- **Strings** 📝
  - Values that cannot be converted remain as strings
  - Empty strings remain as empty strings

#### 2. Application Scope
Type conversion is applied to:

- ✅ **Filter conditions**: All comparison values in filter operations
- ✅ **Update conditions**: All condition values in conditional updates
- ✅ **Update values**: New values being set in update operations
- ✅ **Cell updates**: Values in cell-based update operations
- ✅ **Delete conditions**: All condition values in delete operations

### Why This Feature?

**Before (Manual Type Conversion):**
```javascript
// Users had to know the exact type
Filter: price > 75    // Works only if price is a number
Filter: price > "75"  // String comparison - may not work as expected
```

**After (Automatic Conversion):**
```javascript
// Just enter the value naturally
Filter: price > "75"  // Automatically converts to number 75
Filter: active = "true"  // Automatically converts to boolean true
Filter: description = "null"  // Automatically converts to null
```

### Usage Examples

#### Example 1: Numeric Comparisons Made Easy

**Input Data:**
```json
[
  { "name": "Product A", "price": 100 },
  { "name": "Product B", "price": 200 },
  { "name": "Product C", "price": 50 }
]
```

**Filter Configuration:**
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

**Result:**
```json
[
  { "name": "Product A", "price": 100 },
  { "name": "Product B", "price": 200 }
]
```
✨ The string `"75"` is automatically converted to number `75` for comparison.

#### Example 2: Boolean Value Updates

**Input Data:**
```json
[
  { "name": "User A", "verified": false },
  { "name": "User B", "verified": false }
]
```

**Update Configuration:**
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

**Result:**
```json
[
  { "name": "User A", "verified": true },
  { "name": "User B", "verified": true }
]
```
✨ Both `"false"` (condition) and `"true"` (update value) are automatically converted to boolean types.

#### Example 3: Working with Null Values

**Input Data:**
```json
[
  { "name": "Item A", "description": "Something" },
  { "name": "Item B", "description": null },
  { "name": "Item C", "description": null }
]
```

**Filter Configuration:**
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

**Result:**
```json
[
  { "name": "Item B", "description": null },
  { "name": "Item C", "description": null }
]
```
✨ The string `"null"` is automatically converted to actual `null` value.

#### Example 4: Date Comparisons

**Input Data:**
```json
[
  { "name": "Event A", "date": "2026-01-10T00:00:00.000Z" },
  { "name": "Event B", "date": "2026-01-20T00:00:00.000Z" },
  { "name": "Event C", "date": "2026-01-05T00:00:00.000Z" }
]
```

**Filter Configuration:**
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

**Result:**
```json
[
  { "name": "Event B", "date": "2026-01-20T00:00:00.000Z" }
]
```
✨ The ISO date string `"2026-01-15"` is automatically converted to a Date object for comparison.

#### Example 5: JSON Objects in Updates

**Input Data:**
```json
[
  { "name": "Item A", "metadata": null }
]
```

**Update Configuration:**
```json
{
  "operation": "update",
  "updateMode": "cell",
  "rowIndex": "0",
  "cellFieldName": "metadata",
  "cellValue": "{\"status\": \"active\", \"priority\": 5}"
}
```

**Result:**
```json
[
  { 
    "name": "Item A", 
    "metadata": { "status": "active", "priority": 5 }
  }
]
```
✨ The JSON string is automatically parsed into an object.

### Real-World Use Cases

#### Use Case 1: Excel Data Processing
When importing data from Excel, numeric values often come as strings:

```javascript
// Excel import data
{ "employee": "John", "salary": "50000" }  // salary is string

// Before: Manual conversion needed
// After: Just filter or update directly
Filter: salary > "45000"  // Automatically works!
```

#### Use Case 2: Batch Boolean Updates
Activating multiple user accounts:

```javascript
// Before: Complex expression evaluation
Update: verified = {{ true }}

// After: Simple string input
Update: verified = "true"  // Auto-converts to boolean
```

#### Use Case 3: Cleaning Null Values
Standardizing empty values across your dataset:

```javascript
// Before: Complex null handling
// After: Simple string input
Update: description = "null"  // Auto-converts to null
```

### Technical Implementation

The type conversion is handled by the `parseValue()` function:

```typescript
private parseValue(value: any): any {
    // 1. Non-strings returned as-is
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();

    // 2. Handle special values
    if (trimmed === '') return '';
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // 3. Handle numbers (integers, decimals, negative)
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (!isNaN(num)) return num;
    }

    // 4. Handle ISO date strings
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(trimmed)) {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) return date;
    }

    // 5. Handle JSON (objects and arrays)
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
            return JSON.parse(trimmed);
        } catch {
            // Parsing failed, return as string
        }
    }

    // 6. Return original string
    return value;
}
```

### Comprehensive Testing

This release includes **28 new unit tests** specifically for type conversion:

#### Filter Operation Tests (6 tests)
- ✅ String number conversion
- ✅ String boolean conversion
- ✅ String null conversion
- ✅ ISO date string conversion
- ✅ Negative number handling
- ✅ Decimal number handling

#### Update Operation Tests (5 tests)
- ✅ Number conversion in updates
- ✅ Boolean conversion in updates
- ✅ Null conversion in updates
- ✅ Decimal number updates
- ✅ Negative number updates

#### Cell Update Tests (3 tests)
- ✅ Number conversion in cell updates
- ✅ Boolean conversion in cell updates
- ✅ Null conversion in cell updates

#### Delete Operation Tests (2 tests)
- ✅ Number conversion in delete conditions
- ✅ Boolean conversion in delete conditions

#### Edge Cases Tests (12 tests)
- ✅ Regular strings remain unchanged
- ✅ Empty string handling
- ✅ JSON object parsing
- ✅ JSON array parsing
- ✅ ISO datetime conversion
- ✅ Pseudo-numeric strings remain as strings
- ✅ Whitespace handling
- And more...

**Total Test Suite:**
```
Test Suites: 1 passed, 1 total
Tests:       74 passed, 74 total
Time:        ~1.6s
```

### Benefits

1. **Enhanced User Experience** 🎨
   - No need for manual type conversion
   - More intuitive interface interaction
   - Reduced learning curve

2. **Fewer Errors** 🛡️
   - Automatic type matching
   - Reduced type mismatch errors
   - More predictable behavior

3. **Improved Productivity** ⚡
   - Faster workflow configuration
   - Less time spent on type conversions
   - More focus on business logic

4. **Backward Compatible** ✅
   - Existing workflows continue to work
   - No breaking changes
   - Seamless upgrade

### Migration Notes

**No action required!** This is a non-breaking enhancement:

- Existing workflows will continue to work as before
- New workflows benefit from automatic type conversion
- You can start using the feature immediately

### Examples Before and After

#### Before v1.1.3:
```javascript
// Complex expressions needed for type conversion
Filter: price > {{ $json.threshold }}
Update: quantity = {{ parseInt("150") }}
Update: active = {{ true }}
```

#### After v1.1.3:
```javascript
// Simple, natural value entry
Filter: price > "75"
Update: quantity = "150"
Update: active = "true"
```

### Performance

- ⚡ **No performance impact**: Type conversion is lightweight
- 🔍 **Smart detection**: Only processes string values
- 💪 **Efficient**: Uses optimized regex patterns

### Documentation

For detailed information about type conversion:
- See `TYPE_CONVERSION_FEATURE.md` for complete feature documentation
- All 74 tests pass, ensuring reliability

---

## Version Comparison

| Feature | v1.1.2 | v1.1.3 |
|---------|--------|--------|
| Condition Field Validation | ✅ | ✅ |
| Delete by Row Index | ✅ | ✅ |
| **Automatic Type Conversion** | ❌ | ✅ |
| Test Coverage | 46 tests | 74 tests |

---

## Upgrade Instructions

1. Update to version 1.1.3:
   ```bash
   npm install n8n-nodes-json-crud@1.1.3
   ```

2. Restart your n8n instance

3. Start using automatic type conversion in your workflows!

---

## Need Help?

- 📖 [Full Documentation](https://github.com/code4Copilot/n8n-nodes-json-crud)
- 🐛 [Report Issues](https://github.com/code4Copilot/n8n-nodes-json-crud/issues)
- 💬 [Discussions](https://github.com/code4Copilot/n8n-nodes-json-crud/discussions)

---

**Happy automating! 🚀**
