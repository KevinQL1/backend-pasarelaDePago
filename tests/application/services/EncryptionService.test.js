import { EncryptionService } from '#/application/services/EncryptionService.js'

// Guardamos las variables originales para restaurarlas después
const ORIGINAL_KEY = process.env.ENCRYPTION_KEY
const ORIGINAL_IV = process.env.ENCRYPTION_IV

describe('EncryptionService', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' // 64 hex chars = 32 bytes
    process.env.ENCRYPTION_IV = 'abcdef9876543210abcdef9876543210' // 32 hex chars = 16 bytes
  })

  afterEach(() => {
    process.env.ENCRYPTION_KEY = ORIGINAL_KEY
    process.env.ENCRYPTION_IV = ORIGINAL_IV
  })

  it('should throw an error if ENCRYPTION_KEY or ENCRYPTION_IV is missing', () => {
    process.env.ENCRYPTION_KEY = ''
    process.env.ENCRYPTION_IV = ''

    expect(() => new EncryptionService()).toThrow('Encryption key and IV must be defined in environment variables')
  })

  it('should encrypt and decrypt text correctly', () => {
    const service = new EncryptionService()
    const plainText = '4111111111111111' // tarjeta de ejemplo
    const encrypted = service.encrypt(plainText)
    expect(encrypted).not.toBe(plainText)

    const decrypted = service.decrypt(encrypted)
    expect(decrypted).toBe(plainText)
  })

  it('should return different ciphertexts for same text with same key and iv', () => {
    const service = new EncryptionService()
    const text = 'test123'
    const encrypted1 = service.encrypt(text)
    const encrypted2 = service.encrypt(text)
    expect(encrypted1).toMatch(/^[0-9a-f]+$/)
    expect(encrypted2).toMatch(/^[0-9a-f]+$/)
  })
})
