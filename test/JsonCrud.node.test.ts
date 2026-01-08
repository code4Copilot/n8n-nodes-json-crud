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

      expect(result[0][0].json.salary).toBe('60000');
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

      expect(result[0][0].json.salary).toBe('60000');
      expect(result[0][1].json.salary).toBe(45000);
      expect(result[0][2].json.salary).toBe('60000');
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

        expect(result[0][0].json.bonus).toBe('1000');
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

        expect(result[0][0].json.bonus).toBe('1000');
        expect(result[0][1].json.bonus).toBe('1000');
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
});
