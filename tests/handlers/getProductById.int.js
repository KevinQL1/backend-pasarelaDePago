import { jest } from '@jest/globals'

process.env.PRODUCT_TABLE = 'mockProductTable'

const mockExecute = jest.fn()

jest.unstable_mockModule('#/application/useCases/GetProductById.js', () => ({
  GetProductById: jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}))

const { handler } = await import('#/handlers/getProductById.js')

describe('GetProductById Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and product when use case succeeds', async () => {
    const mockProduct = { id: '1', name: 'Product 1' }

    mockExecute.mockResolvedValue(mockProduct)

    const response = await handler({ pathParameters: { idProduct: '1'.padEnd(17, '0') } })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual(mockProduct)
  })

  it('should return 400 when validation fails', async () => {
    const response = await handler({ pathParameters: { idProduct: 'short' } })

    expect(response.statusCode).toBe(400)
  })

  it('should return 500 when use case throws error', async () => {
    mockExecute.mockRejectedValue(new Error('Database error'))

    const response = await handler({ pathParameters: { idProduct: '1'.padEnd(17, '0') } })

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body).detail).toBe('An unexpected error has occurred, contact the administrator.')
  })
})
