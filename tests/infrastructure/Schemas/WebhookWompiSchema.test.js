import { webhookSchema } from '#/infrastructure/Schemas/WebhookWompiSchema.js'

describe('WebhookWompiSchema', () => {
  it('should validate a correct idTransaction', () => {
    const valid = { idTransaction: '1'.padEnd(17, '0') }
    const { error } = webhookSchema.validate(valid)
    expect(error).toBeUndefined()
  })

  it('should return error for missing idTransaction', () => {
    const { error } = webhookSchema.validate({}, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID es obligatorio'))).toBeTruthy()
  })

  it('should return error for invalid type', () => {
    const { error } = webhookSchema.validate({ idTransaction: 12345 }, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID debe ser un texto'))).toBeTruthy()
  })
})