export class ProcessPayment {
  constructor(transactionRepo, productRepo, paymentService) {
    this.transactionRepo = transactionRepo;
    this.productRepo = productRepo;
    this.paymentService = paymentService;
  }

  /**
   * Ejecuta el proceso de pago de una transacción
   */

  async execute(transactionId, paymentInfo) {
    const { cardNumber, cardType, customerAddress } = paymentInfo;

    if (!cardNumber || !cardType) throw new Error('Card number and type are required');
    if (!customerAddress || customerAddress.trim() === '') throw new Error('Delivery address is required');
    if (!/^\d{16}$/.test(cardNumber)) throw new Error('Card number must be 16 digits');
    if (!['VISA', 'MASTERCARD'].includes(cardType.toUpperCase())) throw new Error('Only VISA and MASTERCARD allowed');

    // Obtener transacción
    const transaction = await this.transactionRepo.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    // Validar stock nuevamente antes de pagar
    const product = await this.productRepo.findById(transaction.productId);
    if (!product) throw new Error(`Product with ID ${transaction.productId} not found`);
    if (product.stock < 1) throw new Error(`Product ${product.name} is out of stock`);

    // Procesar pago con Wompi
    const paymentResult = await this.paymentService.processPayment(transactionId, paymentInfo);
    const status = paymentResult.status;

    // Actualizar transacción
    await this.transactionRepo.updateStatus(transactionId, status, paymentResult.wompiTransactionId);

    // Si es aprobado, disminuir stock
    if (status === 'APPROVED') {
      await this.productRepo.decreaseStock(transaction.productId, 1);
    }

    return {
      transactionId,
      status,
      wompiTransactionId: paymentResult.wompiTransactionId,
    };
  }
}
