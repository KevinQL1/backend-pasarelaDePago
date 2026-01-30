import { customerSchema } from '#/infrastructure/Schemas/GetCustomerByIdSchema.js'

describe('GetCustomerByIdSchema', () => {
  it('should validate a correct idCustomer', () => {
    const valid = { idCustomer: '1'.padEnd(6, '0') }
    const { error } = customerSchema.validate(valid)
    expect(error).toBeUndefined()
  })

  it('should return error for missing idCustomer', () => {
    const { error } = customerSchema.validate({}, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID es obligatorio'))).toBeTruthy()
  })

  it('should return error for long idCustomer', () => {
    const long = '1'.padEnd(21, '0')
    const { error } = customerSchema.validate({ idCustomer: long }, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details.some(d => d.message.includes('El ID debe tener como máximo 12 caracteres'))).toBeTruthy()
  })
})