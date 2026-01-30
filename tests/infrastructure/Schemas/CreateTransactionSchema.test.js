import { transactionSchema } from '#/infrastructure/Schemas/CreateTransactionSchema.js'

describe('CreateTransactionSchema', () => {
  it('should validate a correct idTransaction', () => {
    const valid = { idTransaction: '1'.padEnd(17, '0') }
    const { error } = transactionSchema.validate(valid)
    expect(error).toBeUndefined()
  })

  it('should return error for missing idTransaction', () => {
    const { error } = transactionSchema.validate({}, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID es obligatorio'))).toBeTruthy()
  })

  it('should return error for short idTransaction', () => {
    const { error } = transactionSchema.validate({ idTransaction: 'short' }, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID debe tener al menos 17 caracteres'))).toBeTruthy()
  })

  it('should return error for long idTransaction', () => {
    const long = '1'.padEnd(21, '0')
    const { error } = transactionSchema.validate({ idTransaction: long }, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID debe tener como máximo 20 caracteres'))).toBeTruthy()
  })
})