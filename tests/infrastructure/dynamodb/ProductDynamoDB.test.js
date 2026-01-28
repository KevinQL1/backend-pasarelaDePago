import { jest } from '@jest/globals';
import { PutCommand, GetCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Mock del cliente Dynamo
jest.unstable_mockModule('#/infrastructure/dynamodb/DynamoClient.js', () => ({
  dynamoDb: {
    send: jest.fn(),
  },
}));

// Mock de la entidad Product
jest.unstable_mockModule('#/domain/entities/ProductEntity.js', () => ({
  ProductEntity: class ProductEntity {
    constructor(data) {
      Object.assign(this, data);
    }
  },
}));

describe('ProductDynamoDB', () => {
  let ProductDynamoDB;
  let dynamoDb;
  const tableName = 'ProductTable';
  let repository;

  beforeEach(async () => {
    ({ dynamoDb } = await import('#/infrastructure/dynamodb/DynamoClient.js'));
    ({ ProductDynamoDB } = await import('#/infrastructure/dynamodb/ProductDynamoDB.js')); // ✅ Ruta correcta
    repository = new ProductDynamoDB(tableName);
    jest.clearAllMocks();
  });

  it('should throw error if tableName is missing', () => {
    expect(() => new ProductDynamoDB()).toThrow('Table name is required');
  });

  it('should find all products', async () => {
    const items = [
      { id: 'p1', name: 'Product 1', price: 100, stock: 10 },
      { id: 'p2', name: 'Product 2', price: 200, stock: 5 },
    ];
    dynamoDb.send.mockResolvedValue({ Items: items });

    const result = await repository.findAll();

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('p1');
  });

  it('should find product by id', async () => {
    const item = { id: 'p1', name: 'Product 1', price: 100, stock: 10 };
    dynamoDb.send.mockResolvedValue({ Item: item });

    const result = await repository.findById('p1');

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(GetCommand));
    expect(result.id).toBe('p1');
    expect(result.price).toBe(100);
  });

  it('should return null if product not found', async () => {
    dynamoDb.send.mockResolvedValue({ Item: null });

    const result = await repository.findById('unknown');

    expect(result).toBeNull();
  });

  it('should save a product', async () => {
    const product = { id: 'p1', name: 'Product 1', price: 100, stock: 10 };
    dynamoDb.send.mockResolvedValue({});

    await repository.save(product);

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it('should update a product', async () => {
    const product = { id: 'p1', name: 'Product 1', description: 'Desc', price: 100, stock: 10, updatedAt: '2026-01-28T00:00:00Z' };
    dynamoDb.send.mockResolvedValue({});

    await repository.update(product);

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(UpdateCommand));
  });
});
