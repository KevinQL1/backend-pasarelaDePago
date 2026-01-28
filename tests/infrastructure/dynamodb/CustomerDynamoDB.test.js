import { jest } from '@jest/globals';
import { PutCommand, GetCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

jest.unstable_mockModule('#/infrastructure/dynamodb/DynamoClient.js', () => ({
  dynamoDb: {
    send: jest.fn(),
  },
}));

jest.unstable_mockModule('#/domain/entities/CustomerEntity.js', () => ({
  CustomerEntity: class CustomerEntity {
    constructor(data) {
      Object.assign(this, data);
    }
  },
}));

describe('CustomerDynamoDB', () => {
  let CustomerDynamoDB;
  let dynamoDb;
  const tableName = 'CustomersTable';
  let repository;

  beforeEach(async () => {
    ({ dynamoDb } = await import('#/infrastructure/dynamodb/DynamoClient.js'));
    ({ CustomerDynamoDB } = await import('#/infrastructure/dynamodb/CustomerDynamoDB.js'));

    repository = new CustomerDynamoDB(tableName);
    jest.clearAllMocks();
  });

  it('should throw error if tableName is missing', () => {
    expect(() => new CustomerDynamoDB()).toThrow('Table name is required');
  });

  it('should find all customers', async () => {
    const items = [
      { id: 'c1', name: 'John' },
      { id: 'c2', name: 'Jane' },
    ];
    dynamoDb.send.mockResolvedValue({ Items: items });

    const result = await repository.findAll();

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('c1');
  });

  it('should find customer by id', async () => {
    const item = { id: 'c1', name: 'John' };
    dynamoDb.send.mockResolvedValue({ Item: item });

    const result = await repository.findById('c1');

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(GetCommand));
    expect(result.id).toBe('c1');
  });

  it('should return null if customer not found', async () => {
    dynamoDb.send.mockResolvedValue({ Item: null });

    const result = await repository.findById('unknown');

    expect(result).toBeNull();
  });

  it('should save a customer', async () => {
    const customer = { id: 'c1', name: 'John' };
    dynamoDb.send.mockResolvedValue({});

    await repository.save(customer);

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it('should update a customer', async () => {
    const customer = { id: 'c1', name: 'John', email: 'john@mail.com', address: '123 St', savedCard: '1234', updatedAt: '2026-01-28T00:00:00Z' };
    dynamoDb.send.mockResolvedValue({});

    await repository.update(customer);

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(UpdateCommand));
  });
});
