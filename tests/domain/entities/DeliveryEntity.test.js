import { DeliveryEntity } from '#/domain/entities/DeliveryEntity.js'

describe('DeliveryEntity', () => {
  it('should throw error if id is missing', () => {
    expect(() => new DeliveryEntity({
      id: '',
      address: 'Calle 123'
    })).toThrow('Delivery must have an id')
  })

  it('should create delivery correctly', () => {
    const delivery = new DeliveryEntity({
      id: 'd1',
      address: 'Calle 123',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    expect(delivery.id).toBe('d1')
    expect(delivery.status).toBe('PENDING')
  })
})
