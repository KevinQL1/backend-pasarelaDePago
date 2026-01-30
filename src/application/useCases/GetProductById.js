export class GetProductById {
    constructor(productRepo) {
        if (!productRepo) {
            throw new Error('ProductRepository is required');
        }
        this.productRepo = productRepo;
    }

        async execute(idProduct) {
        if (!idProduct) {
            throw new Error('Invalid product ID');
        }

        const product = await this.productRepo.findById(idProduct);
        if (!product) {
            throw new Error('Product not found');
        }
        
        return product;
    }
}