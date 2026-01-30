import { GetCustomerById } from '#/application/useCases/GetCutomerById.js'
import { CustomerEntity } from '#/domain/entities/CustomerEntity.js'

describe('GetCustomerById Use Case', () => {
  it('should return customer when repository returns it', async () => {
    const fakeRepo = { findById: async (id) => new CustomerEntity({ id, name: 'John', email: 'john@example.com', address: 'Street', city: 'City', phone: '3001234567' }) }

    const useCase = new GetCustomerById(fakeRepo)

    const customer = await useCase.execute('cust-1')

    expect(customer).toBeInstanceOf(CustomerEntity)
    expect(customer.name).toBe('John')
  })

  it('should throw if repository is not provided', () => {
    expect(() => new GetCustomerById()).toThrow('CustomerRepository is required')
  })

  it('should throw if invalid id', async () => {
    const fakeRepo = { findById: async () => null }
    const useCase = new GetCustomerById(fakeRepo)

    await expect(useCase.execute()).rejects.toThrow('Invalid customer ID')
  })

  it('should throw if customer not found', async () => {
    const fakeRepo = { findById: async () => null }
    const useCase = new GetCustomerById(fakeRepo)

    await expect(useCase.execute('non-existent')).rejects.toThrow('Customer not found')
  })
})
