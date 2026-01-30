import { GetProductById } from '#/application/useCases/GetProductById.js'
import { ProductEntity } from '#/domain/entities/ProductEntity.js'

describe('GetProductById Use Case', () => {
  it('should return product when repository returns it', async () => {
    const fakeRepo = { findById: async (id) => new ProductEntity({ id, name: 'Laptop', price: 2000, stock: 5 }) }

    const useCase = new GetProductById(fakeRepo)

    const product = await useCase.execute('prod-1')

    expect(product).toBeInstanceOf(ProductEntity)
    expect(product.name).toBe('Laptop')
  })

  it('should throw if repository is not provided', () => {
    expect(() => new GetProductById()).toThrow('ProductRepository is required')
  })

  it('should throw if invalid id', async () => {
    const fakeRepo = { findById: async () => null }
    const useCase = new GetProductById(fakeRepo)

    await expect(useCase.execute()).rejects.toThrow('Invalid product ID')
  })

  it('should throw if product not found', async () => {
    const fakeRepo = { findById: async () => null }
    const useCase = new GetProductById(fakeRepo)

    await expect(useCase.execute('non-existent')).rejects.toThrow('Product not found')
  })
})
