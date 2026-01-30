import { generateShortUUID } from '#/config/utils/uuidv4.js';
import { TransactionEntity } from '#/domain/entities/TransactionEntity.js';
import { CustomerEntity } from '#/domain/entities/CustomerEntity.js';


export class ProcessPayment {
  constructor(transactionRepo, productRepo, customerRepo, paymentService) {
    this.transactionRepo = transactionRepo;
    this.productRepo = productRepo;
    this.customerRepo = customerRepo;
    this.paymentService = paymentService;
  }

  /**
   * Ejecuta el proceso de pago de una transacción
   */

  async execute(paymentInfo) {
    const { productId, quantity } = paymentInfo

    // Validar stock antes de pagar
    const product = await this.productRepo.findById(productId);
    if (!product) throw new Error(`Product with ID ${productId} not found`);
    if (product.stock < 1 || product.stock < quantity) {
      throw new Error(`Product ${product.name} is out of stock or insufficient stock: ${product.stock} for the requested quantity ${quantity}`);
    }

    // Procesar pago con Wompi
    const paymentResult = await this.paymentService.processPayment(paymentInfo);

    const now = new Date().toISOString();

    // Creando usuario
    const newCustomer = new CustomerEntity({
      id: paymentInfo.customer.cedula,
      name: paymentInfo.customer.name,
      address: paymentInfo.customer.address,
      city: paymentInfo.customer.city,
      phone: paymentInfo.customer.phone,
      email: paymentInfo.customer.email,
      createdAt: now,
      updatedAt: now,
    });

    await this.customerRepo.save(newCustomer)

    // Creando transaccion
    const newTransaction = new TransactionEntity({
      id: generateShortUUID(),
      productId,
      quantity,
      customerId: paymentInfo.customer.cedula,
      amount: (product.price * quantity) * 100,
      status: paymentResult.status,
      cardToken: paymentResult.tokenCard.id,
      acceptanceToken: paymentResult.tokenMerchants.presigned_acceptance.acceptance_token,
      personalToken: paymentResult.tokenMerchants.presigned_personal_data_auth.acceptance_token,
      createdAt: now,
      updatedAt: now,
    });

    const transaction = await this.transactionRepo.save(newTransaction)

    return transaction
  }
}
