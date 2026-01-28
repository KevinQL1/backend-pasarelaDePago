import { ProcessPayment } from '#/application/useCases/ProcessPayment.js';
import { TransactionRepository } from '#/domain/repositories/TransactionRepository.js';
import { ProductRepository } from '#/domain/repositories/ProductRepository.js';
import { PaymentService } from '#/application/services/PaymentService.js';

const transactionRepo = new TransactionRepository();
const productRepo = new ProductRepository();
const paymentService = new PaymentService();
const processPaymentUC = new ProcessPayment(transactionRepo, productRepo, paymentService);

export const handler = async (event) => {
  const { transactionId } = event.pathParameters;
  const body = JSON.parse(event.body);

  try {
    const result = await processPaymentUC.execute(transactionId, body.paymentInfo);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
