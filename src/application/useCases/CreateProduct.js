import { generateShortUUID } from '#/config/utils/uuidv4.js';
import { ProductEntity } from '#/domain/entities/ProductEntity.js';

/**
 * Caso de uso encargado de crear productos
 */

export class CreateProduct {
    constructor(productRepo) {
        if (!productRepo) {
            throw new Error('ProductRepository is required');
        }
        this.productRepo = productRepo;
    }

    async execute({ name, description, price, stock }) {
        if (!name || !description || !price || !stock) {
            throw new Error('Invalid product data');
        }

        const now = new Date().toISOString();

        const product = new ProductEntity({
            id: generateShortUUID(),
            name,
            description,
            price,
            stock,
            createdAt: now,
            updatedAt: now,
        });

        await this.productRepo.save(product);

        return product;
    }
}
