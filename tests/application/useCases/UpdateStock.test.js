import { UpdateStock } from '#/application/useCases/UpdateStock.js';
import { jest } from '@jest/globals';

describe('UpdateStock Use Case', () => {
  let productRepositoryMock;

  beforeEach(() => {
    productRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should throw error if required fields are missing', async () => {
    const useCase = new UpdateStock({ productRepository: productRepositoryMock });

    await expect(useCase.execute({ productId: '', quantity: 1 }))
      .rejects.toThrow('productId and quantity are required');

    await expect(useCase.execute({ productId: 'p1', quantity: null }))
      .rejects.toThrow('productId and quantity are required');
  });

  it('should throw error if quantity is zero or negative', async () => {
    const useCase = new UpdateStock({ productRepository: productRepositoryMock });

    await expect(useCase.execute({ productId: 'p1', quantity: 0 }))
      .rejects.toThrow('Quantity must be greater than zero');

    await expect(useCase.execute({ productId: 'p1', quantity: -5 }))
      .rejects.toThrow('Quantity must be greater than zero');
  });

  it('should throw error if product not found', async () => {
    productRepositoryMock.findById.mockResolvedValue(null);
    const useCase = new UpdateStock({ productRepository: productRepositoryMock });

    await expect(useCase.execute({ productId: 'p1', quantity: 1 }))
      .rejects.toThrow('Product with ID p1 not found');
  });

  it('should throw error if insufficient stock', async () => {
    productRepositoryMock.findById.mockResolvedValue({ id: 'p1', name: 'Producto', stock: 2 });
    const useCase = new UpdateStock({ productRepository: productRepositoryMock });

    await expect(useCase.execute({ productId: 'p1', quantity: 5 }))
      .rejects.toThrow('Insufficient stock. Available: 2, requested: 5');
  });

  it('should update stock if sufficient', async () => {
    const product = { id: 'p1', name: 'Producto', stock: 10 };
    productRepositoryMock.findById.mockResolvedValue(product);
    productRepositoryMock.update.mockResolvedValue(true);

    const useCase = new UpdateStock({ productRepository: productRepositoryMock });

    const result = await useCase.execute({ productId: 'p1', quantity: 3 });

    expect(result.stock).toBe(7);
    expect(result.updatedAt).toBeDefined();
    expect(productRepositoryMock.update).toHaveBeenCalledTimes(1);
  });
});
