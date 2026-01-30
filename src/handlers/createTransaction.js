import { CreateTransaction } from '#/application/useCases/CreateTransaction.js';
import { TransactionDynamoDB } from '#/infrastructure/dynamodb/TransactionDynamoDB.js';
import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoDB.js';
import { PaymentService } from '#/application/services/PaymentService.js';
import { CustomerDynamoDB } from '#/infrastructure/dynamodb/CustomerDynamoDB.js';
import { transactionSchema } from '#/infrastructure/Schemas/CreateTransactionSchema.js'
import { ok, badRequest, serverError } from '#/config/utils/httpResponse.js';

/*
 * Crea una transacción en estado PENDING.
 * No contiene lógica de negocio.
 */

const transactionRepository = new TransactionDynamoDB(process.env.TRANSACTION_TABLE);
const productRepository = new ProductDynamoDB(process.env.PRODUCT_TABLE);
const customerRepository = new CustomerDynamoDB(process.env.CUSTOMER_TABLE)
const paymentService = new PaymentService();
const createTransaction = new CreateTransaction(transactionRepository, productRepository, customerRepository, paymentService);

export const handler = async (event) => {
    try {
        const { idTransaction } = event.pathParameters;

        // Validar pathParameters con Joi
        const { error } = transactionSchema.validate(event.pathParameters, { abortEarly: false });
        if (error) {
            return badRequest(event, error);
        }

        const transaction = await createTransaction.execute(idTransaction);

        return ok(event, transaction);
    } catch (err) {
        console.error('Error creating transaction: ', err);
        return serverError(event, err);
    }
};