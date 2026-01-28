import { ProductDynamoDB } from '#/infrastructure/dynamodb/ProductDynamoDB.js';

export class UpdateStock {
    constructor({ productRepository }) {
        this.productRepository = productRepository || new ProductDynamoDB(process.env.PRODUCT_TABLE);
    }

    /**
     * Actualiza el stock de un producto tras una compra
     */

    async execute({ productId, quantity }) {
        if (!productId || quantity == null) {
            throw new Error('productId and quantity are required');
        }

        if (quantity <= 0) {
            throw new Error('Quantity must be greater than zero');
        }

        // Obtener el producto
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
        }

        // Validar stock suficiente
        if (product.stock < quantity) {
            throw new Error(`Insufficient stock. Available: ${product.stock}, requested: ${quantity}`);
        }

        // Actualizar stock
        product.stock -= quantity;
        product.updatedAt = new Date().toISOString();

        await this.productRepository.update(product);

        return product;
    }
}
