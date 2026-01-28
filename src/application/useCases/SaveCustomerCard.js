import { CustomerDynamoDB } from '#/infrastructure/dynamodb/CustomerDynamoRepo.js';
import { EncryptionService } from '#/application/services/EncryptionService.js';

export class SaveCustomerCard {
    constructor({ customerRepository, encryptionService }) {
        this.customerRepository = customerRepository || new CustomerDynamoDB(process.env.CUSTOMER_TABLE);
        this.encryptionService = encryptionService || new EncryptionService();
    }

    /**
     * Ejecuta el guardado de tarjeta de crédito cifrada para un cliente
     */

    async execute({ customerId, cardNumber, cardType }) {
        if (!customerId || !cardNumber || !cardType) {
            throw new Error('customerId, cardNumber and cardType are required');
        }

        const type = cardType.toUpperCase();
        if (!['VISA', 'MASTERCARD'].includes(type)) {
            throw new Error('Only VISA and MASTERCARD are allowed');
        }

        if (!/^\d{16}$/.test(cardNumber)) {
            throw new Error('Card number must be 16 digits');
        }

        // Obtener cliente existente
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new Error(`Customer with ID ${customerId} not found`);
        }

        // Cifrar tarjeta
        const encryptedCard = this.encryptionService.encrypt(cardNumber);

        // Guardar tarjeta en el cliente
        customer.savedCard = encryptedCard;
        customer.updatedAt = new Date().toISOString();

        await this.customerRepository.update(customer);

        return customer;
    }
}
