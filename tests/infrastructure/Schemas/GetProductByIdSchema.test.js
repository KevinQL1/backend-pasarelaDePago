import { productSchema } from '#/infrastructure/Schemas/GetProductByIdSchema.js'

describe('GetProductByIdSchema', () => {
  it('should validate a correct idProduct', () => {
    const valid = { idProduct: '1'.padEnd(17, '0') }
    const { error } = productSchema.validate(valid)
    expect(error).toBeUndefined()
  })

  it('should return error for missing idProduct', () => {
    const { error } = productSchema.validate({}, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID es obligatorio'))).toBeTruthy()
  })

  it('should return error for short idProduct', () => {
    const { error } = productSchema.validate({ idProduct: 'short' }, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID debe tener al menos 17 caracteres'))).toBeTruthy()
  })
})