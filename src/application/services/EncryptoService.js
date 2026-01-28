import crypto from 'crypto';
import { ENCRYPTION_KEY, ENCRYPTION_IV } from '#/config/index.js';

/**
 * Servicio de cifrado/descifrado para datos sensibles
 * Ejemplo: tarjetas de crédito guardadas en CustomerRepository
 */

export class EncryptionService {
  constructor() {
    if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
      throw new Error('Encryption key and IV must be defined in environment variables');
    }

    this.key = Buffer.from(ENCRYPTION_KEY, 'hex');
    this.iv = Buffer.from(ENCRYPTION_IV, 'hex');
  }

  encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
