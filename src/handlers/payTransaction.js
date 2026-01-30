import { ProcessPayment } from '#/application/useCases/ProcessPayment.js';
import { TransactionDynamoDB } from '#/infrastructure/dynamodb/TransactionDynamoDB.js';
import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoDB.js';
import { PaymentService } from '#/application/services/PaymentService.js';
import { CustomerDynamoDB } from '#/infrastructure/dynamodb/CustomerDynamoDB.js';
import { payProcessSchema } from '#/infrastructure/Schemas/PayTransactionSchema.js'

const transactionRepo = new TransactionDynamoDB(process.env.TRANSACTION_TABLE);
const productRepo = new ProductDynamoDB(process.env.PRODUCT_TABLE);
const customerRepo = new CustomerDynamoDB(process.env.CUSTOMER_TABLE)
const paymentService = new PaymentService();
const processPayment = new ProcessPayment(transactionRepo, productRepo, customerRepo, paymentService);

export const handler = async (event) => {
  const body = JSON.parse(event.body);

  // Validar body con Joi
  const { error } = payProcessSchema.validate(body, { abortEarly: false });
  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        errors: error.details.map(e => e.message)
      }),
    };
  }

  try {
    const result = await processPayment.execute(body.paymentInfo);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('Error processing transaction: ', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
