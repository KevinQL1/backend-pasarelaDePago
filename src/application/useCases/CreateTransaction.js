/**
 * Caso de uso encargado de crear una transacción de pago
 * en estado PENDING antes de llamando a la pasarela (Wompi).
 */
export class CreateTransaction {
  constructor(transactionRepo, productRepo, customerRepo, paymentService) {
    this.transactionRepo = transactionRepo;
    this.productRepo = productRepo;
    this.customerRepo = customerRepo
    this.paymentService = paymentService;
  }

  async execute(idTransaction) {
    // Obtener la transacción
    const transaction = await this.transactionRepo.findById(idTransaction)
    if (!transaction) {
      throw new Error(`Transaction with ID ${idTransaction} not found`);
    }

    // Validar stock del producto
    const product = await this.productRepo.findById(transaction.productId);
    if (!product) {
      throw new Error(`Product with ID ${transaction.productId} not found`);
    }
    if (product.stock < 1 || product.stock < transaction.quantity) {
      throw new Error(`Product ${product.name} is out of stock or insufficient stock: ${product.stock} for the requested quantity ${transaction.quantity}`);
    }

    //Obtener el Customer
    const customer = await this.customerRepo.findById(transaction.customerId)
    if (!customer) {
      throw new Error(`Customer with ID ${transaction.customerId} not found`);
    }

    const createTransaction = await this.paymentService.createPayment(transaction, customer)

    const updateTransaction = await this.transactionRepo.updateStatus(transaction.id, createTransaction.status, createTransaction.id)

    return { message: 'Estado actualizado', updateTransaction };
  }
}
