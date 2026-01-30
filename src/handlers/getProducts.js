import { GetProducts } from '#/application/useCases/GetProducts.js';
import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoDB.js';

const productRepo = new ProductDynamoDB(process.env.PRODUCT_TABLE);
const getProducts = new GetProducts(productRepo);

export const handler = async (event) => {
  try {
    const products = await getProducts.execute();
    return {
      statusCode: 200,
      body: JSON.stringify({ products }),
    };
  } catch (err) {
    console.error('Error obtaing products: ', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
