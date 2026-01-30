import dotenv from 'dotenv';
dotenv.config();

export const config = {
  stage: process.env.STAGE || 'local',
  wompiPrivateKey: process.env.WOMPI_PUBLIC_KEY,
  wompiIntegrityKey: process.env.WOMPI_INTEGRITY_KEY,
  productTable: process.env.PRODUCT_TABLE,
  customerTable: process.env.CUSTOMER_TABLE,
  transactionTable: process.env.TRANSACTION_TABLE,
  deliveryTable: process.env.DELIVERY_TABLE,
};
