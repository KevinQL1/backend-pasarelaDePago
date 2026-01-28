import { TransactionDynamoDB } from '#/infrastructure/dynamodb/TransactionDynamoRepo.js';
import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoRepo.js';
import { DeliveryDynamoDB } from '#/infrastructure/dynamodb/DeliveryDynamoRepo.js';
import { UpdateStock } from '#/application/useCases/UpdateStock.js';
import { v4 as uuidv4 } from 'uuid';

const transactionRepo = new TransactionDynamoDB(process.env.TRANSACTION_TABLE);
const productRepo = new ProductDynamoDB(process.env.PRODUCT_TABLE);
const deliveryRepo = new DeliveryDynamoDB(process.env.DELIVERY_TABLE);

const updateStockUseCase = new UpdateStock({ productRepository: productRepo });

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const wompiTransactionId = body.data?.id;
    const status = body.data?.status;

    if (!wompiTransactionId || !status) {
      return { statusCode: 400, body: 'Invalid payload' };
    }

    // Buscar la transacción por wompiTransactionId
    const transaction = await transactionRepo.findByWompiId(wompiTransactionId);
    if (!transaction) {
      return { statusCode: 404, body: 'Transaction not found' };
    }

    // Actualizar estado de la transacción
    transaction.status = status;
    transaction.updatedAt = new Date().toISOString();
    transaction.wompiTransactionId = wompiTransactionId;
    await transactionRepo.update(transaction);

    // Si es aprobado, actualizar stock y crear delivery
    if (status === 'APPROVED') {
      // Actualizar stock
      await updateStockUseCase.execute({
        productId: transaction.productId,
        quantity: 1,
      });

      // Crear delivery
      const delivery = {
        id: uuidv4(),
        transactionId: transaction.id,
        address: transaction.deliveryAddress || 'Address not provided',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await deliveryRepo.save(delivery);
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: err.message };
  }
};
