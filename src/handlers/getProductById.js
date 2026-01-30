import { productSchema } from '#/infrastructure/Schemas/GetProductByIdSchema.js'
import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoDB.js';
import { GetProductById } from '#/application/useCases/GetProductById.js';
import { ok, badRequest, serverError } from '#/config/utils/httpResponse.js';

const productDynamoDB = new ProductDynamoDB(process.env.PRODUCT_TABLE)
const getProductById = new GetProductById(productDynamoDB);

export const handler = async (event) => {
  try {
    const { idProduct } = event.pathParameters;

    // Validar pathParameters con Joi
    const { error } = productSchema.validate(event.pathParameters, { abortEarly: false });
    if (error) {
      return badRequest(event, error);
    }

    const result = await getProductById.execute(idProduct);

    return ok(event, result);
  } catch (err) {
    console.error('Error obtaining product: ', err)
    return serverError(event, err);
  }
};
