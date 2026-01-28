import { jest } from '@jest/globals';

// Mocks globales
const findByIdMock = jest.fn();
const updateMock = jest.fn();
const executeMock = jest.fn();
const saveMock = jest.fn();

// Mock de clases
jest.unstable_mockModule('#/infrastructure/dynamodb/TransactionDynamoDB.js', () => ({
  TransactionDynamoDB: jest.fn().mockImplementation(() => ({
    findById: findByIdMock,
    update: updateMock,
  })),
}));

jest.unstable_mockModule('#/infrastructure/dynamodb/ProductDynamoDB.js', () => ({
  ProductDynamoDB: jest.fn().mockImplementation(() => ({})),
}));

jest.unstable_mockModule('#/infrastructure/dynamodb/DeliveryDynamoDB.js', () => ({
  DeliveryDynamoDB: jest.fn().mockImplementation(() => ({
    save: saveMock,
  })),
}));

jest.unstable_mockModule('#/application/useCases/UpdateStock.js', () => ({
  UpdateStock: jest.fn().mockImplementation(() => ({
    execute: executeMock,
  })),
}));

jest.unstable_mockModule('uuid', () => ({
  v4: jest.fn(() => 'uuid-1234'),
}));

// Importamos handler después de los mocks
const { handler } = await import('#/handlers/webhookWompi.handler.js');

describe('webhookWompi.handler', () => {

  beforeEach(() => {
    // Limpiar mocks antes de cada test
    findByIdMock.mockReset();
    updateMock.mockReset();
    executeMock.mockReset();
    saveMock.mockReset();
  });

  it('should return 400 if payload is invalid', async () => {
    const event = { body: '{}' };
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
    expect(res.body).toBe('Invalid payload');
  });

  it('should return 404 if transaction not found', async () => {
    findByIdMock.mockResolvedValue(null);

    const event = { body: JSON.stringify({ data: { id: 'w123', status: 'APPROVED' } }) };
    const res = await handler(event);

    expect(findByIdMock).toHaveBeenCalledWith('w123');
    expect(res.statusCode).toBe(404);
    expect(res.body).toBe('Transaction not found');
  });

  it('should update transaction, stock, and create delivery if APPROVED', async () => {
    const transaction = { id: 't1', productId: 'p1', deliveryAddress: 'Calle 123' };
    findByIdMock.mockResolvedValue(transaction);

    const event = { body: JSON.stringify({ data: { id: 'w123', status: 'APPROVED' } }) };
    const res = await handler(event);

    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 't1',
      status: 'APPROVED',
      wompiTransactionId: 'w123',
    }));

    expect(executeMock).toHaveBeenCalledWith({ productId: 'p1', quantity: 1 });
    expect(saveMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 'uuid-1234',
      transactionId: 't1',
      address: 'Calle 123',
      status: 'PENDING',
    }));

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('OK');
  });

  it('should update transaction but not stock or delivery if DECLINED', async () => {
    const transaction = { id: 't1', productId: 'p1', deliveryAddress: 'Calle 123' };
    findByIdMock.mockResolvedValue(transaction);

    const event = { body: JSON.stringify({ data: { id: 'w123', status: 'DECLINED' } }) };
    const res = await handler(event);

    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'DECLINED' }));
    expect(executeMock).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('OK');
  });

  it('should return 500 if unexpected error occurs', async () => {
    findByIdMock.mockRejectedValue(new Error('DB failure'));

    const event = { body: JSON.stringify({ data: { id: 'w123', status: 'APPROVED' } }) };
    const res = await handler(event);

    expect(res.statusCode).toBe(500);
    expect(res.body).toBe('DB failure');
  });
});
