import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoDB.js';
import { CreateProduct } from '#/application/useCases/CreateProduct.js';

const productRepo = new ProductDynamoDB(process.env.PRODUCT_TABLE);
const createProduct = new CreateProduct(productRepo);

export const handler = async (event) => {
    try {
        const data = JSON.parse(event.body || '{}');
        const { name, description, price, stock } = data;

        if (!name || !description || !price || !stock) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required fields',
                }),
            };
        }

        const product = await createProduct.execute({
            name,
            description,
            price,
            stock
        });

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Product created', product }),
        };
    } catch (err) {
        console.error('Error creating product: ', err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
            }),
        };
    }
};
