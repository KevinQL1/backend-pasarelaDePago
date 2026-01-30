import { GetDeliveryById } from '#/application/useCases/GetDeliveryById.js'
import { DeliveryEntity } from '#/domain/entities/DeliveryEntity.js'

describe('GetDeliveryById Use Case', () => {
  it('should return delivery when repository returns it', async () => {
    const fakeRepo = { findById: async (id) => new DeliveryEntity({ id, transactionId: 'tx-1', address: 'Street 1' }) }

    const useCase = new GetDeliveryById(fakeRepo)

    const delivery = await useCase.execute('del-1')

    expect(delivery).toBeInstanceOf(DeliveryEntity)
    expect(delivery.address).toBe('Street 1')
  })

  it('should throw if repository is not provided', () => {
    expect(() => new GetDeliveryById()).toThrow('DeliveryRepository is required')
  })

  it('should throw if invalid id', async () => {
    const fakeRepo = { findById: async () => null }
    const useCase = new GetDeliveryById(fakeRepo)

    await expect(useCase.execute()).rejects.toThrow('Invalid delivery ID')
  })

  it('should throw if delivery not found', async () => {
    const fakeRepo = { findById: async () => null }
    const useCase = new GetDeliveryById(fakeRepo)

    await expect(useCase.execute('non-existent')).rejects.toThrow('Delivery not found')
  })
})
