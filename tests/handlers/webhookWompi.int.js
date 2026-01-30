import { jest } from '@jest/globals';

// Set env vars required by handler module initialization
process.env.TRANSACTION_TABLE = 'mockTransactionTable';
process.env.PRODUCT_TABLE = 'mockProductTable';
process.env.DELIVERY_TABLE = 'mockDeliveryTable';
process.env.CUSTOMER_TABLE = 'mockCustomerTable';

// Mock UpdateStock at module load time
const executeMock = jest.fn();

jest.unstable_mockModule('#/application/useCases/UpdateStock.js', () => ({
  UpdateStock: jest.fn().mockImplementation(() => ({
    execute: executeMock,
  })),
}));

// Import handler after mocks
const { handler } = await import('#/handlers/webhookWompi.js');

describe('webhookWompi.handler (current behavior)', () => {
  beforeEach(() => {
    executeMock.mockReset();
  });

  it('should return 400 when path params invalid', async () => {
    const event = { pathParameters: {} };
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
  });

  it('should call UpdateStock and return 200 when id provided', async () => {
    executeMock.mockResolvedValue({ message: 'Estado actualizado' });

    const event = { pathParameters: { idTransaction: '00000000000000000' } };
    const res = await handler(event);

    expect(executeMock).toHaveBeenCalledWith('00000000000000000');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ message: 'Estado actualizado' });
  });

  it('should return 500 when UpdateStock throws', async () => {
    executeMock.mockRejectedValue(new Error('failure'));

    const event = { pathParameters: { idTransaction: '00000000000000000' } };
    const res = await handler(event);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body).detail).toBe('An unexpected error has occurred, contact the administrator.');
  });
});
