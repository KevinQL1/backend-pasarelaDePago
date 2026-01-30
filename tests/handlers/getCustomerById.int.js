import { jest } from '@jest/globals'

process.env.CUSTOMER_TABLE = 'mockCustomerTable'

const mockExecute = jest.fn()

jest.unstable_mockModule('#/application/useCases/GetCutomerById.js', () => ({
  GetCustomerById: jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}))

const { handler } = await import('#/handlers/getCustomerById.js')

describe('GetCustomerById Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and customer when use case succeeds', async () => {
    const mockCustomer = { id: '1', name: 'Customer 1' }

    mockExecute.mockResolvedValue(mockCustomer)

    const response = await handler({ pathParameters: { idCustomer: '1'.padEnd(6, '0') } })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual(mockCustomer)
  })

  it('should return 400 when validation fails', async () => {
    const response = await handler({ pathParameters: { idCustomer: 'short' } })

    expect(response.statusCode).toBe(400)
  })

  it('should return 500 when use case throws error', async () => {
    mockExecute.mockRejectedValue(new Error('Database error'))

    const response = await handler({ pathParameters: { idCustomer: '1'.padEnd(6, '0') } })

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body).detail).toBe('An unexpected error has occurred, contact the administrator.')
  })
})
