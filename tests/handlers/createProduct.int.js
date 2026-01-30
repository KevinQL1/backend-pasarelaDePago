import { jest } from '@jest/globals';

/**
 * ⚠️ IMPORTANTE:
 * Las env vars y mocks DEBEN definirse antes del import del handler
 */
process.env.PRODUCT_TABLE = 'mock-product-table';

// ---------- MOCKS ----------
const mockExecute = jest.fn();

jest.unstable_mockModule('#/application/useCases/CreateProduct.js', () => ({
  CreateProduct: jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}));

jest.unstable_mockModule('#/infrastructure/dynamodb/ProductDynamoDB.js', () => ({
  ProductDynamoDB: jest.fn(),
}));

// ---------- IMPORT REAL ----------
const { handler } = await import('#/handlers/createProduct.js');

describe('createProduct.handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------
  // 400 - Missing required fields
  // -------------------------------
  it('should return 400 when required fields are missing', async () => {
    const event = {
      body: JSON.stringify({
        name: 'Product',
        description: 'Desc',
        price: 100,
        // stock missing
      }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).detail).toBe('Missing required fields');

    expect(mockExecute).not.toHaveBeenCalled();
  });

  // -------------------------------
  // 201 - Product created
  // -------------------------------
  it('should return 201 when product is created successfully', async () => {
    const mockProduct = {
      id: '123',
      name: 'Laptop',
      description: 'Gaming laptop',
      price: 2500,
      stock: 10,
    };

    mockExecute.mockResolvedValue(mockProduct);

    const event = {
      body: JSON.stringify({
        name: 'Laptop',
        description: 'Gaming laptop',
        price: 2500,
        stock: 10,
      }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);

    expect(body.message).toBe('Product created');
    expect(body.product).toEqual(mockProduct);

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith({
      name: 'Laptop',
      description: 'Gaming laptop',
      price: 2500,
      stock: 10,
    });
  });

  // -------------------------------
  // 500 - Internal server error
  // -------------------------------
  it('should return 500 on internal error', async () => {
    mockExecute.mockRejectedValue(new Error('DB exploded'));

    const event = {
      body: JSON.stringify({
        name: 'Laptop',
        description: 'Gaming laptop',
        price: 2500,
        stock: 10,
      }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).detail).toBe('An unexpected error has occurred, contact the administrator.');

    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  // -------------------------------
  // Edge case: empty body
  // -------------------------------
  it('should return 400 when body is empty', async () => {
    const event = {};

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).detail).toBe('Missing required fields');
  });
});
