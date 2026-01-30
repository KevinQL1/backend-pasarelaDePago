// Servicio que se encarga de comunicarse con Wompi para procesar pagos

import { WompiClient } from '#/infrastructure/wompi/WompiClient.js';

export class PaymentService {
  constructor() {
    this.wompiClient = new WompiClient();
  }

  // Procesa un pago enviando la información a Wompi
  async processPayment(paymentInfo) {
    const result = await this.wompiClient.tokenCard(paymentInfo);
    return result;
  }

// Realiza el pago enviando los tokens necesarios a wompi
  async createPayment(transaction, customer){
    const result = await this.wompiClient.createTransaction(transaction, customer);
    return result;
  }

// Buscar y actualizar el estado de la transaccion
  async findAndUpdateTransactionById(wompiTransactionId){
    const result = await this.wompiClient.findAndUpdateTransactionById(wompiTransactionId);
    return result;
  }
}
