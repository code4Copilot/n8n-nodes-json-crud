import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class JsonCrud implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'JSON CRUD',
		name: 'jsonCrud',
		icon: 'file:jsoncrud.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Perform CRUD operations on JSON data (perfect for Excel data)',
		defaults: {
			name: 'JSON CRUD',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Create', value: 'create', action: 'Create new records' },
					{ name: 'Read', value: 'read', action: 'Read and filter records' },
					{ name: 'Update', value: 'update', action: 'Update records' },
					{ name: 'Delete', value: 'delete', action: 'Delete records' },
					{ name: 'Remove Duplicates', value: 'removeDuplicates', action: 'Remove duplicate records' },
					{ name: 'Statistics', value: 'statistics', action: 'Calculate statistics' },
				],
				default: 'read',
			},
			{
				displayName: 'Data to Add',
				name: 'dataToAdd',
				type: 'json',
				displayOptions: { show: { operation: ['create'] } },
				default: '{\n  "field1": "value1"\n}',
				required: true,
				description: 'Data to add. You can drag and drop entire {} nodes from the left panel.',
			},
			{
				displayName: 'Position',
				name: 'position',
				type: 'options',
				displayOptions: { show: { operation: ['create'] } },
				options: [
					{ name: 'Append', value: 'append' },
					{ name: 'Prepend', value: 'prepend' },
				],
				default: 'append',
			},
			{
				displayName: 'Read Mode',
				name: 'readMode',
				type: 'options',
				displayOptions: { show: { operation: ['read'] } },
				options: [
					{ name: 'Filter', value: 'filter', description: 'Filter records by conditions' },
					{ name: 'Sort', value: 'sort', description: 'Sort records by field' },
					{ name: 'Search', value: 'search', description: 'Search records by keyword' },
					{ name: 'Limit', value: 'limit', description: 'Limit number of records' },
					{ name: 'By Cell Position', value: 'cell', description: 'Read specific cells like Excel (A1, B2)' },
				],
				default: 'filter',
			},
			{
				displayName: 'Row Index',
				name: 'readRowIndex',
				type: 'string',
				displayOptions: { show: { operation: ['read'], readMode: ['cell'] } },
				default: '0',
				required: true,
				description: 'Row index to read (0-based). Supports single (0), range (0-5), or multiple (0,2,4)',
				placeholder: 'e.g., 0 or 0-5 or 0,2,4',
			},
			{
				displayName: 'Field Names',
				name: 'readFieldNames',
				type: 'string',
				displayOptions: { show: { operation: ['read'], readMode: ['cell'] } },
				default: '',
				description: 'Comma-separated field names to read. Leave empty to read all fields',
				placeholder: 'e.g., name,age,department',
			},
			{
				displayName: 'Filter Conditions',
				name: 'filterConditions',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['read'], readMode: ['filter'] } },
				default: {},
				options: [
					{
						name: 'conditions',
						displayName: 'Condition',
						values: [
							{ displayName: 'Field Name', name: 'field', type: 'string', default: '' },
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Equals', value: 'equals' },
									{ name: 'Not Equals', value: 'notEquals' },
									{ name: 'Contains', value: 'contains' },
									{ name: 'Not Contains', value: 'notContains' },
									{ name: 'Greater Than', value: 'greaterThan' },
									{ name: 'Greater or Equal', value: 'greaterOrEqual' },
									{ name: 'Less Than', value: 'lessThan' },
									{ name: 'Less or Equal', value: 'lessOrEqual' },
									{ name: 'Starts With', value: 'startsWith' },
									{ name: 'Ends With', value: 'endsWith' },
									{ name: 'Is Empty', value: 'isEmpty' },
									{ name: 'Is Not Empty', value: 'isNotEmpty' },
								],
								default: 'equals',
							},
							{ displayName: 'Value', name: 'value', type: 'string', default: '', displayOptions: { hide: { operator: ['isEmpty', 'isNotEmpty'] } } },
						],
					},
				],
			},
			{
				displayName: 'Condition Logic',
				name: 'conditionLogic',
				type: 'options',
				displayOptions: { show: { operation: ['read'], readMode: ['filter'] } },
				options: [
					{ name: 'AND', value: 'and' },
					{ name: 'OR', value: 'or' },
				],
				default: 'and',
			},
			{
				displayName: 'Case Sensitive',
				name: 'filterCaseSensitive',
				type: 'boolean',
				displayOptions: { show: { operation: ['read'], readMode: ['filter'] } },
				default: false,
				description: 'Whether string comparisons should be case sensitive',
			},
			{
				displayName: 'Sort Field',
				name: 'sortField',
				type: 'string',
				displayOptions: { show: { operation: ['read'], readMode: ['sort'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				displayOptions: { show: { operation: ['read'], readMode: ['sort'] } },
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'asc',
			},
			{
				displayName: 'Search Field',
				name: 'searchField',
				type: 'string',
				displayOptions: { show: { operation: ['read'], readMode: ['search'] } },
				default: '',
				description: 'Leave empty to search all fields',
			},
			{
				displayName: 'Search Value',
				name: 'searchValue',
				type: 'string',
				displayOptions: { show: { operation: ['read'], readMode: ['search'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Case Sensitive',
				name: 'caseSensitive',
				type: 'boolean',
				displayOptions: { show: { operation: ['read'], readMode: ['search'] } },
				default: false,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { operation: ['read'], readMode: ['limit'] } },
				default: 10,
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				displayOptions: { show: { operation: ['read'], readMode: ['limit'] } },
				default: 0,
			},
			{
				displayName: 'Update Mode',
				name: 'updateMode',
				type: 'options',
				displayOptions: { show: { operation: ['update'] } },
				options: [
					{ name: 'By Condition', value: 'condition', description: 'Update records that match conditions' },
					{ name: 'By Cell Position', value: 'cell', description: 'Update specific cells like Excel (A1, B2)' },
				],
				default: 'condition',
			},
			{
				displayName: 'Row Index',
				name: 'rowIndex',
				type: 'string',
				displayOptions: { show: { operation: ['update'], updateMode: ['cell'] } },
				default: '0',
				required: true,
				description: 'Row index to update (0-based). Supports single (0), range (0-5), or multiple (0,2,4)',
				placeholder: 'e.g., 0 or 0-5 or 0,2,4',
			},
			{
				displayName: 'Field Name',
				name: 'cellFieldName',
				type: 'string',
				displayOptions: { show: { operation: ['update'], updateMode: ['cell'] } },
				default: '',
				required: true,
				description: 'The field name to update',
				placeholder: 'e.g., salary, department',
			},
			{
				displayName: 'New Value',
				name: 'cellValue',
				type: 'string',
				displayOptions: { show: { operation: ['update'], updateMode: ['cell'] } },
				default: '',
				required: true,
				description: 'New value for the cell. Supports expressions like {{ $json.salary * 1.1 }}',
			},
			{
				displayName: 'Update Conditions',
				name: 'updateConditions',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['update'], updateMode: ['condition'] } },
				default: {},
				options: [
					{
						name: 'conditions',
						displayName: 'Condition',
						values: [
							{ displayName: 'Field Name', name: 'field', type: 'string', default: '' },
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Equals', value: 'equals' },
									{ name: 'Not Equals', value: 'notEquals' },
									{ name: 'Contains', value: 'contains' },
									{ name: 'Not Contains', value: 'notContains' },
									{ name: 'Greater Than', value: 'greaterThan' },
									{ name: 'Greater or Equal', value: 'greaterOrEqual' },
									{ name: 'Less Than', value: 'lessThan' },
									{ name: 'Less or Equal', value: 'lessOrEqual' },
									{ name: 'Starts With', value: 'startsWith' },
									{ name: 'Ends With', value: 'endsWith' },
									{ name: 'Is Empty', value: 'isEmpty' },
									{ name: 'Is Not Empty', value: 'isNotEmpty' },
								],
								default: 'equals',
							},
							{ displayName: 'Value', name: 'value', type: 'string', default: '', displayOptions: { hide: { operator: ['isEmpty', 'isNotEmpty'] } } },
						],
					},
				],
			},
			{
				displayName: 'Condition Logic',
				name: 'updateConditionLogic',
				type: 'options',
				displayOptions: { show: { operation: ['update'], updateMode: ['condition'] } },
				options: [
					{ name: 'AND', value: 'and' },
					{ name: 'OR', value: 'or' },
				],
				default: 'and',
				description: 'How to combine multiple conditions',
			},
			{
				displayName: 'Case Sensitive',
				name: 'updateCaseSensitive',
				type: 'boolean',
				displayOptions: { show: { operation: ['update'], updateMode: ['condition'] } },
				default: false,
				description: 'Whether string comparisons should be case sensitive',
			},
			{
				displayName: 'Fields to Update',
				name: 'fieldsToUpdate',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['update'], updateMode: ['condition'] } },
				default: {},
				options: [
					{
						name: 'fields',
						displayName: 'Field',
						values: [
							{ displayName: 'Field Name', name: 'name', type: 'string', default: '' },
							{ displayName: 'Value', name: 'value', type: 'string', default: '' },
						],
					},
				],
			},
			{
				displayName: 'Delete Mode',
				name: 'deleteMode',
				type: 'options',
				displayOptions: { show: { operation: ['delete'] } },
				options: [
					{ name: 'By Condition', value: 'condition', description: 'Delete records that match conditions' },
					{ name: 'By Row Index', value: 'rowIndex', description: 'Delete specific rows by index' },
				],
				default: 'condition',
			},
			{
				displayName: 'Row Index',
				name: 'deleteRowIndex',
				type: 'string',
				displayOptions: { show: { operation: ['delete'], deleteMode: ['rowIndex'] } },
				default: '0',
				required: true,
				description: 'Row index to delete (0-based). Supports single (0), range (0-5), or multiple (0,2,4)',
				placeholder: 'e.g., 0 or 0-5 or 0,2,4',
			},
			{
				displayName: 'Delete Conditions',
				name: 'deleteConditions',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['delete'], deleteMode: ['condition'] } },
				default: {},
				options: [
					{
						name: 'conditions',
						displayName: 'Condition',
						values: [
							{ displayName: 'Field Name', name: 'field', type: 'string', default: '' },
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Equals', value: 'equals' },
									{ name: 'Not Equals', value: 'notEquals' },
									{ name: 'Contains', value: 'contains' },
									{ name: 'Not Contains', value: 'notContains' },
									{ name: 'Greater Than', value: 'greaterThan' },
									{ name: 'Greater or Equal', value: 'greaterOrEqual' },
									{ name: 'Less Than', value: 'lessThan' },
									{ name: 'Less or Equal', value: 'lessOrEqual' },
									{ name: 'Starts With', value: 'startsWith' },
									{ name: 'Ends With', value: 'endsWith' },
									{ name: 'Is Empty', value: 'isEmpty' },
									{ name: 'Is Not Empty', value: 'isNotEmpty' },
								],
								default: 'equals',
							},
							{ displayName: 'Value', name: 'value', type: 'string', default: '', displayOptions: { hide: { operator: ['isEmpty', 'isNotEmpty'] } } },
						],
					},
				],
			},
			{
				displayName: 'Condition Logic',
				name: 'deleteConditionLogic',
				type: 'options',
				displayOptions: { show: { operation: ['delete'], deleteMode: ['condition'] } },
				options: [
					{ name: 'AND', value: 'and' },
					{ name: 'OR', value: 'or' },
				],
				default: 'and',
				description: 'How to combine multiple conditions',
			},
			{
				displayName: 'Case Sensitive',
				name: 'deleteCaseSensitive',
				type: 'boolean',
				displayOptions: { show: { operation: ['delete'], deleteMode: ['condition'] } },
				default: false,
				description: 'Whether string comparisons should be case sensitive',
			},
			{
				displayName: 'Unique Fields',
				name: 'uniqueFields',
				type: 'string',
				displayOptions: { show: { operation: ['removeDuplicates'] } },
				default: '',
				description: 'Comma-separated field names',
			},
			{
				displayName: 'Statistics Field',
				name: 'statsField',
				type: 'string',
				displayOptions: { show: { operation: ['statistics'] } },
				default: '',
			},
			{
				displayName: 'Group By Field',
				name: 'groupByField',
				type: 'string',
				displayOptions: { show: { operation: ['statistics'] } },
				default: '',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;
		let returnData: INodeExecutionData[] = [];

		// Use instance method to ensure proper context binding
		const instance = new JsonCrud();

		try {
			switch (operation) {
				case 'create':
					returnData = await instance.handleCreate.call(this, items);
					break;
				case 'read':
					returnData = await instance.handleRead.call(this, items);
					break;
				case 'update':
					returnData = await instance.handleUpdate.call(this, items);
					break;
				case 'delete':
					returnData = await instance.handleDelete.call(this, items);
					break;
				case 'removeDuplicates':
					returnData = await instance.handleRemoveDuplicates.call(this, items);
					break;
				case 'statistics':
					returnData = await instance.handleStatistics.call(this, items);
					break;
				default:
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
			}
		} catch (error) {
			throw new NodeOperationError(this.getNode(), (error as Error).message);
		}

		return [returnData];
	}

	/**
	 * Core fix: Intelligent input parsing
	 * Resolves the issue of not being able to drag entire objects
	 */
	private simplifyInput(input: any): any {
		// 1. Handle manually written JSON strings
		if (typeof input === 'string') {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		}

		// 2. Handle dragged node case (n8n wraps it in a json key)
		// If input is an object and contains a 'json' key, extract its content
		if (input && typeof input === 'object' && !Array.isArray(input)) {
			if ('json' in input) {
				return input.json;
			}
		}

		return input;
	}

	private async handleCreate(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
		const instance = new JsonCrud();
		// Don't specify type here, let simplifyInput handle it
		const rawData = this.getNodeParameter('dataToAdd', 0);
		const dataToAdd = instance.simplifyInput(rawData);
		const position = this.getNodeParameter('position', 0) as string;

		if (!dataToAdd) {
			throw new NodeOperationError(this.getNode(), 'Unable to parse data to add. Please ensure JSON format is correct.');
		}

		const newItems = Array.isArray(dataToAdd)
			? dataToAdd.map((item: any) => ({ json: item }))
			: [{ json: dataToAdd }];

		return position === 'append' ? [...items, ...newItems] : [...newItems, ...items];
	}

	private async handleRead(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
		const readMode = this.getNodeParameter('readMode', 0) as string;
		const instance = new JsonCrud();
		switch (readMode) {
			case 'filter': return instance.handleFilter.call(this, items);
			case 'sort': return instance.handleSort.call(this, items);
			case 'search': return instance.handleSearch.call(this, items);
			case 'limit': return instance.handleLimit.call(this, items);
			case 'cell': return instance.handleCellRead.call(this, items);
			default: return items;
		}
	}

	private handleFilter(this: IExecuteFunctions, items: INodeExecutionData[]): INodeExecutionData[] {
		const filterConditions = this.getNodeParameter('filterConditions', 0) as any;
		const conditionLogic = this.getNodeParameter('conditionLogic', 0) as string;
		const caseSensitive = this.getNodeParameter('filterCaseSensitive', 0) as boolean;
		
		if (!filterConditions.conditions?.length) return items;

		return items.filter((item) => {
			const results = filterConditions.conditions.map((c: any) => {
				const val = item.json[c.field];
				const compareVal = c.value;
				
				switch (c.operator) {
					case 'equals': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive
							? valStr === compareStr
							: valStr.toLowerCase() === compareStr.toLowerCase();
					}
					case 'notEquals': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive
							? valStr !== compareStr
							: valStr.toLowerCase() !== compareStr.toLowerCase();
					}
					case 'contains': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive 
							? valStr.includes(compareStr)
							: valStr.toLowerCase().includes(compareStr.toLowerCase());
					}
					case 'notContains': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive 
							? !valStr.includes(compareStr)
							: !valStr.toLowerCase().includes(compareStr.toLowerCase());
					}
					case 'greaterThan': 
						return Number(val) > Number(compareVal);
					case 'greaterOrEqual': 
						return Number(val) >= Number(compareVal);
					case 'lessThan': 
						return Number(val) < Number(compareVal);
					case 'lessOrEqual': 
						return Number(val) <= Number(compareVal);
					case 'startsWith': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive 
							? valStr.startsWith(compareStr)
							: valStr.toLowerCase().startsWith(compareStr.toLowerCase());
					}
					case 'endsWith': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive 
							? valStr.endsWith(compareStr)
							: valStr.toLowerCase().endsWith(compareStr.toLowerCase());
					}
					case 'isEmpty': 
						return !val || val === '' || val === null || val === undefined;
					case 'isNotEmpty': 
						return val && val !== '' && val !== null && val !== undefined;
					default: 
						return false;
				}
			});
			return conditionLogic === 'and' ? results.every((r: boolean) => r) : results.some((r: boolean) => r);
		});
	}

	private handleSort(this: IExecuteFunctions, items: INodeExecutionData[]): INodeExecutionData[] {
		const field = this.getNodeParameter('sortField', 0) as string;
		const order = this.getNodeParameter('sortOrder', 0) as string;
		return [...items].sort((a, b) => {
			const aV = a.json[field]; const bV = b.json[field];
			const res = (typeof aV === 'number' && typeof bV === 'number') ? aV - bV : String(aV).localeCompare(String(bV), 'zh-TW');
			return order === 'asc' ? res : -res;
		});
	}

	private handleSearch(this: IExecuteFunctions, items: INodeExecutionData[]): INodeExecutionData[] {
		const field = this.getNodeParameter('searchField', 0) as string;
		const searchValue = String(this.getNodeParameter('searchValue', 0));
		const caseSensitive = this.getNodeParameter('caseSensitive', 0) as boolean;
		
		const value = caseSensitive ? searchValue : searchValue.toLowerCase();
		
		return items.filter(item => {
			if (field) {
				const fieldValue = String(item.json[field]);
				const compareValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();
				return compareValue.includes(value);
			}
			return Object.values(item.json).some(v => {
				const itemValue = String(v);
				const compareValue = caseSensitive ? itemValue : itemValue.toLowerCase();
				return compareValue.includes(value);
			});
		});
	}

	private handleLimit(this: IExecuteFunctions, items: INodeExecutionData[]): INodeExecutionData[] {
		const limit = this.getNodeParameter('limit', 0) as number;
		const offset = this.getNodeParameter('offset', 0) as number;
		return items.slice(offset, offset + limit);
	}

	private handleCellRead(this: IExecuteFunctions, items: INodeExecutionData[]): INodeExecutionData[] {
		const rowIndexStr = this.getNodeParameter('readRowIndex', 0) as string;
		const fieldNamesStr = this.getNodeParameter('readFieldNames', 0) as string;

		const instance = new JsonCrud();

		// Parse row indices
		const rowIndices = instance.parseRowIndices(rowIndexStr, items.length);

		// Parse field names (if specified)
		const fieldNames = fieldNamesStr 
			? fieldNamesStr.split(',').map(f => f.trim()).filter(f => f.length > 0)
			: null;

		// Filter items by row indices
		const filteredItems = items.filter((item, index) => rowIndices.includes(index));

		// If field names specified, filter fields
		if (fieldNames && fieldNames.length > 0) {
			return filteredItems.map(item => {
				const filteredJson: any = {};
				fieldNames.forEach(fieldName => {
					if (fieldName in item.json) {
						filteredJson[fieldName] = item.json[fieldName];
					}
				});
				return { json: filteredJson };
			});
		}

		return filteredItems;
	}

	private async handleUpdate(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
		const updateMode = this.getNodeParameter('updateMode', 0) as string;
		const instance = new JsonCrud();

		if (updateMode === 'cell') {
			// Cell-based update (Excel-like)
			return instance.handleCellUpdate.call(this, items);
		} else {
			// Condition-based update (original)
			return instance.handleConditionUpdate.call(this, items);
		}
	}

	private handleConditionUpdate(this: IExecuteFunctions, items: INodeExecutionData[]): INodeExecutionData[] {
		const conditions = this.getNodeParameter('updateConditions', 0) as any;
		const conditionLogic = this.getNodeParameter('updateConditionLogic', 0) as string;
		const caseSensitive = this.getNodeParameter('updateCaseSensitive', 0) as boolean;
		
		// Validate that all condition fields exist in at least one item
		if (conditions.conditions?.length) {
			for (const condition of conditions.conditions) {
				const fieldExists = items.some(item => condition.field in item.json);
				if (!fieldExists) {
					throw new NodeOperationError(
						this.getNode(),
						`Condition field "${condition.field}" does not exist in any of the input items. Please check your condition field names.`,
					);
				}
			}
		}
		
		return items.map((item, itemIndex) => {
			let match = true;
			
			// Check if item matches conditions based on logic (AND/OR)
			if (conditions.conditions?.length) {
				const results = conditions.conditions.map((c: any) => {
					const val = item.json[c.field];
					const compareVal = c.value;
					
					switch (c.operator) {
						case 'equals': {
							const valStr = String(val);
							const compareStr = String(compareVal);
							return caseSensitive
								? valStr === compareStr
								: valStr.toLowerCase() === compareStr.toLowerCase();
						}
						case 'notEquals': {
							const valStr = String(val);
							const compareStr = String(compareVal);
							return caseSensitive
								? valStr !== compareStr
								: valStr.toLowerCase() !== compareStr.toLowerCase();
						}
						case 'contains': {
							const valStr = String(val);
							const compareStr = String(compareVal);
							return caseSensitive 
								? valStr.includes(compareStr)
								: valStr.toLowerCase().includes(compareStr.toLowerCase());
						}
						case 'notContains': {
							const valStr = String(val);
							const compareStr = String(compareVal);
							return caseSensitive 
								? !valStr.includes(compareStr)
								: !valStr.toLowerCase().includes(compareStr.toLowerCase());
						}
						case 'greaterThan': 
							return Number(val) > Number(compareVal);
						case 'greaterOrEqual': 
							return Number(val) >= Number(compareVal);
						case 'lessThan': 
							return Number(val) < Number(compareVal);
						case 'lessOrEqual': 
							return Number(val) <= Number(compareVal);
						case 'startsWith': {
							const valStr = String(val);
							const compareStr = String(compareVal);
							return caseSensitive 
								? valStr.startsWith(compareStr)
								: valStr.toLowerCase().startsWith(compareStr.toLowerCase());
						}
						case 'endsWith': {
							const valStr = String(val);
							const compareStr = String(compareVal);
							return caseSensitive 
								? valStr.endsWith(compareStr)
								: valStr.toLowerCase().endsWith(compareStr.toLowerCase());
						}
						case 'isEmpty': 
							return !val || val === '' || val === null || val === undefined;
						case 'isNotEmpty': 
							return val && val !== '' && val !== null && val !== undefined;
						default: 
							return false;
					}
				});
				
				// Apply AND or OR logic
				match = conditionLogic === 'and' 
					? results.every((r: boolean) => r)
					: results.some((r: boolean) => r);
			}
			
			if (match) {
				// Get fields to update for THIS specific item (to evaluate expressions per item)
				const fields = this.getNodeParameter('fieldsToUpdate', itemIndex) as any;
				if (fields.fields) {
					fields.fields.forEach((f: any) => { 
						item.json[f.name] = f.value; 
					});
				}
			}
			return item;
		});
	}

	private handleCellUpdate(this: IExecuteFunctions, items: INodeExecutionData[]): INodeExecutionData[] {
		const rowIndexStr = this.getNodeParameter('rowIndex', 0) as string;
		const fieldName = this.getNodeParameter('cellFieldName', 0) as string;

		const instance = new JsonCrud();

		// Parse row indices
		const rowIndices = instance.parseRowIndices(rowIndexStr, items.length);

		return items.map((item, index) => {
			if (rowIndices.includes(index)) {
				// Get the new value for THIS specific item (to evaluate expressions per item)
				const newValue = this.getNodeParameter('cellValue', index) as string;
				item.json[fieldName] = newValue;
			}
			return item;
		});
	}

	/**
	 * Parse row index string into array of indices
	 * Supports: single (0), range (0-5), multiple (0,2,4), or combination (0-2,5,7-9)
	 */
	private parseRowIndices(indexStr: string, maxLength: number): number[] {
		const indices = new Set<number>();
		const parts = indexStr.split(',').map(p => p.trim());

		for (const part of parts) {
			if (part.includes('-')) {
				// Range: "0-5"
				const [start, end] = part.split('-').map(s => parseInt(s.trim(), 10));
				if (!isNaN(start) && !isNaN(end)) {
					for (let i = Math.max(0, start); i <= Math.min(end, maxLength - 1); i++) {
						indices.add(i);
					}
				}
			} else {
				// Single: "0"
				const index = parseInt(part, 10);
				if (!isNaN(index) && index >= 0 && index < maxLength) {
					indices.add(index);
				}
			}
		}

		return Array.from(indices).sort((a, b) => a - b);
	}

	private async handleDelete(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
		const deleteMode = this.getNodeParameter('deleteMode', 0) as string;
		const instance = new JsonCrud();

		if (deleteMode === 'rowIndex') {
			// Row Index-based delete
			return instance.handleRowIndexDelete.call(this, items);
		} else {
			// Condition-based delete (original)
			return instance.handleConditionDelete.call(this, items);
		}
	}

	private handleRowIndexDelete(this: IExecuteFunctions, items: INodeExecutionData[]): INodeExecutionData[] {
		const rowIndexStr = this.getNodeParameter('deleteRowIndex', 0) as string;
		const instance = new JsonCrud();

		// Parse row indices to delete
		const rowIndicesToDelete = instance.parseRowIndices(rowIndexStr, items.length);

		// Filter out items at specified indices (keep items NOT in the delete list)
		return items.filter((item, index) => !rowIndicesToDelete.includes(index));
	}

	private handleConditionDelete(this: IExecuteFunctions, items: INodeExecutionData[]): INodeExecutionData[] {
		const conditions = this.getNodeParameter('deleteConditions', 0) as any;
		const conditionLogic = this.getNodeParameter('deleteConditionLogic', 0) as string;
		const caseSensitive = this.getNodeParameter('deleteCaseSensitive', 0) as boolean;
		
		if (!conditions.conditions?.length) return items;
		
		// Validate that all condition fields exist in at least one item
		for (const condition of conditions.conditions) {
			const fieldExists = items.some(item => condition.field in item.json);
			if (!fieldExists) {
				throw new NodeOperationError(
					this.getNode(),
					`Condition field "${condition.field}" does not exist in any of the input items. Please check your condition field names.`,
				);
			}
		}
		
		return items.filter(item => {
			const results = conditions.conditions.map((c: any) => {
				const val = item.json[c.field];
				const compareVal = c.value;
				
				switch (c.operator) {
					case 'equals': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive
							? valStr === compareStr
							: valStr.toLowerCase() === compareStr.toLowerCase();
					}
					case 'notEquals': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive
							? valStr !== compareStr
							: valStr.toLowerCase() !== compareStr.toLowerCase();
					}
					case 'contains': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive 
							? valStr.includes(compareStr)
							: valStr.toLowerCase().includes(compareStr.toLowerCase());
					}
					case 'notContains': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive 
							? !valStr.includes(compareStr)
							: !valStr.toLowerCase().includes(compareStr.toLowerCase());
					}
					case 'greaterThan': 
						return Number(val) > Number(compareVal);
					case 'greaterOrEqual': 
						return Number(val) >= Number(compareVal);
					case 'lessThan': 
						return Number(val) < Number(compareVal);
					case 'lessOrEqual': 
						return Number(val) <= Number(compareVal);
					case 'startsWith': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive 
							? valStr.startsWith(compareStr)
							: valStr.toLowerCase().startsWith(compareStr.toLowerCase());
					}
					case 'endsWith': {
						const valStr = String(val);
						const compareStr = String(compareVal);
						return caseSensitive 
							? valStr.endsWith(compareStr)
							: valStr.toLowerCase().endsWith(compareStr.toLowerCase());
					}
					case 'isEmpty': 
						return !val || val === '' || val === null || val === undefined;
					case 'isNotEmpty': 
						return val && val !== '' && val !== null && val !== undefined;
					default: 
						return false;
				}
			});
			
			// If conditions match, DELETE the item (return false to filter it out)
			// If conditions don't match, KEEP the item (return true)
			const matchesDeleteCondition = conditionLogic === 'and' 
				? results.every((r: boolean) => r)
				: results.some((r: boolean) => r);
			
			return !matchesDeleteCondition; // Invert: keep items that DON'T match delete conditions
		});
	}

	private async handleRemoveDuplicates(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
		const uniqueFields = this.getNodeParameter('uniqueFields', 0) as string;
		const fields = uniqueFields ? uniqueFields.split(',').map(f => f.trim()) : null;
		const seen = new Set();
		return items.filter(item => {
			const key = fields ? fields.map(f => item.json[f]).join('|') : JSON.stringify(item.json);
			if (seen.has(key)) return false;
			seen.add(key); return true;
		});
	}

	private async handleStatistics(this: IExecuteFunctions, items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
		const statsField = this.getNodeParameter('statsField', 0) as string;
		const groupByField = this.getNodeParameter('groupByField', 0) as string;

		if (groupByField) {
			const groups: { [key: string]: number[] } = {};
			items.forEach(item => {
				const key = String(item.json[groupByField] || 'undefined');
				if (!groups[key]) groups[key] = [];
				groups[key].push(Number(item.json[statsField]) || 0);
			});
			return Object.entries(groups).map(([group, values]) => {
				const sum = values.reduce((a, b) => a + b, 0);
				return {
					json: {
						group,
						count: values.length,
						sum: sum,
						avg: values.length ? sum / values.length : 0,
						min: Math.min(...values),
						max: Math.max(...values),
					},
				};
			});
		}
		const values = items.map(item => Number(item.json[statsField]) || 0);
		const totalSum = values.reduce((a, b) => a + b, 0);
		return [{
			json: {
				count: values.length,
				sum: totalSum,
				avg: values.length ? totalSum / values.length : 0,
				min: Math.min(...values),
				max: Math.max(...values),
			},
		}];
	}
}