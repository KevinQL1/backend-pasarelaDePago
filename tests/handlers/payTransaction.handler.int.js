import { jest } from '@jest/globals';

// Mock de repositorios y servicios
const mockUpdateStatus = jest.fn();
const mockDecreaseStock = jest.fn();
const mockProcessPayment = jest.fn().mockResolvedValue({
  status: 'APPROVED',
  wompiTransactionId: 'w123'
});

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

jest.unstable_mockModule('#/application/services/PaymentService.js', () => ({
  PaymentService: class {
    processPayment = mockProcessPayment;
  }
}));

describe('payTransaction.handler', () => {
  let handler;

  beforeEach(async () => {
    ({ handler } = await import('#/handlers/payTransaction.handler.js'));
    jest.clearAllMocks();
  });

  it('should return 200 with approved status', async () => {
    const event = {
      pathParameters: { transactionId: 't1' },
      body: JSON.stringify({ paymentInfo: {} })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('APPROVED');
    expect(body.wompiTransactionId).toBe('w123');
    expect(mockUpdateStatus).toHaveBeenCalled();
    expect(mockDecreaseStock).toHaveBeenCalled();
    expect(mockProcessPayment).toHaveBeenCalled();
  });
});
