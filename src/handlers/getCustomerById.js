import { customerSchema } from '#/infrastructure/Schemas/GetCustomerByIdSchema.js'
import { CustomerDynamoDB } from '#/infrastructure/dynamodb/CustomerDynamoDB.js';
import { GetCustomerById } from '#/application/useCases/GetCutomerById.js';
import { ok, badRequest, serverError } from '#/config/utils/httpResponse.js';

const customerDynamoDB = new CustomerDynamoDB(process.env.CUSTOMER_TABLE)
const getCustomerById = new GetCustomerById(customerDynamoDB);

export const handler = async (event) => {
  try {
    const { idCustomer } = event.pathParameters;

    // Validar pathParameters con Joi
    const { error } = customerSchema.validate(event.pathParameters, { abortEarly: false });
    if (error) {
      return badRequest(event, error);
    }

    const result = await getCustomerById.execute(idCustomer);

    return ok(event, result);
  } catch (err) {
    console.error('Error obtaining customer: ', err)
    return serverError(event, err);
  }
};
