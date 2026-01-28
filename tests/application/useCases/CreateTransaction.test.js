import { CreateTransaction } from '#/application/useCases/CreateTransaction.js';
import { TransactionStatus } from '#/domain/entities/TransactionEntity.js';
import { jest } from '@jest/globals';

describe('CreateTransaction Use Case', () => {
  let transactionRepositoryMock;
  let productRepositoryMock;

  beforeEach(() => {
    transactionRepositoryMock = {
      save: jest.fn(),
    };

    productRepositoryMock = {
      findById: jest.fn()
    };

    jest.clearAllMocks();
  });

  it('should throw error if repositories are missing', () => {
    expect(() => new CreateTransaction()).toThrow('TransactionRepository is required');
    expect(() => new CreateTransaction(transactionRepositoryMock)).toThrow('ProductRepository is required');
  });

  it('should throw error for invalid transaction data', async () => {
    const useCase = new CreateTransaction(transactionRepositoryMock, productRepositoryMock);

    await expect(
      useCase.execute({ customerId: '', productId: 'p1', amount: 0 })
    ).rejects.toThrow('Invalid transaction data');
  });

  it('should throw error if product not found', async () => {
    productRepositoryMock.findById.mockResolvedValue(null);
    const useCase = new CreateTransaction(transactionRepositoryMock, productRepositoryMock);

    await expect(
      useCase.execute({ customerId: 'c1', productId: 'p1', amount: 1000 })
    ).rejects.toThrow('Product with ID p1 not found');
  });

  it('should throw error if product is out of stock', async () => {
    productRepositoryMock.findById.mockResolvedValue({ id: 'p1', name: 'Producto', stock: 0 });
    const useCase = new CreateTransaction(transactionRepositoryMock, productRepositoryMock);

    await expect(
      useCase.execute({ customerId: 'c1', productId: 'p1', amount: 1000 })
    ).rejects.toThrow('Product Producto is out of stock');
  });

  it('should create a pending transaction if valid', async () => {
    productRepositoryMock.findById.mockResolvedValue({ id: 'p1', name: 'Producto', stock: 5 });
    const useCase = new CreateTransaction(transactionRepositoryMock, productRepositoryMock);

    const transaction = await useCase.execute({
      customerId: 'c1',
      productId: 'p1',
      amount: 15000,
    });

    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.id).toBeDefined();
    expect(transactionRepositoryMock.save).toHaveBeenCalledTimes(1);
  });
});
