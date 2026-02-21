# Version 1.1.5 Update Summary

## 🛠️ Enhancement: Cell Position Row Index UI

### Update Overview
This version improves the usability for Cell Position mode:

- **Row Index Blank**: Now allowed in UI, and will return all records (previously UI required a value).
- **Field Names Blank**: Still returns all fields.

### Key Changes
- Removed required constraint for Row Index in Cell Position mode.
- No change to backend logic (same as 1.1.4), but UI is now consistent.

### Upgrade
To upgrade:

   npm install n8n-nodes-json-crud@1.1.5

### Recommendation
All users should upgrade to 1.1.5 for best experience.
