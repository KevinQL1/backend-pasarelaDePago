import { jest } from '@jest/globals';

process.env.PRODUCT_TABLE = 'mockProductTable'
process.env.TRANSACTION_TABLE = 'mockTransactionTable'
process.env.CUSTOMER_TABLE = 'mockCustomerTable'

const mockUpdateStatus = jest.fn().mockResolvedValue(true);
const mockDecreaseStock = jest.fn().mockResolvedValue(true);
const mockExecute = jest.fn(); // <-- mock para ProcessPayment.execute

// Mock repositorios
jest.unstable_mockModule('#/domain/repositories/TransactionRepository.js', () => ({
  TransactionRepository: class {
    findById = jest.fn().mockResolvedValue({ id: 't1', productId: 'p1' });
    updateStatus = mockUpdateStatus;
  }
}));

jest.unstable_mockModule('#/domain/repositories/ProductRepository.js', () => ({
  ProductRepository: class {
    decreaseStock = mockDecreaseStock;
  }
}));

// Mock ProcessPayment
jest.unstable_mockModule('#/application/useCases/ProcessPayment.js', () => ({
  ProcessPayment: class {
    execute = mockExecute;
  }
}));

describe('payTransaction.handler', () => {
  let handler;

  beforeEach(async () => {
    ({ handler } = await import('#/handlers/payTransaction.js'));
    jest.clearAllMocks();
  });

  it('should return 200 with approved status', async () => {
    // Mockear execute para que apruebe el pago
    mockExecute.mockResolvedValueOnce({
      status: 'APPROVED',
      wompiTransactionId: 'w123'
    });

    const event = {
      pathParameters: { transactionId: 't1' },
      body: JSON.stringify({ paymentInfo: {
        cardNumber: '4111111111111111', cardType: 'VISA', expiry: '12/29', cvc: '123', customer: { cedula: '1234567', name: 'Juan', email: 'a@b.com', address: 'Calle 1', city: 'Bogota', phone: '3111111111' }, productId: '00000000000000001', quantity: 1
      } })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('APPROVED');
    expect(body.wompiTransactionId).toBe('w123');
    expect(mockExecute).toHaveBeenCalled();
  });

  it('should return 400 if execute throws an error', async () => {
    mockExecute.mockRejectedValueOnce(new Error('Payment failed'));

    const event = {
      pathParameters: { transactionId: 't1' },
      body: JSON.stringify({ paymentInfo: {
        cardNumber: '4111111111111111', cardType: 'VISA', expiry: '12/29', cvc: '123', customer: { cedula: '1234567', name: 'Juan', email: 'a@b.com', address: 'Calle 1', city: 'Bogota', phone: '3111111111' }, productId: '00000000000000001', quantity: 1
      } })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(500);
    expect(body.detail).toBe('An unexpected error has occurred, contact the administrator.');
  });
});
