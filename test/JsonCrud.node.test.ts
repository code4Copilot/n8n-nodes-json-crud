import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { JsonCrud } from '../nodes/JsonCrud/JsonCrud.node';

// Mock helper function
const createMockExecuteFunctions = (
  parameters: { [key: string]: any },
  inputData: INodeExecutionData[]
): IExecuteFunctions => {
  return {
    getInputData: () => inputData,
    getNodeParameter: (parameterName: string, itemIndex: number) => {
      return parameters[parameterName];
    },
    getNode: () => ({
      name: 'Test Node',
      type: 'n8n-nodes-json-crud.jsonCrud',
      typeVersion: 1,
      position: [0, 0],
      parameters: {},
    }),
  } as IExecuteFunctions;
};

describe('JsonCrud Node', () => {
  let jsonCrud: JsonCrud;

  beforeEach(() => {
    jsonCrud = new JsonCrud();
  });

  describe('CREATE Operation', () => {
    test('should append single record', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
      ];

      const parameters = {
        operation: 'create',
        dataToAdd: JSON.stringify({ name: '王五', age: 28 }),
        position: 'append',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(3);
      expect(result[0][2].json).toEqual({ name: '王五', age: 28 });
    });

    test('should prepend single record', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
      ];

      const parameters = {
        operation: 'create',
        dataToAdd: JSON.stringify({ name: '王五', age: 28 }),
        position: 'prepend',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json).toEqual({ name: '王五', age: 28 });
    });

    test('should handle array of records', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
      ];

      const parameters = {
        operation: 'create',
        dataToAdd: JSON.stringify([
          { name: '王五', age: 28 },
          { name: '趙六', age: 32 },
        ]),
        position: 'append',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(3);
      expect(result[0][1].json).toEqual({ name: '王五', age: 28 });
      expect(result[0][2].json).toEqual({ name: '趙六', age: 32 });
    });
  });

  describe('READ Operation - Filter', () => {
    test('should filter with equals operator', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', department: '技術部', salary: 50000 } },
        { json: { name: '李四', department: '業務部', salary: 45000 } },
        { json: { name: '王五', department: '技術部', salary: 55000 } },
      ];

      const parameters = {
        operation: 'read',
        readMode: 'filter',
        filterConditions: {
          conditions: [
            { field: 'department', operator: 'equals', value: '技術部' },
          ],
        },
        conditionLogic: 'and',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json.name).toBe('張三');
      expect(result[0][1].json.name).toBe('王五');
    });

    test('should filter with multiple conditions (AND)', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', department: '技術部', salary: 50000 } },
        { json: { name: '李四', department: '業務部', salary: 45000 } },
        { json: { name: '王五', department: '技術部', salary: 55000 } },
      ];

      const parameters = {
        operation: 'read',
        readMode: 'filter',
        filterConditions: {
          conditions: [
            { field: 'department', operator: 'equals', value: '技術部' },
            { field: 'salary', operator: 'greaterThan', value: '52000' },
          ],
        },
        conditionLogic: 'and',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json.name).toBe('王五');
    });

    test('should filter with OR logic', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', department: '技術部', salary: 50000 } },
        { json: { name: '李四', department: '業務部', salary: 60000 } },
        { json: { name: '王五', department: '行政部', salary: 40000 } },
      ];

      const parameters = {
        operation: 'read',
        readMode: 'filter',
        filterConditions: {
          conditions: [
            { field: 'department', operator: 'equals', value: '技術部' },
            { field: 'salary', operator: 'greaterThan', value: '55000' },
          ],
        },
        conditionLogic: 'or',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
    });

    describe('Case Sensitivity', () => {
      test('should filter with equals operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', status: 'Active' } },
          { json: { name: 'Jane', status: 'active' } },
          { json: { name: 'Bob', status: 'ACTIVE' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'status', operator: 'equals', value: 'Active' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: true,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.name).toBe('John');
      });

      test('should filter with equals operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', status: 'Active' } },
          { json: { name: 'Jane', status: 'active' } },
          { json: { name: 'Bob', status: 'ACTIVE' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'status', operator: 'equals', value: 'Active' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(3);
      });

      test('should filter with notEquals operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', status: 'Active' } },
          { json: { name: 'Jane', status: 'active' } },
          { json: { name: 'Bob', status: 'Inactive' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'status', operator: 'notEquals', value: 'Active' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: true,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json.name).toBe('Jane');
        expect(result[0][1].json.name).toBe('Bob');
      });

      test('should filter with notEquals operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', status: 'Active' } },
          { json: { name: 'Jane', status: 'active' } },
          { json: { name: 'Bob', status: 'Inactive' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'status', operator: 'notEquals', value: 'Active' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.name).toBe('Bob');
      });

      test('should filter with contains operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John Smith' } },
          { json: { name: 'john doe' } },
          { json: { name: 'JOHN BROWN' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'name', operator: 'contains', value: 'John' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: true,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.name).toBe('John Smith');
      });

      test('should filter with contains operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John Smith' } },
          { json: { name: 'john doe' } },
          { json: { name: 'JOHN BROWN' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'name', operator: 'contains', value: 'John' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(3);
      });

      test('should filter with startsWith operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { email: 'Admin@example.com' } },
          { json: { email: 'admin@test.com' } },
          { json: { email: 'user@example.com' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'email', operator: 'startsWith', value: 'Admin' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: true,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.email).toBe('Admin@example.com');
      });

      test('should filter with startsWith operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { email: 'Admin@example.com' } },
          { json: { email: 'admin@test.com' } },
          { json: { email: 'user@example.com' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'email', operator: 'startsWith', value: 'Admin' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
      });

      test('should filter with endsWith operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { filename: 'document.PDF' } },
          { json: { filename: 'image.pdf' } },
          { json: { filename: 'text.txt' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'filename', operator: 'endsWith', value: '.PDF' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: true,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.filename).toBe('document.PDF');
      });

      test('should filter with endsWith operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { filename: 'document.PDF' } },
          { json: { filename: 'image.pdf' } },
          { json: { filename: 'text.txt' } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'filename', operator: 'endsWith', value: '.PDF' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
      });
    });
  });

  describe('READ Operation - Cell Position', () => {
    test('should read single row', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
        { json: { name: '王五', age: 28 } },
      ];

      const parameters = {
        operation: 'read',
        readMode: 'cell',
        readRowIndex: '0',
        readFieldNames: '',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json.name).toBe('張三');
    });

    test('should read range of rows', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
        { json: { name: '王五', age: 28 } },
        { json: { name: '趙六', age: 35 } },
      ];

      const parameters = {
        operation: 'read',
        readMode: 'cell',
        readRowIndex: '1-2',
        readFieldNames: '',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json.name).toBe('李四');
      expect(result[0][1].json.name).toBe('王五');
    });

    test('should read specific fields only', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30, department: '技術部' } },
        { json: { name: '李四', age: 25, department: '業務部' } },
      ];

      const parameters = {
        operation: 'read',
        readMode: 'cell',
        readRowIndex: '0-1',
        readFieldNames: 'name,age',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json).toEqual({ name: '張三', age: 30 });
      expect(result[0][0].json).not.toHaveProperty('department');
    });

    test('should read multiple non-continuous rows', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
        { json: { name: '王五', age: 28 } },
        { json: { name: '趙六', age: 35 } },
      ];

      const parameters = {
        operation: 'read',
        readMode: 'cell',
        readRowIndex: '0,2',
        readFieldNames: '',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json.name).toBe('張三');
      expect(result[0][1].json.name).toBe('王五');
    });
  });

  describe('READ Operation - Sort', () => {
    test('should sort ascending', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', salary: 50000 } },
        { json: { name: '李四', salary: 45000 } },
        { json: { name: '王五', salary: 55000 } },
      ];

      const parameters = {
        operation: 'read',
        readMode: 'sort',
        sortField: 'salary',
        sortOrder: 'asc',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0][0].json.salary).toBe(45000);
      expect(result[0][2].json.salary).toBe(55000);
    });

    test('should sort descending', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', salary: 50000 } },
        { json: { name: '李四', salary: 45000 } },
        { json: { name: '王五', salary: 55000 } },
      ];

      const parameters = {
        operation: 'read',
        readMode: 'sort',
        sortField: 'salary',
        sortOrder: 'desc',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0][0].json.salary).toBe(55000);
      expect(result[0][2].json.salary).toBe(45000);
    });
  });

  describe('UPDATE Operation - Cell Position', () => {
    test('should update single cell', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', salary: 50000 } },
        { json: { name: '李四', salary: 45000 } },
      ];

      const parameters = {
        operation: 'update',
        updateMode: 'cell',
        rowIndex: '0',
        cellFieldName: 'salary',
        cellValue: '60000',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0][0].json.salary).toBe(60000);
      expect(result[0][1].json.salary).toBe(45000);
    });

    test('should update range of cells', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', department: '技術部' } },
        { json: { name: '李四', department: '業務部' } },
        { json: { name: '王五', department: '行政部' } },
      ];

      const parameters = {
        operation: 'update',
        updateMode: 'cell',
        rowIndex: '0-1',
        cellFieldName: 'department',
        cellValue: '研發部',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0][0].json.department).toBe('研發部');
      expect(result[0][1].json.department).toBe('研發部');
      expect(result[0][2].json.department).toBe('行政部');
    });
  });

  describe('UPDATE Operation - By Condition', () => {
    test('should update records matching condition', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', department: '技術部', salary: 50000 } },
        { json: { name: '李四', department: '業務部', salary: 45000 } },
        { json: { name: '王五', department: '技術部', salary: 55000 } },
      ];

      const parameters = {
        operation: 'update',
        updateMode: 'condition',
        updateConditions: {
          conditions: [
            { field: 'department', operator: 'equals', value: '技術部' },
          ],
        },
        updateConditionLogic: 'and',
        fieldsToUpdate: {
          fields: [{ name: 'salary', value: '60000' }],
        },
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0][0].json.salary).toBe(60000);
      expect(result[0][1].json.salary).toBe(45000);
      expect(result[0][2].json.salary).toBe(60000);
    });

    describe('Case Sensitivity', () => {
      test('should update with equals operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', status: 'Active', bonus: 0 } },
          { json: { name: 'Jane', status: 'active', bonus: 0 } },
          { json: { name: 'Bob', status: 'Inactive', bonus: 0 } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'status', operator: 'equals', value: 'Active' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: true,
          fieldsToUpdate: {
            fields: [{ name: 'bonus', value: '1000' }],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.bonus).toBe(1000);
        expect(result[0][1].json.bonus).toBe(0);
        expect(result[0][2].json.bonus).toBe(0);
      });

      test('should update with equals operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', status: 'Active', bonus: 0 } },
          { json: { name: 'Jane', status: 'active', bonus: 0 } },
          { json: { name: 'Bob', status: 'Inactive', bonus: 0 } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'status', operator: 'equals', value: 'Active' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [{ name: 'bonus', value: '1000' }],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.bonus).toBe(1000);
        expect(result[0][1].json.bonus).toBe(1000);
        expect(result[0][2].json.bonus).toBe(0);
      });

      test('should update with contains operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { email: 'Admin@example.com', role: 'user' } },
          { json: { email: 'admin@test.com', role: 'user' } },
          { json: { email: 'user@test.com', role: 'user' } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'email', operator: 'contains', value: 'Admin' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: true,
          fieldsToUpdate: {
            fields: [{ name: 'role', value: 'admin' }],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.role).toBe('admin');
        expect(result[0][1].json.role).toBe('user');
        expect(result[0][2].json.role).toBe('user');
      });

      test('should update with contains operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { email: 'Admin@example.com', role: 'user' } },
          { json: { email: 'admin@test.com', role: 'user' } },
          { json: { email: 'user@test.com', role: 'user' } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'email', operator: 'contains', value: 'Admin' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [{ name: 'role', value: 'admin' }],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.role).toBe('admin');
        expect(result[0][1].json.role).toBe('admin');
        expect(result[0][2].json.role).toBe('user');
      });
    });

    describe('Error Handling - Condition Field Not Exists', () => {
      test('should throw error when condition field does not exist', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: '張三', department: '技術部', salary: 50000 } },
          { json: { name: '李四', department: '業務部', salary: 45000 } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'nonExistentField', operator: 'equals', value: '技術部' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [{ name: 'salary', value: '60000' }],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);

        await expect(jsonCrud.execute.call(mockThis)).rejects.toThrow(
          'Condition field "nonExistentField" does not exist in any of the input items'
        );
      });

      test('should throw error when one of multiple condition fields does not exist', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: '張三', department: '技術部', salary: 50000 } },
          { json: { name: '李四', department: '業務部', salary: 45000 } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'department', operator: 'equals', value: '技術部' },
              { field: 'invalidField', operator: 'greaterThan', value: '40000' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [{ name: 'salary', value: '60000' }],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);

        await expect(jsonCrud.execute.call(mockThis)).rejects.toThrow(
          'Condition field "invalidField" does not exist in any of the input items'
        );
      });

      test('should allow update fields that do not exist (for adding new calculated fields)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: '張三', salary: 50000 } },
          { json: { name: '李四', salary: 45000 } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'salary', operator: 'greaterThan', value: '40000' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [{ name: 'newCalculatedField', value: '100' }],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.newCalculatedField).toBe(100);
        expect(result[0][1].json.newCalculatedField).toBe(100);
      });
    });
  });

  describe('DELETE Operation - By Condition', () => {
    test('should delete records matching condition', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', status: '在職' } },
        { json: { name: '李四', status: '離職' } },
        { json: { name: '王五', status: '在職' } },
      ];

      const parameters = {
        operation: 'delete',
        deleteMode: 'condition',
        deleteConditions: {
          conditions: [{ field: 'status', operator: 'equals', value: '離職' }],
        },
        deleteConditionLogic: 'and',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json.name).toBe('張三');
      expect(result[0][1].json.name).toBe('王五');
    });

    test('should delete records with multiple conditions (AND)', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', department: '技術部', salary: 50000 } },
        { json: { name: '李四', department: '技術部', salary: 45000 } },
        { json: { name: '王五', department: '業務部', salary: 55000 } },
      ];

      const parameters = {
        operation: 'delete',
        deleteMode: 'condition',
        deleteConditions: {
          conditions: [
            { field: 'department', operator: 'equals', value: '技術部' },
            { field: 'salary', operator: 'lessThan', value: '48000' },
          ],
        },
        deleteConditionLogic: 'and',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json.name).toBe('張三');
      expect(result[0][1].json.name).toBe('王五');
    });

    describe('Case Sensitivity', () => {
      test('should delete with equals operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', status: 'Active' } },
          { json: { name: 'Jane', status: 'active' } },
          { json: { name: 'Bob', status: 'Inactive' } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'status', operator: 'equals', value: 'Active' },
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: true,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json.name).toBe('Jane');
        expect(result[0][1].json.name).toBe('Bob');
      });

      test('should delete with equals operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', status: 'Active' } },
          { json: { name: 'Jane', status: 'active' } },
          { json: { name: 'Bob', status: 'Inactive' } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'status', operator: 'equals', value: 'Active' },
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.name).toBe('Bob');
      });

      test('should delete with notEquals operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', type: 'Admin' } },
          { json: { name: 'Jane', type: 'admin' } },
          { json: { name: 'Bob', type: 'User' } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'type', operator: 'notEquals', value: 'Admin' },
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: true,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.name).toBe('John');
      });

      test('should delete with notEquals operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John', type: 'Admin' } },
          { json: { name: 'Jane', type: 'admin' } },
          { json: { name: 'Bob', type: 'User' } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'type', operator: 'notEquals', value: 'Admin' },
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        // notEquals 'Admin' with case insensitive will match 'Admin' and 'admin' (keep them), delete 'User'
        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json.name).toBe('John');
        expect(result[0][1].json.name).toBe('Jane');
      });

      test('should delete with contains operator (case sensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John Smith' } },
          { json: { name: 'john doe' } },
          { json: { name: 'Jane Smith' } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'name', operator: 'contains', value: 'John' },
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: true,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json.name).toBe('john doe');
        expect(result[0][1].json.name).toBe('Jane Smith');
      });

      test('should delete with contains operator (case insensitive)', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'John Smith' } },
          { json: { name: 'john doe' } },
          { json: { name: 'Jane Smith' } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'name', operator: 'contains', value: 'John' },
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.name).toBe('Jane Smith');
      });
    });

    describe('Error Handling - Condition Field Not Exists', () => {
      test('should throw error when condition field does not exist', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: '張三', status: '在職' } },
          { json: { name: '李四', status: '離職' } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'nonExistentField', operator: 'equals', value: '離職' },
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);

        await expect(jsonCrud.execute.call(mockThis)).rejects.toThrow(
          'Condition field "nonExistentField" does not exist in any of the input items'
        );
      });

      test('should throw error when one of multiple condition fields does not exist', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: '張三', department: '技術部', salary: 50000 } },
          { json: { name: '李四', department: '業務部', salary: 45000 } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'department', operator: 'equals', value: '技術部' },
              { field: 'wrongFieldName', operator: 'lessThan', value: '48000' },
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);

        await expect(jsonCrud.execute.call(mockThis)).rejects.toThrow(
          'Condition field "wrongFieldName" does not exist in any of the input items'
        );
      });
    });
  });

  describe('DELETE Operation - By Row Index', () => {
    test('should delete single row by index', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
        { json: { name: '王五', age: 28 } },
      ];

      const parameters = {
        operation: 'delete',
        deleteMode: 'rowIndex',
        deleteRowIndex: '1',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json.name).toBe('張三');
      expect(result[0][1].json.name).toBe('王五');
    });

    test('should delete range of rows by index', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
        { json: { name: '王五', age: 28 } },
        { json: { name: '趙六', age: 35 } },
        { json: { name: '錢七', age: 32 } },
      ];

      const parameters = {
        operation: 'delete',
        deleteMode: 'rowIndex',
        deleteRowIndex: '1-3',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json.name).toBe('張三');
      expect(result[0][1].json.name).toBe('錢七');
    });

    test('should delete multiple non-continuous rows by index', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
        { json: { name: '王五', age: 28 } },
        { json: { name: '趙六', age: 35 } },
      ];

      const parameters = {
        operation: 'delete',
        deleteMode: 'rowIndex',
        deleteRowIndex: '0,2',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      expect(result[0][0].json.name).toBe('李四');
      expect(result[0][1].json.name).toBe('趙六');
    });

    test('should delete combined row indices (range and specific)', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
        { json: { name: '王五', age: 28 } },
        { json: { name: '趙六', age: 35 } },
        { json: { name: '錢七', age: 32 } },
        { json: { name: '孫八', age: 29 } },
      ];

      const parameters = {
        operation: 'delete',
        deleteMode: 'rowIndex',
        deleteRowIndex: '0-1,4',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(3);
      expect(result[0][0].json.name).toBe('王五');
      expect(result[0][1].json.name).toBe('趙六');
      expect(result[0][2].json.name).toBe('孫八');
    });

    test('should handle out of bounds indices gracefully', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
      ];

      const parameters = {
        operation: 'delete',
        deleteMode: 'rowIndex',
        deleteRowIndex: '0,5,10',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json.name).toBe('李四');
    });
  });

  describe('REMOVE DUPLICATES Operation', () => {
    test('should remove duplicates by specific fields', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', email: 'zhang@example.com' } },
        { json: { name: '李四', email: 'li@example.com' } },
        { json: { name: '張三', email: 'zhang@example.com' } },
      ];

      const parameters = {
        operation: 'removeDuplicates',
        uniqueFields: 'name,email',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
    });

    test('should remove duplicates by all fields', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', age: 30 } },
        { json: { name: '李四', age: 25 } },
        { json: { name: '張三', age: 30 } },
      ];

      const parameters = {
        operation: 'removeDuplicates',
        uniqueFields: '',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
    });
  });

  describe('STATISTICS Operation', () => {
    test('should calculate basic statistics', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { name: '張三', salary: 50000 } },
        { json: { name: '李四', salary: 45000 } },
        { json: { name: '王五', salary: 55000 } },
      ];

      const parameters = {
        operation: 'statistics',
        statsField: 'salary',
        groupByField: '',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json.count).toBe(3);
      expect(result[0][0].json.sum).toBe(150000);
      expect(result[0][0].json.avg).toBe(50000);
      expect(result[0][0].json.min).toBe(45000);
      expect(result[0][0].json.max).toBe(55000);
    });

    test('should calculate grouped statistics', async () => {
      const inputData: INodeExecutionData[] = [
        { json: { department: '技術部', salary: 50000 } },
        { json: { department: '技術部', salary: 55000 } },
        { json: { department: '業務部', salary: 45000 } },
      ];

      const parameters = {
        operation: 'statistics',
        statsField: 'salary',
        groupByField: 'department',
      };

      const mockThis = createMockExecuteFunctions(parameters, inputData);
      const result = await jsonCrud.execute.call(mockThis);

      expect(result[0]).toHaveLength(2);
      const techDept = result[0].find((r) => r.json.group === '技術部');
      expect(techDept?.json.count).toBe(2);
      expect(techDept?.json.avg).toBe(52500);
    });
  });

  describe('Automatic Type Conversion', () => {
    describe('Filter with Type Conversion', () => {
      test('should auto-convert string numbers in filter conditions', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Product A', price: 100 } },
          { json: { name: 'Product B', price: 200 } },
          { json: { name: 'Product C', price: 50 } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'price', operator: 'greaterThan', value: '75' }, // String "75" should convert to number 75
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json.name).toBe('Product A');
        expect(result[0][1].json.name).toBe('Product B');
      });

      test('should auto-convert string booleans in filter conditions', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'User A', active: true } },
          { json: { name: 'User B', active: false } },
          { json: { name: 'User C', active: true } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'active', operator: 'equals', value: 'true' }, // String "true" should convert to boolean true
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json.name).toBe('User A');
        expect(result[0][1].json.name).toBe('User C');
      });

      test('should auto-convert string null in filter conditions', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', description: 'Something' } },
          { json: { name: 'Item B', description: null } },
          { json: { name: 'Item C', description: null } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'description', operator: 'equals', value: 'null' }, // String "null" should convert to null
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json.name).toBe('Item B');
        expect(result[0][1].json.name).toBe('Item C');
      });

      test('should auto-convert ISO date strings in filter conditions', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Event A', date: new Date('2026-01-10') } },
          { json: { name: 'Event B', date: new Date('2026-01-20') } },
          { json: { name: 'Event C', date: new Date('2026-01-05') } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'date', operator: 'greaterThan', value: '2026-01-15' }, // String date should convert to Date
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.name).toBe('Event B');
      });

      test('should handle negative numbers in filter conditions', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Account A', balance: -50 } },
          { json: { name: 'Account B', balance: 100 } },
          { json: { name: 'Account C', balance: -20 } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'balance', operator: 'lessThan', value: '0' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json.name).toBe('Account A');
        expect(result[0][1].json.name).toBe('Account C');
      });

      test('should handle decimal numbers in filter conditions', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', rating: 4.5 } },
          { json: { name: 'Item B', rating: 3.2 } },
          { json: { name: 'Item C', rating: 4.8 } },
        ];

        const parameters = {
          operation: 'read',
          readMode: 'filter',
          filterConditions: {
            conditions: [
              { field: 'rating', operator: 'greaterOrEqual', value: '4.5' },
            ],
          },
          conditionLogic: 'and',
          filterCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(2);
        expect(result[0][0].json.name).toBe('Item A');
        expect(result[0][1].json.name).toBe('Item C');
      });
    });

    describe('Update with Type Conversion', () => {
      test('should auto-convert string numbers when updating', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Product A', price: 100, discount: 0 } },
          { json: { name: 'Product B', price: 200, discount: 0 } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'price', operator: 'greaterThan', value: '50' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [
              { name: 'discount', value: '15' }, // String "15" should convert to number 15
            ],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.discount).toBe(15);
        expect(result[0][1].json.discount).toBe(15);
        expect(typeof result[0][0].json.discount).toBe('number');
      });

      test('should auto-convert string booleans when updating', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'User A', verified: false } },
          { json: { name: 'User B', verified: false } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'verified', operator: 'equals', value: 'false' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [
              { name: 'verified', value: 'true' }, // String "true" should convert to boolean true
            ],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.verified).toBe(true);
        expect(result[0][1].json.verified).toBe(true);
        expect(typeof result[0][0].json.verified).toBe('boolean');
      });

      test('should auto-convert null when updating', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Task A', assignee: 'John' } },
          { json: { name: 'Task B', assignee: 'Jane' } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'assignee', operator: 'isNotEmpty' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [
              { name: 'assignee', value: 'null' }, // String "null" should convert to null
            ],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.assignee).toBe(null);
        expect(result[0][1].json.assignee).toBe(null);
      });

      test('should auto-convert decimal numbers when updating', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', rating: 0 } },
          { json: { name: 'Item B', rating: 0 } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'rating', operator: 'equals', value: '0' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [
              { name: 'rating', value: '4.75' },
            ],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.rating).toBe(4.75);
        expect(result[0][1].json.rating).toBe(4.75);
        expect(typeof result[0][0].json.rating).toBe('number');
      });

      test('should auto-convert negative numbers when updating', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Account A', balance: 0 } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'condition',
          updateConditions: {
            conditions: [
              { field: 'balance', operator: 'equals', value: '0' },
            ],
          },
          updateConditionLogic: 'and',
          updateCaseSensitive: false,
          fieldsToUpdate: {
            fields: [
              { name: 'balance', value: '-250' },
            ],
          },
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.balance).toBe(-250);
        expect(typeof result[0][0].json.balance).toBe('number');
      });
    });

    describe('Cell Update with Type Conversion', () => {
      test('should auto-convert types in cell update', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', quantity: 0, available: false, notes: 'test' } },
          { json: { name: 'Item B', quantity: 0, available: false, notes: 'test' } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'quantity',
          cellValue: '150', // Should convert to number
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.quantity).toBe(150);
        expect(typeof result[0][0].json.quantity).toBe('number');
      });

      test('should auto-convert boolean in cell update', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', available: false } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'available',
          cellValue: 'true', // Should convert to boolean
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.available).toBe(true);
        expect(typeof result[0][0].json.available).toBe('boolean');
      });

      test('should auto-convert null in cell update', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', notes: 'some text' } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'notes',
          cellValue: 'null', // Should convert to null
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.notes).toBe(null);
      });
    });

    describe('Delete with Type Conversion', () => {
      test('should auto-convert string numbers in delete conditions', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Product A', stock: 5 } },
          { json: { name: 'Product B', stock: 50 } },
          { json: { name: 'Product C', stock: 3 } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'stock', operator: 'lessThan', value: '10' }, // String "10" should convert to number 10
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.name).toBe('Product B');
      });

      test('should auto-convert string booleans in delete conditions', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'User A', deleted: true } },
          { json: { name: 'User B', deleted: false } },
          { json: { name: 'User C', deleted: true } },
        ];

        const parameters = {
          operation: 'delete',
          deleteMode: 'condition',
          deleteConditions: {
            conditions: [
              { field: 'deleted', operator: 'equals', value: 'true' }, // String "true" should convert to boolean true
            ],
          },
          deleteConditionLogic: 'and',
          deleteCaseSensitive: false,
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0]).toHaveLength(1);
        expect(result[0][0].json.name).toBe('User B');
      });
    });

    describe('Type Conversion Edge Cases', () => {
      test('should keep regular strings as strings', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', category: 'old' } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'category',
          cellValue: 'electronics', // Regular string should remain string
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.category).toBe('electronics');
        expect(typeof result[0][0].json.category).toBe('string');
      });

      test('should handle empty strings correctly', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', notes: 'some notes' } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'notes',
          cellValue: '', // Empty string should remain empty string
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.notes).toBe('');
        expect(typeof result[0][0].json.notes).toBe('string');
      });

      test('should handle JSON objects in string format', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', metadata: null } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'metadata',
          cellValue: '{"key": "value", "count": 5}', // JSON string should parse to object
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.metadata).toEqual({ key: 'value', count: 5 });
        expect(typeof result[0][0].json.metadata).toBe('object');
      });

      test('should handle JSON arrays in string format', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', tags: null } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'tags',
          cellValue: '["tag1", "tag2", "tag3"]', // JSON array string should parse to array
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.tags).toEqual(['tag1', 'tag2', 'tag3']);
        expect(Array.isArray(result[0][0].json.tags)).toBe(true);
      });

      test('should convert ISO datetime strings to Date objects', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Event A', timestamp: null } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'timestamp',
          cellValue: '2026-01-16T10:30:00Z', // ISO datetime should convert to Date
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.timestamp).toBeInstanceOf(Date);
        const timestamp = result[0][0].json.timestamp as Date;
        expect(timestamp.toISOString()).toBe('2026-01-16T10:30:00.000Z');
      });

      test('should handle strings that look like numbers but are not', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', code: '' } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'code',
          cellValue: '001-ABC', // Not a valid number, should remain string
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.code).toBe('001-ABC');
        expect(typeof result[0][0].json.code).toBe('string');
      });

      test('should handle whitespace in values correctly', async () => {
        const inputData: INodeExecutionData[] = [
          { json: { name: 'Item A', value: 0 } },
        ];

        const parameters = {
          operation: 'update',
          updateMode: 'cell',
          rowIndex: '0',
          cellFieldName: 'value',
          cellValue: '  123  ', // Should trim and convert to number
        };

        const mockThis = createMockExecuteFunctions(parameters, inputData);
        const result = await jsonCrud.execute.call(mockThis);

        expect(result[0][0].json.value).toBe(123);
        expect(typeof result[0][0].json.value).toBe('number');
      });
    });
  });
});
