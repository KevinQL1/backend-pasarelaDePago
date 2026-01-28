import { jest } from '@jest/globals'
import { ProcessPayment } from '#/application/useCases/ProcessPayment.js'

describe('ProcessPayment UseCase', () => {
  let mockTransactionRepo
  let mockProductRepo
  let mockPaymentService
  let useCase

  beforeEach(() => {
    // Mocks para repositorios y servicio de pago
    mockTransactionRepo = {
      findById: jest.fn(),
      updateStatus: jest.fn()
    }
    mockProductRepo = {
      findById: jest.fn(),
      decreaseStock: jest.fn()
    }
    mockPaymentService = {
      processPayment: jest.fn()
    }

    useCase = new ProcessPayment(mockTransactionRepo, mockProductRepo, mockPaymentService)
  })

  it('should throw error if cardNumber or cardType is missing', async () => {
    await expect(useCase.execute('t1', { customerAddress: 'Calle 123' }))
      .rejects.toThrow('Card number and type are required')
  })

  it('should throw error if customerAddress is missing', async () => {
    await expect(useCase.execute('t1', { cardNumber: '4111111111111111', cardType: 'VISA' }))
      .rejects.toThrow('Delivery address is required')
  })

  it('should throw error if cardNumber is invalid', async () => {
    await expect(useCase.execute('t1', { cardNumber: '123', cardType: 'VISA', customerAddress: 'Calle 123' }))
      .rejects.toThrow('Card number must be 16 digits')
  })

  it('should throw error if cardType is invalid', async () => {
    await expect(useCase.execute('t1', { cardNumber: '4111111111111111', cardType: 'AMEX', customerAddress: 'Calle 123' }))
      .rejects.toThrow('Only VISA and MASTERCARD allowed')
  })

  it('should throw error if transaction not found', async () => {
    mockTransactionRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('t1', {
      cardNumber: '4111111111111111',
      cardType: 'VISA',
      customerAddress: 'Calle 123'
    })).rejects.toThrow('Transaction not found')
  })

  it('should throw error if product not found', async () => {
    mockTransactionRepo.findById.mockResolvedValue({ id: 't1', productId: 'p1' })
    mockProductRepo.findById.mockResolvedValue(null)
    await expect(useCase.execute('t1', {
      cardNumber: '4111111111111111',
      cardType: 'VISA',
      customerAddress: 'Calle 123'
    })).rejects.toThrow('Product with ID p1 not found')
  })

  it('should throw error if product is out of stock', async () => {
    mockTransactionRepo.findById.mockResolvedValue({ id: 't1', productId: 'p1' })
    mockProductRepo.findById.mockResolvedValue({ id: 'p1', name: 'Producto', stock: 0 })
    await expect(useCase.execute('t1', {
      cardNumber: '4111111111111111',
      cardType: 'VISA',
      customerAddress: 'Calle 123'
    })).rejects.toThrow('Product Producto is out of stock')
  })

  it('should process payment and decrease stock if approved', async () => {
    const transaction = { id: 't1', productId: 'p1' }
    const product = { id: 'p1', name: 'Producto', stock: 5 }

    mockTransactionRepo.findById.mockResolvedValue(transaction)
    mockProductRepo.findById.mockResolvedValue(product)
    mockPaymentService.processPayment.mockResolvedValue({ status: 'APPROVED', wompiTransactionId: 'w123' })

    const result = await useCase.execute('t1', {
      cardNumber: '4111111111111111',
      cardType: 'VISA',
      customerAddress: 'Calle 123'
    })

    expect(mockTransactionRepo.updateStatus).toHaveBeenCalledWith('t1', 'APPROVED', 'w123')
    expect(mockProductRepo.decreaseStock).toHaveBeenCalledWith('p1', 1)
    expect(result).toEqual({
      transactionId: 't1',
      status: 'APPROVED',
      wompiTransactionId: 'w123'
    })
  })

  it('should process payment but not decrease stock if declined', async () => {
    const transaction = { id: 't1', productId: 'p1' }
    const product = { id: 'p1', name: 'Producto', stock: 5 }

    mockTransactionRepo.findById.mockResolvedValue(transaction)
    mockProductRepo.findById.mockResolvedValue(product)
    mockPaymentService.processPayment.mockResolvedValue({ status: 'DECLINED', wompiTransactionId: 'w456' })

    const result = await useCase.execute('t1', {
      cardNumber: '4111111111111111',
      cardType: 'MASTERCARD',
      customerAddress: 'Calle 123'
    })

    expect(mockTransactionRepo.updateStatus).toHaveBeenCalledWith('t1', 'DECLINED', 'w456')
    expect(mockProductRepo.decreaseStock).not.toHaveBeenCalled()
    expect(result).toEqual({
      transactionId: 't1',
      status: 'DECLINED',
      wompiTransactionId: 'w456'
    })
  })
})
