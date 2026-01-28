import { TransactionDynamoDB } from '#/infrastructure/dynamodb/TransactionDynamoDB.js';
import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoDB.js';
import { DeliveryDynamoDB } from '#/infrastructure/dynamodb/DeliveryDynamoDB.js';
import { UpdateStock } from '#/application/useCases/UpdateStock.js';
import { v4 as uuidv4 } from 'uuid';


export const handler = async (event) => {
  const transactionDynamoDB = new TransactionDynamoDB(process.env.TRANSACTION_TABLE);
  const productDynamoDB = new ProductDynamoDB(process.env.PRODUCT_TABLE);
  const deliveryDynamoDB = new DeliveryDynamoDB(process.env.DELIVERY_TABLE);
  const updateStockUseCase = new UpdateStock({ productRepository: productDynamoDB });

  try {
    const body = JSON.parse(event.body);

    const wompiTransactionId = body.data?.id;
    const status = body.data?.status;

    if (!wompiTransactionId || !status) {
      return { statusCode: 400, body: 'Invalid payload' };
    }

    // Buscar la transacción por wompiTransactionId
    const transaction = await transactionDynamoDB.findById(wompiTransactionId);
    if (!transaction) {
      return { statusCode: 404, body: 'Transaction not found' };
    }

    // Actualizar estado de la transacción
    transaction.status = status;
    transaction.updatedAt = new Date().toISOString();
    transaction.wompiTransactionId = wompiTransactionId;
    await transactionDynamoDB.update(transaction);

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

      await deliveryDynamoDB.save(delivery);
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: err.message };
  }
};
