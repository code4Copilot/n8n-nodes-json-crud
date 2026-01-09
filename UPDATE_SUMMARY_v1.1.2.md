# Version 1.1.2 Update Summary

## 🛡️ New Feature: Condition Field Validation

### Update Details
This version adds **condition field existence validation**. When performing conditional update or delete operations, the system will first verify that all condition fields exist in the data. If a field doesn't exist, a clear error message will be thrown to prevent unexpected behavior caused by incorrect field names.

### New Features

#### 1. Condition Field Validation (Update Operation)
- ✅ Automatically validates all condition fields before executing conditional updates
- ✅ Throws an error immediately when a condition field doesn't exist, specifying the exact field name
- ✅ Update fields can still be non-existent (for adding calculated fields)

#### 2. Condition Field Validation (Delete Operation)
- ✅ Automatically validates all condition fields before executing conditional deletions
- ✅ Throws an error immediately when a condition field doesn't exist, specifying the exact field name

### Why This Feature?

**Problem Scenario:**
Without validation, if a condition field name is misspelled or doesn't exist:
- ❌ Update operations may not update any data (silent failure)
- ❌ Delete operations may not delete any data (silent failure)
- ❌ Users have difficulty identifying the problem

**Solution:**
- ✅ Immediately detect field name errors
- ✅ Clearly indicate which field doesn't exist
- ✅ Avoid silent failures, improve reliability

### Usage Examples

#### Example 1: Condition Field Doesn't Exist (Will Throw Error)

**Input Data:**
```json
[
  { "name": "John", "department": "Tech", "salary": 50000 },
  { "name": "Jane", "department": "Sales", "salary": 45000 }
]
```

**Update Configuration (Field Name Error):**
```json
{
  "operation": "update",
  "updateMode": "condition",
  "updateConditions": {
    "conditions": [
      {
        "field": "departmnt",  // ❌ Typo (should be department)
        "operator": "equals",
        "value": "Tech"
      }
    ]
  },
  "fieldsToUpdate": {
    "fields": [
      { "name": "salary", "value": "60000" }
    ]
  }
}
```

**Error Message:**
```
Condition field "departmnt" does not exist in any of the input items. 
Please check your condition field names.
```

#### Example 2: Update Field Can Be Non-Existent (Adding Calculated Field)

**Input Data:**
```json
[
  { "name": "John", "salary": 50000 },
  { "name": "Jane", "salary": 45000 }
]
```

**Update Configuration (Adding Calculated Field):**
```json
{
  "operation": "update",
  "updateMode": "condition",
  "updateConditions": {
    "conditions": [
      {
        "field": "salary",  // ✅ Condition field exists
        "operator": "greaterThan",
        "value": "40000"
      }
    ]
  },
  "fieldsToUpdate": {
    "fields": [
      { "name": "bonus", "value": "5000" }  // ✅ Update field can be non-existent (new field)
    ]
  }
}
```

**Execution Result:**
```json
[
  { "name": "John", "salary": 50000, "bonus": "5000" },
  { "name": "Jane", "salary": 45000, "bonus": "5000" }
]
```

#### Example 3: Delete Operation Field Validation

**Input Data:**
```json
[
  { "name": "John", "status": "Active" },
  { "name": "Jane", "status": "Inactive" }
]
```

**Delete Configuration (Field Name Error):**
```json
{
  "operation": "delete",
  "deleteMode": "condition",
  "deleteConditions": {
    "conditions": [
      {
        "field": "stats",  // ❌ Typo (should be status)
        "operator": "equals",
        "value": "Inactive"
      }
    ]
  }
}
```

**Error Message:**
```
Condition field "stats" does not exist in any of the input items. 
Please check your condition field names.
```

### Important Notes

#### ✅ Condition Fields (Must Exist)
- `field` in `updateConditions` for Update operations
- `field` in `deleteConditions` for Delete operations
- These fields are used to filter data and must exist for correct execution

#### ✅ Update Fields (Can Be Non-Existent)
- `name` in `fieldsToUpdate` for Update operations
- These fields can be newly added calculated fields, so they are allowed to be non-existent

### Test Coverage

This version adds 5 unit test cases:

1. **Update Operation: Single Condition Field Doesn't Exist**
   - Verifies that an error is thrown when a condition field doesn't exist

2. **Update Operation: One of Multiple Condition Fields Doesn't Exist**
   - Verifies that an error is thrown when one of multiple condition fields doesn't exist

3. **Update Operation: Update Field Can Be Non-Existent**
   - Verifies that update fields can be newly added calculated fields

4. **Delete Operation: Single Condition Field Doesn't Exist**
   - Verifies that an error is thrown when a condition field doesn't exist

5. **Delete Operation: One of Multiple Condition Fields Doesn't Exist**
   - Verifies that an error is thrown when one of multiple condition fields doesn't exist

### Backward Compatibility

- ✅ **100% Backward Compatible**
- ✅ All existing functionality remains unchanged
- ✅ Errors are only thrown when condition fields don't exist
- ✅ Update field behavior remains exactly the same

### Upgrade Recommendations

1. **Check Condition Field Names**: After upgrading, ensure all condition field names are spelled correctly
2. **Test Workflows**: It's recommended to validate existing workflows in a test environment first
3. **Use Error Messages**: If errors occur, use the error messages to correct field names

### Technical Details

**Validation Logic:**
```typescript
// Verify that all condition fields exist in at least one data item
for (const condition of conditions.conditions) {
  const fieldExists = items.some(item => condition.field in item.json);
  if (!fieldExists) {
    throw new NodeOperationError(
      this.getNode(),
      `Condition field "${condition.field}" does not exist in any of the input items. Please check your condition field names.`
    );
  }
}
```

### Summary

Version 1.1.2 improves reliability and user experience by adding condition field validation:
- 🛡️ **Safer**: Early detection of field name errors
- 🎯 **More Accurate**: Avoid silent failures
- 📝 **Clearer**: Provide explicit error messages
- ✅ **More Reliable**: Reduce unexpected behavior

---

**Complete Changelog:** See [CHANGELOG.md](CHANGELOG.md)
