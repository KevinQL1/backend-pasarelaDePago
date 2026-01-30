import { webhookSchema } from '#/infrastructure/Schemas/WebhookWompiSchema.js'
import { TransactionDynamoDB } from '#/infrastructure/dynamodb/TransactionDynamoDB.js';
import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoDB.js';
import { DeliveryDynamoDB } from '#/infrastructure/dynamodb/DeliveryDynamoDB.js';
import { CustomerDynamoDB } from '#/infrastructure/dynamodb/CustomerDynamoDB.js';
import { UpdateStock } from '#/application/useCases/UpdateStock.js';
import { PaymentService } from '#/application/services/PaymentService.js';
import { ok, badRequest, serverError } from '#/config/utils/httpResponse.js';

const transactionDynamoDB = new TransactionDynamoDB(process.env.TRANSACTION_TABLE);
const productDynamoDB = new ProductDynamoDB(process.env.PRODUCT_TABLE);
const deliveryDynamoDB = new DeliveryDynamoDB(process.env.DELIVERY_TABLE);
const customerDynamoDB = new CustomerDynamoDB(process.env.CUSTOMER_TABLE)
const paymentService = new PaymentService();
const updateStock = new UpdateStock(transactionDynamoDB, productDynamoDB, deliveryDynamoDB, customerDynamoDB, paymentService);

export const handler = async (event) => {
  try {
    const { idTransaction } = event.pathParameters;

    // Validar pathParameters con Joi
    const { error } = webhookSchema.validate(event.pathParameters, { abortEarly: false });
    if (error) {
      return badRequest(event, error);
    }

    const result = await updateStock.execute(idTransaction);

    return ok(event, result);
  } catch (err) {
    console.error('Error updating webhook: ', err)
    return serverError(event, err);
  }
};
