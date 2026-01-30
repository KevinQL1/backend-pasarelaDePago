import { generateIntegrityHash } from '#/infrastructure/crypto/hashIntegrity.js'
// Cliente que se comunica con la API de Wompi (sandbox) para crear transacciones
export class WompiClient {
  constructor() {
    this.publicKey = process.env.WOMPI_PUBLIC_KEY;
    this.integrityKey = process.env.WOMPI_INTEGRITY_KEY
    this.baseUrl = process.env.WOMPI_BASE_URL || 'https://api-sandbox.co.uat.wompi.dev/v1';
  }

  // tokenizar tarjetas
  async tokenCard(paymentInfo) {
    try {
      // Extraer mes y año usando regex
      // Se espera formato "MM/YY" o "MM/YYYY"
      const match = paymentInfo.expiry.match(/^(\d{2})\/(\d{2,4})$/);
      if (!match) throw new Error("Formato de expiry inválido. Debe ser MM/YY o MM/YYYY");

      let exp_month = match[1]; // primer grupo = MM
      let exp_year = match[2];  // segundo grupo = YY o YYYY

      // Si es YYYY, tomar solo los últimos 2 dígitos
      if (exp_year.length === 4) {
        exp_year = exp_year.slice(-2);
      }

      const body = {
        number: paymentInfo.cardNumber,
        card_holder: paymentInfo.customer.name,
        exp_month,
        exp_year,
        cvc: paymentInfo.cvc,
        "shipping-address": {
          "address-line-1": paymentInfo.customer.address,
          country: "CO",
          city: paymentInfo.customer.city,
          "phone-number": paymentInfo.customer.phone,
          region: "CO"
        }
      };

      const url = `${this.baseUrl}/tokens/cards`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const info = await response.json();
      const acceptanceToken = await this.tokenMerchants()

      const tokens = {
        status: info.status,
        tokenCard: info.data,
        tokenMerchants: acceptanceToken
      }

      return tokens
    } catch (error) {
      console.error("Error tokenizando tarjeta:", error.message);
      throw error;
    }
  }

  // aceptar token (merchants)
  async tokenMerchants() {
    try {
      const url = `${this.baseUrl}/merchants/${this.publicKey}`;

      const response = await fetch(url, { method: 'GET' });
      const body = await response.json();

      return body.data
    } catch (error) {
      console.error("Error aceptando token merchants:", error.message);
      throw error;
    }
  }

  // Crea una transacción en Wompi con la información de pago
  async createTransaction(transaction, customer) {
    try {
      const Createhash = {
        reference: transaction.id,
        amount_in_cents: (transaction.amount * transaction.quantity) * 100,
        currency: "COP",
        integritySecret: this.integrityKey
      }

      const signature = await generateIntegrityHash(Createhash)

      const body = {
        acceptance_token: transaction.acceptanceToken,
        accept_personal_auth: transaction.personalToken,
        amount_in_cents: (transaction.amount * transaction.quantity) * 100,
        currency: "COP",
        customer_email: customer.email,
        reference: transaction.id,
        signature,
        payment_method: {
          type: "CARD",
          token: transaction.cardToken,
          installments: 1
        }
      }

      const url = `${this.baseUrl}/transactions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const info = await response.json();

      return info.data
    } catch (err) {
      console.error('Error creando la transacción:', err)
      throw new Error(`Error al procesar el pago: ${err.message}`);
    }
  }

  async findAndUpdateTransactionById(wompiTransactionId) {
    try {
      const url = `${this.baseUrl}/transactions/${wompiTransactionId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
        },
      });
      const body = await response.json();

      return body.data
    } catch (error) {
      console.error("Error aceptando token merchants:", error.message);
      throw error;
    }
  }
}
