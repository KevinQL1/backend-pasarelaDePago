import { SaveCustomerCard } from '#/application/useCases/SaveCustomerCard.js';
import { jest } from '@jest/globals';

describe('SaveCustomerCard Use Case', () => {
  let customerRepositoryMock;
  let encryptionServiceMock;

  beforeEach(() => {
    customerRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    encryptionServiceMock = {
      encrypt: jest.fn((cardNumber) => `encrypted-${cardNumber}`),
    };

    jest.clearAllMocks();
  });

  it('should throw error if required fields are missing', async () => {
    const useCase = new SaveCustomerCard({ customerRepository: customerRepositoryMock, encryptionService: encryptionServiceMock });

    await expect(useCase.execute({ customerId: '', cardNumber: '1234567890123456', cardType: 'VISA' }))
      .rejects.toThrow('customerId, cardNumber and cardType are required');

    await expect(useCase.execute({ customerId: 'c1', cardNumber: '', cardType: 'VISA' }))
      .rejects.toThrow('customerId, cardNumber and cardType are required');

    await expect(useCase.execute({ customerId: 'c1', cardNumber: '1234567890123456', cardType: '' }))
      .rejects.toThrow('customerId, cardNumber and cardType are required');
  });

  it('should throw error for invalid card type', async () => {
    const useCase = new SaveCustomerCard({ customerRepository: customerRepositoryMock, encryptionService: encryptionServiceMock });

    await expect(useCase.execute({ customerId: 'c1', cardNumber: '1234567890123456', cardType: 'AMEX' }))
      .rejects.toThrow('Only VISA and MASTERCARD are allowed');
  });

  it('should throw error for invalid card number', async () => {
    const useCase = new SaveCustomerCard({ customerRepository: customerRepositoryMock, encryptionService: encryptionServiceMock });

    await expect(useCase.execute({ customerId: 'c1', cardNumber: '1234', cardType: 'VISA' }))
      .rejects.toThrow('Card number must be 16 digits');
  });

  it('should throw error if customer not found', async () => {
    customerRepositoryMock.findById.mockResolvedValue(null);
    const useCase = new SaveCustomerCard({ customerRepository: customerRepositoryMock, encryptionService: encryptionServiceMock });

    await expect(useCase.execute({ customerId: 'c1', cardNumber: '1234567890123456', cardType: 'VISA' }))
      .rejects.toThrow('Customer with ID c1 not found');
  });

  it('should save encrypted card if valid', async () => {
    const customer = { id: 'c1', name: 'John Doe' };
    customerRepositoryMock.findById.mockResolvedValue(customer);
    customerRepositoryMock.update.mockResolvedValue(true);

    const useCase = new SaveCustomerCard({ customerRepository: customerRepositoryMock, encryptionService: encryptionServiceMock });

    const result = await useCase.execute({ customerId: 'c1', cardNumber: '1234567890123456', cardType: 'VISA' });

    expect(result.savedCard).toBe('encrypted-1234567890123456');
    expect(result.updatedAt).toBeDefined();
    expect(customerRepositoryMock.update).toHaveBeenCalledTimes(1);
  });
});
