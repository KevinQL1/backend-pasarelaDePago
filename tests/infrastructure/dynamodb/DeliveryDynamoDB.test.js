import { jest } from '@jest/globals';
import { PutCommand, GetCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Mock del cliente Dynamo
jest.unstable_mockModule('#/infrastructure/dynamodb/DynamoClient.js', () => ({
  dynamoDb: {
    send: jest.fn(),
  },
}));

// Mock de la entidad Delivery
jest.unstable_mockModule('#/domain/entities/DeliveryEntity.js', () => ({
  DeliveryEntity: class DeliveryEntity {
    constructor(data) {
      Object.assign(this, data);
    }
  },
}));

describe('DeliveryDynamoDB', () => {
  let DeliveryDynamoDB;
  let dynamoDb;
  const tableName = 'DeliveryTable';
  let repository;

  beforeEach(async () => {
    ({ dynamoDb } = await import('#/infrastructure/dynamodb/DynamoClient.js'));
    ({ DeliveryDynamoDB } = await import('#/infrastructure/dynamodb/DeliveryDynamoDB.js'));
    repository = new DeliveryDynamoDB(tableName);
    jest.clearAllMocks();
  });

  it('should throw error if tableName is missing', () => {
    expect(() => new DeliveryDynamoDB()).toThrow('Table name is required');
  });

  it('should find all deliveries', async () => {
    const items = [
      { id: 'd1', address: 'Address 1', status: 'PENDING' },
      { id: 'd2', address: 'Address 2', status: 'DELIVERED' },
    ];
    dynamoDb.send.mockResolvedValue({ Items: items });

    const result = await repository.findAll();

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('d1');
  });

  it('should find delivery by id', async () => {
    const item = { id: 'd1', address: 'Address 1', status: 'PENDING' };
    dynamoDb.send.mockResolvedValue({ Item: item });

    const result = await repository.findById('d1');

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(GetCommand));
    expect(result.id).toBe('d1');
    expect(result.status).toBe('PENDING');
  });

  it('should return null if delivery not found', async () => {
    dynamoDb.send.mockResolvedValue({ Item: null });

    const result = await repository.findById('unknown');

    expect(result).toBeNull();
  });

  it('should save a delivery', async () => {
    const delivery = { id: 'd1', address: 'Address 1', status: 'PENDING' };
    dynamoDb.send.mockResolvedValue({});

    await repository.save(delivery);

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it('should update a delivery', async () => {
    const delivery = { id: 'd1', address: 'Address 1', status: 'DELIVERED', updatedAt: '2026-01-28T00:00:00Z' };
    dynamoDb.send.mockResolvedValue({});

    await repository.update(delivery);

    expect(dynamoDb.send).toHaveBeenCalledWith(expect.any(UpdateCommand));
  });
});
