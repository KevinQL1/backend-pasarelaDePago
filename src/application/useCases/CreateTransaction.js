import { v4 as uuidv4 } from 'uuid';
import { TransactionEntity, TransactionStatus } from '#/domain/entities/TransactionEntity.js';

/**
 * Caso de uso encargado de crear una transacción de pago
 * en estado PENDING antes de llamar a la pasarela (Wompi).
 */
export class CreateTransaction {
  constructor(transactionRepository, productRepository) {
    if (!transactionRepository) throw new Error('TransactionRepository is required');
    if (!productRepository) throw new Error('ProductRepository is required');

    this.transactionRepository = transactionRepository;
    this.productRepository = productRepository;
  }

  async execute({ customerId, productId, amount }) {
    if (!customerId || !productId || amount <= 0) {
      throw new Error('Invalid transaction data');
    }

    // Validar stock del producto
    const product = await this.productRepository.findById(productId);
    if (!product) throw new Error(`Product with ID ${productId} not found`);
    if (product.stock < 1) throw new Error(`Product ${product.name} is out of stock`);

    const now = new Date().toISOString();
    const transaction = new TransactionEntity({
      id: uuidv4(),
      customerId,
      productId,
      amount,
      status: TransactionStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });

    await this.transactionRepository.save(transaction);

    return transaction;
  }
}
