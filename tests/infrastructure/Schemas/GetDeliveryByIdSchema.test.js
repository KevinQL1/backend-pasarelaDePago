import { deliverySchema } from '#/infrastructure/Schemas/GetDeliveryByIdSchema.js'

describe('GetDeliveryByIdSchema', () => {
  it('should validate a correct idDelivery', () => {
    const valid = { idDelivery: '1'.padEnd(17, '0') }
    const { error } = deliverySchema.validate(valid)
    expect(error).toBeUndefined()
  })

  it('should return error for missing idDelivery', () => {
    const { error } = deliverySchema.validate({}, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID es obligatorio'))).toBeTruthy()
  })

  it('should return error for invalid type', () => {
    const { error } = deliverySchema.validate({ idDelivery: 123 }, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID debe ser un texto'))).toBeTruthy()
  })
})