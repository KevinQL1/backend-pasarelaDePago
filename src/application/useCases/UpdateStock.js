import { generateShortUUID } from '#/config/utils/uuidv4.js';
import { DeliveryEntity } from '#/domain/entities/DeliveryEntity.js';

/**
* Actualiza el stock de un producto tras una compra
* Crea el delivery
*/

export class UpdateStock {
    constructor(transactionRepo, productRepo, deliveryRepo, customerRepo, paymentService) {
        this.transactionRepo = transactionRepo;
        this.productRepo = productRepo;
        this.deliveryRepo = deliveryRepo;
        this.customerRepo = customerRepo;
        this.paymentService = paymentService;
    }

    async execute(idTransaction) {
        // Obtener la transacción
        const transaction = await this.transactionRepo.findById(idTransaction)

        if (!transaction.productId) {
            throw new Error('productId is required');
        }

        // Obtener el producto
        const product = await this.productRepo.findById(transaction.productId);
        if (!product) {
            throw new Error(`Product with ID ${transaction.productId} not found`);
        }

        // Validar stock suficiente
        if (product.stock < 1 || product.stock < transaction.quantity) {
            throw new Error(`Product ${product.name} is out of stock or insufficient stock: ${product.stock} for the requested quantity ${transaction.quantity}`);
        }

        // Buscar y actualizar el estado de la transacción de wompi
        const findStatusTransaction = await this.paymentService.findAndUpdateTransactionById(transaction.wompiTransactionId);

        // Obtener customer
        const customer = await this.customerRepo.findById(transaction.customerId);

        // Definir estado y tiempo de estimación del delivery
        const transactionStatus = findStatusTransaction.status
        const isDeclined = transactionStatus === 'DECLINED';

        // **Solo actualiza el stock si la transacción fue aprobada**
        if (!isDeclined) {
            // Validar stock suficiente
            if (product.stock < transaction.quantity) {
                throw new Error(`Product ${product.name} insufficient stock: ${product.stock} for requested quantity ${transaction.quantity}`);
            }

            product.stock -= transaction.quantity;
            product.updatedAt = new Date().toISOString();

            await this.productRepo.update(product);
        }

        //crear delivery
        const newDelivery = new DeliveryEntity({
            id: generateShortUUID(),
            status: isDeclined ? 'REJECTED' : 'PENDING',
            address: customer.address,
            estimatedDelivery: isDeclined
                ? null
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const delivery = await this.deliveryRepo.save(newDelivery)

        //Actualizar estado en DynamoDB
        const updateTransaction = await this.transactionRepo.updateStatus(transaction.id, findStatusTransaction.status, findStatusTransaction.id, delivery.id)

        return { message: 'Estado actualizado', updateTransaction, delivery };
    }
}
