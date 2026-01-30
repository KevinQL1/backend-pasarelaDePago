import { GetProducts } from '#/application/useCases/GetProducts.js';
import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoDB.js';
import { ok, serverError } from '#/config/utils/httpResponse.js';

const productRepo = new ProductDynamoDB(process.env.PRODUCT_TABLE);
const getProducts = new GetProducts(productRepo);

export const handler = async (event) => {
  try {
    const products = await getProducts.execute();
    return ok(event, products);
  } catch (err) {
    console.error('Error obtaining products: ', err)
    return serverError(event, err);
  }
};
