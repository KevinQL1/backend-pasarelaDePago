export class DeliveryEntity {
  constructor({
    id,
    transactionId,
    address,
    status,
    estimatedDelivery,
    createdAt,
    updatedAt,
  }) {
    this.validate({ id, transactionId, address })

    this.id = id
    this.transactionId = transactionId
    this.address = address
    this.status = status
    this.estimatedDelivery = estimatedDelivery
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  validate({ id, transactionId, address }) {
    if (!id) {
      throw new Error('Delivery must have an id')
    }

    if (!transactionId) {
      throw new Error('Delivery must have a transactionId')
    }

    if (!address || typeof address !== 'string') {
      throw new Error('Delivery address is required')
    }
  }
}
