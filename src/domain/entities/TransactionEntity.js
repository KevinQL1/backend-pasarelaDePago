/*
 * Representa una transacción de pago dentro del dominio.
 * Contiene reglas de negocio y control de estados.
 */

export class TransactionEntity {
  constructor({
    id,
    productId,
    customerId,
    deliveryId,
    amount,
    status,
    cardToken,
    quantity,
    acceptanceToken,
    personalToken,
    wompiTransactionId = null,
    createdAt,
    updatedAt,
  }) {
    if (!id) throw new Error('Transaction must have an id');
    if (!productId) throw new Error('Transaction must have a productId');
    if (!customerId) throw new Error('Transaction must have a customerId');
    if (!cardToken) throw new Error('Transaction must have a cardToken');
    if (!acceptanceToken) throw new Error('Transaction must have a acceptanceToken');
    if (!personalToken) throw new Error('Transaction must have a personalToken');
    if (amount <= 0) throw new Error('Transaction amount must be greater than 0');
    if (quantity <= 0) throw new Error('Transaction quantity must be greater than 0');
    if (!createdAt || !updatedAt) {
      throw new Error('Transaction must have timestamps');
    }

    this.id = id;
    this.productId = productId;
    this.customerId = customerId;
    this.deliveryId = deliveryId;
    this.amount = amount;
    this.status = status;
    this.cardToken = cardToken;
    this.quantity = quantity;
    this.acceptanceToken = acceptanceToken;
    this.personalToken = personalToken;
    this.wompiTransactionId = wompiTransactionId;
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
