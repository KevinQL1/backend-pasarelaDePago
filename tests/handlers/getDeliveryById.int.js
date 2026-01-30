import { jest } from '@jest/globals'

process.env.DELIVERY_TABLE = 'mockDeliveryTable'

const mockExecute = jest.fn()

jest.unstable_mockModule('#/application/useCases/GetDeliveryById.js', () => ({
  GetDeliveryById: jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}))

const { handler } = await import('#/handlers/getDeliveryById.js')

describe('GetDeliveryById Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and delivery when use case succeeds', async () => {
    const mockDelivery = { id: '1', address: 'Address 1' }

    mockExecute.mockResolvedValue(mockDelivery)

    const response = await handler({ pathParameters: { idDelivery: '1'.padEnd(17, '0') } })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual(mockDelivery)
  })

  it('should return 400 when validation fails', async () => {
    const response = await handler({ pathParameters: { idDelivery: 'short' } })

    expect(response.statusCode).toBe(400)
  })

  it('should return 500 when use case throws error', async () => {
    mockExecute.mockRejectedValue(new Error('Database error'))

    const response = await handler({ pathParameters: { idDelivery: '1'.padEnd(17, '0') } })

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body).detail).toBe('An unexpected error has occurred, contact the administrator.')
  })
})
