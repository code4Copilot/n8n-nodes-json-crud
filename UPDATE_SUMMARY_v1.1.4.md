# Version 1.1.4 Update Summary

## 🛠️ Bug Fix: Cell Position Row Index Blank

### Update Overview
This version fixes the behavior when using Cell Position to filter data:

- **Row Index Blank**: Now returns all records (previously returned an empty array).
- **Field Names Blank**: Still returns all fields.

### Key Changes
- Improved usability for Cell Position queries.
- Added unit test to verify Row Index blank returns all records.

### Upgrade
To upgrade:

   npm install n8n-nodes-json-crud@1.1.4