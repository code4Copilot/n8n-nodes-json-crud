# n8n-nodes-json-crud

This is an n8n community node that allows you to easily perform CRUD (Create, Read, Update, Delete) operations on JSON data.

**Especially suitable for handling JSON data converted from Excel!**

## 🎯 Why Do You Need This Node?

When processing Excel files with n8n, you typically need to:
1. Use `Extract from File` to convert Excel to JSON
2. Combine multiple nodes (Filter, Edit Fields, Code, etc.) to process data
3. Use `Convert to File` to convert back to Excel

**This node simplifies Step 2**, integrating multiple operations into a single node, making it more beginner-friendly!

## ✨ Features

### 📝 CREATE
- Add single or multiple records
- Choose to prepend or append
- Support JSON format input

### 🔍 READ (Filter/Query)
- **Filter**: 12 comparison operators with AND/OR logic support
- **Sort**: Ascending or descending order
- **Search**: Full-text or field-specific search
- **Limit**: Pagination with offset support
- **By Cell Position**: Excel-like precise reading
  - Single row: `0` (row 1)
  - Range: `0-5` (rows 1-6)
  - Multiple rows: `0,2,4` (rows 1,3,5)
  - Combined: `0-2,5,7-9` (rows 1-3,6,8-10)
  - Select specific fields or read all fields

### ✏️ UPDATE
- **Conditional Update**: Batch update multiple fields based on conditions
- **Cell Update**: Excel-like A1/B2 positioning to update specific cells
  - Single row: `0` (row 1)
  - Range: `0-5` (rows 1-6)
  - Multiple rows: `0,2,4` (rows 1,3,5)
  - Combined: `0-2,5,7-9` (rows 1-3,6,8-10)
- Support expression calculations

### 🗑️ DELETE
- **Conditional Delete**: Batch delete records based on conditions
- **Row Index Delete**: Excel-like precise deletion of specific rows
  - Single row: `0` (row 1)
  - Range: `0-5` (rows 1-6)
  - Multiple rows: `0,2,4` (rows 1,3,5)
  - Combined: `0-2,5,7-9` (rows 1-3,6,8-10)
- Support multiple condition combinations
- Preserve records that don't match conditions

### 🔄 REMOVE DUPLICATES
- Remove duplicates based on specific fields
- Or compare all fields for deduplication

### 📊 STATISTICS
- Calculate count, sum, avg, min, max
- Support group statistics
- Quickly generate report data

## 📦 Installation

### Method 1: Install from npm (After publication)
```bash
npm install n8n-nodes-json-crud
```

### Method 2: Install from GitHub
```bash
cd ~/.n8n/nodes
npm install git+https://github.com/fchart/n8n-nodes-json-crud.git
```

### Method 3: Manual Installation (For development)
```bash
# 1. Clone the project
git clone https://github.com/fchart/n8n-nodes-json-crud.git
cd n8n-nodes-json-crud

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Link to n8n
npm link
cd ~/.n8n
npm link n8n-nodes-json-crud

# 5. Restart n8n
```

## 🚀 Usage Examples

### Example 1: Processing Employee Excel File

```
┌─────────────────┐
│ Read Binary File│  Read employees.xlsx
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract from    │  Convert to JSON
│ File (XLSX)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JSON CRUD       │  Operation: Filter
│ Filter Tech Dept│  Condition: Department = "Tech"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JSON CRUD       │  Operation: Update
│ 10% Raise       │  Update: Salary = Salary * 1.1
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JSON CRUD       │  Operation: Sort
│ Sort by Salary  │  Field: Salary (Descending)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Convert to File │  Convert back to Excel
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Write Binary    │  Save file
│ File            │
└─────────────────┘
```

### Example 2: Add Data

**Operation Settings:**
- Operation: `Create`
- Position: `Append`
- Data to Add:
```json
{
  "EmployeeID": "E0099",
  "Name": "John Doe",
  "Department": "Tech",
  "Salary": 50000
}
```

Or batch add:
```json
[
  {"Name": "Alice", "Department": "Sales", "Salary": 45000},
  {"Name": "Bob", "Department": "Admin", "Salary": 40000}
]
```

### Example 3: Filter Data

**Operation Settings:**
- Operation: `Read`
- Read Mode: `Filter`
- Conditions:
  - Condition 1: Department `equals` "Tech"
  - Condition 2: Salary `greater than` 45000
- Condition Logic: `AND`

Result: Returns only Tech department employees with salary > 45000

### Example 3-1: ⭐ Cell Position Read (Excel-like)

#### Scenario 1: Read all fields of a single row
**Operation Settings:**
- Operation: `Read`
- Read Mode: `By Cell Position`
- Row Index: `0` (row 1)
- Field Names: Leave empty (read all fields)

Result: Returns complete data of row 1

#### Scenario 2: Read specific fields of a range
**Operation Settings:**
- Operation: `Read`
- Read Mode: `By Cell Position`
- Row Index: `0-4` (rows 1-5)
- Field Names: `Name,Salary`

Result: Returns rows 1-5, but each row only contains Name and Salary fields

#### Scenario 3: Read multiple non-contiguous rows
**Operation Settings:**
- Operation: `Read`
- Read Mode: `By Cell Position`
- Row Index: `0,5,10` (rows 1,6,11)
- Field Names: Leave empty

Result: Returns complete data of rows 1, 6, and 11

#### Scenario 4: Extract header and data range
**Operation Settings:**
- Operation: `Read`
- Read Mode: `By Cell Position`
- Row Index: `0-2,10-12` (rows 1-3 and 11-13)
- Field Names: `Name,Department,Salary`

Result: Returns rows 1-3 and 11-13, containing only the specified three fields

### Example 4: Conditional Update

**Operation Settings:**
- Operation: `Update`
- Update Mode: `By Condition`
- Update Conditions:
  - Department `equals` "Tech"
- Fields to Update:
  - Field: Salary, Value: `{{ $json.Salary * 1.15 }}`
  - Field: UpdateDate, Value: `{{ $now }}`

Result: Tech department employee salaries increased by 15%

### Example 5: ⭐ Cell Update (Excel-like)

#### Scenario 1: Update single cell
**Operation Settings:**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0` (row 1, 0-based)
- Field Name: `Salary`
- New Value: `60000`

Result: Updates only the Salary field of row 1 to 60000

#### Scenario 2: Update range cells
**Operation Settings:**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0-4` (rows 1-5)
- Field Name: `Department`
- New Value: `Tech`

Result: Updates Department field of rows 1-5 to "Tech"

#### Scenario 3: Update multiple non-contiguous cells
**Operation Settings:**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0,2,4,6` (rows 1,3,5,7)
- Field Name: `Status`
- New Value: `Approved`

Result: Updates Status field of rows 1,3,5,7 only

#### Scenario 4: Combined range and single cells
**Operation Settings:**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0-2,5,8-10` (rows 1-3,6,9-11)
- Field Name: `Flag`
- New Value: `Important`

Result: Updates Flag field of rows 1-3,6,9-11

#### Scenario 5: Use expression to update specific rows
**Operation Settings:**
- Operation: `Update`
- Update Mode: `By Cell Position`
- Row Index: `0`
- Field Name: `Salary`
- New Value: `{{ $json.Salary * 1.2 }}`

Result: Row 1 salary increased by 20%

### Example 6: Conditional Delete

**Operation Settings:**
- Operation: `Delete`
- Delete Mode: `By Condition`
- Delete Conditions:
  - Status `equals` "Resigned"

Result: Removes all resigned employee records

### Example 6-1: ⭐ Row Index Delete (Excel-like)

#### Scenario 1: Delete single row
**Operation Settings:**
- Operation: `Delete`
- Delete Mode: `By Row Index`
- Row Index: `0` (row 1)

Result: Deletes row 1 data (usually test data or header)

#### Scenario 2: Delete range rows
**Operation Settings:**
- Operation: `Delete`
- Delete Mode: `By Row Index`
- Row Index: `5-9` (rows 6-10)

Result: Deletes rows 6-10 data

#### Scenario 3: Delete multiple non-contiguous rows
**Operation Settings:**
- Operation: `Delete`
- Delete Mode: `By Row Index`
- Row Index: `0,5,10,15` (rows 1,6,11,16)

Result: Deletes only the specified 4 rows, preserves other data

#### Scenario 4: Combined delete
**Operation Settings:**
- Operation: `Delete`
- Delete Mode: `By Row Index`
- Row Index: `0-2,10-12,20` (rows 1-3,11-13,21)

Result: Deletes rows 1-3, rows 11-13, and row 21

### Example 7: Search Functionality

**Operation Settings:**
- Operation: `Read`
- Read Mode: `Search`
- Search Field: Leave empty (search all fields)
- Search Value: "Engineer"
- Case Sensitive: false

Result: Returns records containing "Engineer" in any field

### Example 8: Group Statistics

**Operation Settings:**
- Operation: `Statistics`
- Statistics Field: `Salary`
- Group By Field: `Department`

Result:
```json
[
  {
    "group": "Tech",
    "count": 15,
    "sum": 750000,
    "avg": 50000,
    "min": 40000,
    "max": 70000
  },
  {
    "group": "Sales",
    "count": 10,
    "sum": 450000,
    "avg": 45000,
    "min": 38000,
    "max": 55000
  }
]
```

## 📚 Detailed Feature Descriptions

### Read Modes

#### Mode 1: Filter
- Filter records based on conditions
- Support multiple operators and logic combinations
- Suitable for batch filtering data matching specific conditions

#### Mode 2: Sort
- Sort by specified field
- Support ascending and descending order
- Suitable for generating rankings or ordered lists

#### Mode 3: Search
- Full-text or field-specific search
- Support case-sensitive option
- Suitable for keyword queries

#### Mode 4: Limit
- Pagination with offset support
- Suitable for batch reading when handling large datasets

#### Mode 5: By Cell Position
- Excel-like precise positioning
- Use row index (0-based) + optional field names
- Support flexible range selection

**Row Index Formats:**
| Format | Description | Example |
|--------|-------------|---------|
| Single row | `0` | Read row 1 only |
| Range | `0-5` | Read rows 1-6 |
| Multiple rows | `0,2,4` | Read rows 1,3,5 |
| Combined | `0-2,5,7-9` | Read rows 1-3,6,8-10 |

**Field Selection:**
- Leave empty: Read all fields
- Specify: Read only specified fields (comma-separated), e.g., `Name,Salary,Department`

**Use Cases:**
- Extract Excel header row
- Read specific data range for analysis
- Extract non-contiguous rows
- Extract only needed fields to reduce data volume

### Filter Supported Operators

| Operator | Description | Example |
|----------|-------------|---------|
| Equals | Equals | Department = "Tech" |
| Not Equals | Not equals | Status ≠ "Resigned" |
| Contains | Contains | Name contains "Wang" |
| Not Contains | Not contains | Position not contains "Intern" |
| Greater Than | Greater than | Salary > 40000 |
| Greater or Equal | Greater or equal | Salary >= 45000 |
| Less Than | Less than | Age < 30 |
| Less or Equal | Less or equal | Age <= 35 |
| Starts With | Starts with | EmployeeID starts with "E" |
| Ends With | Ends with | Email ends with "@company.com" |
| Is Empty | Is empty | Notes is empty |
| Is Not Empty | Is not empty | Phone is not empty |

### Update Two Modes

#### Mode 1: By Condition (Conditional Update)
- Filter records to update based on conditions
- Can update multiple fields simultaneously
- Support complex condition combinations
- Suitable for batch updating data matching specific conditions

**Use Cases:**
- Increase salary by 10% for all Tech department employees
- Update status for all active employees
- Standardize data format for matching conditions

#### Mode 2: By Cell Position
- Excel-like A1/B2 positioning
- Use row index (0-based) + field name
- Support flexible range selection

**Row Index Formats:**
| Format | Description | Example |
|--------|-------------|---------|
| Single row | `0` | Update row 1 only |
| Range | `0-5` | Update rows 1-6 |
| Multiple rows | `0,2,4` | Update rows 1,3,5 |
| Combined | `0-2,5,7-9` | Update rows 1-3,6,8-10 |

**Note:** Row index is 0-based, i.e., row 1 is 0, row 2 is 1, and so on.

**Use Cases:**
- Fix data errors in specific rows
- Update header or total rows in reports
- Mark data at specific positions
- Batch update contiguous or non-contiguous cells

### Delete Two Modes

#### Mode 1: By Condition (Conditional Delete)
- Filter records to delete based on conditions
- Support complex condition combinations (AND/OR)
- Suitable for batch deleting data matching specific conditions

**Use Cases:**
- Remove all resigned employee records
- Delete expired or invalid records
- Clear test data matching specific conditions

#### Mode 2: By Row Index
- Excel-like precise row deletion
- Use row index (0-based) to specify rows to delete
- Support flexible range selection

**Row Index Formats:**
| Format | Description | Example |
|--------|-------------|---------|
| Single row | `0` | Delete row 1 only |
| Range | `0-5` | Delete rows 1-6 |
| Multiple rows | `0,2,4` | Delete rows 1,3,5 |
| Combined | `0-2,5,7-9` | Delete rows 1-3,6,8-10 |

**Note:** Row index is 0-based, i.e., row 1 is 0, row 2 is 1, and so on.

**Use Cases:**
- Remove Excel imported header row
- Delete error data at specific positions
- Remove subtotal or note rows in reports
- Clear non-contiguous test data or anomalous records

### Update Supports Expressions

When updating field values, you can use n8n expressions:

**Important:** Expressions are evaluated **for each matching record** separately, ensuring each record uses its own values for calculation!

```javascript
// Numeric calculations
{{ $json.Salary * 1.1 }}                    // 10% raise (each record uses its own salary)
{{ $json.Price - 100 }}                     // Subtract 100
{{ $json.Quantity + 5 }}                    // Add 5

// String operations
{{ $json.Name + " (Updated)" }}             // String concatenation
{{ $json.Email.toLowerCase() }}             // Convert to lowercase
{{ $json.Code.toUpperCase() }}              // Convert to uppercase

// Date and time
{{ $now }}                                  // Current time
{{ $now.format('YYYY-MM-DD') }}             // Format date

// Conditional expressions
{{ $json.Salary > 50000 ? "High" : "Normal" }} // Ternary operator (each record evaluated independently)
{{ $json.Age >= 60 ? "Retired" : "Active" }}   // Age check

// Math functions
{{ Math.round($json.Salary * 1.1) }}        // Round
{{ Math.ceil($json.Price * 0.9) }}          // Ceiling
{{ Math.floor($json.Amount / 100) * 100 }}  // Floor to hundreds
```

**Example: Tech department 15% raise**
```
Update Mode: By Condition
Condition: Department = "Tech"
Field: Salary
Value: {{ $json.Salary * 1.15 }}

Result:
- Employee A (Tech, 50000) → 57500
- Employee B (Tech, 60000) → 69000  ✅ Each record uses its own salary for calculation
- Employee C (Sales, 45000) → 45000  (unchanged)
```

## 🔧 Comparison with Other Nodes

| Feature | Traditional Way | JSON CRUD Node |
|---------|----------------|----------------|
| Filter data | Filter node | ✅ Single node |
| Update data | Edit Fields + IF | ✅ Single node |
| Cell update | Code node + complex logic | ✅ Visual configuration |
| Delete data | Filter (reverse) | ✅ More intuitive deletion |
| Search | Code node | ✅ Built-in search |
| Statistics | Aggregate | ✅ Simpler configuration |
| Combined operations | Requires 3-5 nodes | ✅ One node chain |

## 💡 Best Practices

### 1. Complete Excel Processing Workflow
```
Read Binary File 
→ Extract from File 
→ JSON CRUD (Remove Duplicates)
→ JSON CRUD (Filter)
→ JSON CRUD (Update)
→ JSON CRUD (Sort)
→ Convert to File
→ Write Binary File
```

### 2. Data Validation Workflow
```
Extract from File
→ JSON CRUD (Filter to remove invalid data)
→ JSON CRUD (Update to standardize format)
→ JSON CRUD (Statistics to check data quality)
→ Convert to File
```

### 3. Report Generation Workflow
```
Extract from File
→ JSON CRUD (Filter time range)
→ JSON CRUD (Statistics group analysis)
→ JSON CRUD (Sort)
→ Convert to File
```

### 4. ⭐ Cell Correction Workflow
```
Extract from File
→ JSON CRUD (Update by Cell - Fix header row)
→ JSON CRUD (Update by Cell - Update specific error data)
→ JSON CRUD (Filter valid data)
→ Convert to File
```

### 5. ⭐ Cell Precise Processing Workflow (For complex Excel processing)
```
Extract from File
→ JSON CRUD (Read by Cell - Extract header)
→ JSON CRUD (Read by Cell - Extract data range)
→ JSON CRUD (Update by Cell - Fix specific errors)
→ JSON CRUD (Filter - Filter valid data)
→ JSON CRUD (Statistics - Statistical analysis)
→ Convert to File
```

### 6. Mixed Mode Workflow
```
Extract from File
→ JSON CRUD (Read by Cell - Read only needed rows and columns)
→ JSON CRUD (Filter - Further conditional filtering)
→ JSON CRUD (Update by Condition - Batch update)
→ JSON CRUD (Update by Cell - Fix special cases)
→ JSON CRUD (Sort - Sort)
→ Convert to File
```

## 🎯 Real-World Cases

### Case 1: Extract and Analyze Specific Excel Range
**Scenario:** From a large Excel file, only need to extract rows 10-50 with Name, Department, and Salary fields for analysis

**Solution:**
```
Step 1: Extract from File
- Convert Excel to JSON

Step 2: JSON CRUD (Read by Cell)
- Row Index: 9-49  (rows 10-50, 0-based)
- Field Names: Name,Department,Salary

Step 3: JSON CRUD (Statistics)
- Perform statistical analysis on extracted data
```

**Benefits:**
- Significantly reduce memory usage
- Improve processing speed
- Process only needed data

### Case 2: Excel Report Data Reorganization
**Scenario:** In Excel report, row 1 is header, rows 2-10 are current month data, rows 50-60 are last year's same period data, need to extract separately for comparison

**Solution:**
```
Step 1: JSON CRUD (Read by Cell) - Extract current month data
- Row Index: 1-9  (rows 2-10)
- Field Names: Leave empty (read all fields)
- Output to next step

Step 2: JSON CRUD (Read by Cell) - Extract last year data
- Row Index: 49-59  (rows 50-60)
- Field Names: Leave empty
- Output to next step

Step 3: Compare and analyze two datasets
```

### Case 3: Fix Excel Import Error Data
**Scenario:** In imported Excel file, row 1 (header) Department field is wrong, and rows 5-8 salaries need uniform update

**Solution:**
```
Step 1: JSON CRUD (Update by Cell)
- Row Index: 0
- Field Name: Department
- New Value: Department

Step 2: JSON CRUD (Update by Cell)
- Row Index: 4-7  (rows 5-8, 0-based)
- Field Name: Salary
- New Value: {{ $json.Salary * 1.05 }}
```

### Case 3-1: Clean Excel Import Redundant Data
**Scenario:** In imported Excel file, row 1 is header to be deleted, last 3 rows (rows 98-100) are notes also to be deleted

**Solution:**
```
Step 1: JSON CRUD (Delete by Row Index)
- Row Index: 0  (delete header)

Step 2: JSON CRUD (Delete by Row Index)  
- Row Index: 97-99  (delete last 3 rows, note index changed after deleting first row)

Or delete at once:
JSON CRUD (Delete by Row Index)
- Row Index: 0,97-99
```

### Case 3-2: Remove Test and Anomalous Data
**Scenario:** In data, rows 5, 10, 15 are test data, rows 50-55 are import anomalous data, all need to be removed

**Solution:**
```
JSON CRUD (Delete by Row Index)
- Row Index: 4,9,14,49-54  (note 0-based index)

Result: Precisely delete all specified rows at once
```

### Case 4: Batch Process Customer Data
**Scenario:** Need to mark specific customers' status as "VIP" and update their discount rate

**Solution:**
```
Step 1: JSON CRUD (Filter)
- Filter target customers

Step 2: JSON CRUD (Update by Condition)
- Condition: CustomerLevel = "Platinum"
- Update: Status = "VIP", DiscountRate = 0.15
```

## ⚠️ Notes

1. **Data Backup**
   - Always backup original files before processing important data

2. **Condition Logic**
   - Multiple conditions in Filter default to AND logic
   - Can switch to OR logic

3. **Row Index Rules**
   - Row index starts from 0 (0 = row 1)
   - Range is inclusive (0-5 means rows 1-6)
   - Out-of-range indexes are automatically ignored

4. **Performance Considerations**
   - When processing large datasets (> 10,000 records), consider batch processing
   - Use Filter first to reduce data volume
   - Cell Update is suitable for precise modifications, not large-scale batch updates

5. **Data Types**
   - Numeric comparisons automatically convert types
   - String comparisons are case-sensitive (unless using Search's Case Sensitive option)

## 🐛 Troubleshooting

### Issue: Node doesn't appear in n8n
**Solution:**
```bash
# Confirm environment variables
export N8N_COMMUNITY_PACKAGES_ENABLED=true

# Restart n8n
n8n stop
n8n start
```

### Issue: Filter returns no results
**Solution:**
- Check if field names are correct (case-sensitive)
- Check comparison value format
- Use Search functionality to test data

### Issue: Update doesn't take effect
**Solution:**
- Verify Update Conditions are correct
- Check expression syntax
- Test with no conditions to see if all updates work

### Issue: Cell Update updates wrong rows
**Solution:**
- Confirm row index is 0-based (row 1 = 0)
- Check index format is correct (single: 0, range: 0-5, multiple: 0,2,4)
- Use Table view to check actual row numbers in data

### Issue: Range update exceeds expectations
**Solution:**
- Check total row count in input data
- Range is automatically limited to valid range
- Use Limit operation to confirm record count first

### Issue: Cell Read returns incomplete fields
**Solution:**
- Check Field Names spelling is correct (case-sensitive)
- Confirm field names match actual data field names
- Leave Field Names empty to read all fields for inspection

### Issue: Cell Read returns empty results
**Solution:**
- Confirm row index range is within data range
- Check actual row count in data (can use Limit mode to view)
- Verify row index format is correct (0-based)

### Issue: How to read multiple non-contiguous ranges simultaneously?
**Solution:**
- Use combined format: `0-5,10-15,20-25`
- Or use multiple JSON CRUD nodes to read separately, then merge results

### Issue: Delete by Row Index - do indexes change after deletion?
**Solution:**
- Yes, delete operation immediately changes subsequent row indexes
- Recommend specifying all rows to delete at once (using combined format)
- If deleting in steps, delete from bottom to top (delete larger indexes first)

### Issue: How to delete Excel header row?
**Solution:**
```
JSON CRUD (Delete by Row Index)
- Delete Mode: By Row Index
- Row Index: 0

This deletes row 1 (usually the header)
```

### Issue: How to choose between Delete by Row Index and Delete by Condition?
**Solution:**
- **Use Row Index**: When you know exact row positions to delete
  - E.g., delete header, delete error data at specific positions
- **Use Condition**: When you need to determine based on data content
  - E.g., delete all resigned employees, delete expired records

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

## 🔗 Related Resources

- [n8n Official Documentation](https://docs.n8n.io)
- [n8n Community Node Development Guide](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Forum](https://community.n8n.io)

## 📧 Contact

For questions or suggestions:
- Open an Issue: https://github.com/code4Copilot/n8n-nodes-json-crud/issues
- Email: hueyan.chen@gmail.com

---

**Make Excel data processing simple!** 🚀
