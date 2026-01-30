export class ProductEntity {
  constructor({
    id,
    name,
    description,
    price,
    stock,
    createdAt,
    updatedAt 
  }) {
    this.validate({ id, name, price, stock })

    this.id = id
    this.name = name
    this.description = description || ''
    this.price = price
    this.stock = stock
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  validate({ id, name, price, stock }) {
    if (!id) {
      throw new Error('Product id is required')
    }

    if (!name || typeof name !== 'string') {
      throw new Error('Product name is required')
    }

    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Product price must be greater than 0')
    }

    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('Product stock must be a non-negative integer')
    }
  }

  hasStock(quantity = 1) {
    return this.stock >= quantity
  }

  decreaseStock(quantity = 1) {
    if (!this.hasStock(quantity)) {
      throw new Error('Insufficient stock')
    }

    this.stock -= quantity
  }
}
