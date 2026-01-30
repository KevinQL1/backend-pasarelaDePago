export class DeliveryEntity {
  constructor({
    id,
    address,
    status,
    estimatedDelivery,
    createdAt,
    updatedAt,
  }) {
    this.validate({ id, address })

    this.id = id
    this.address = address
    this.status = status
    this.estimatedDelivery = estimatedDelivery
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  validate({ id, address }) {
    if (!id) {
      throw new Error('Delivery must have an id')
    }

    if (!address || typeof address !== 'string') {
      throw new Error('Delivery address is required')
    }
  }
}
