import crypto from "crypto";

export function generateIntegrityHash(transaction) {
  const { reference, amount_in_cents, currency, integritySecret } = transaction
  
  const concatenated = reference + amount_in_cents + currency + integritySecret;

  const hash = crypto
    .createHash("sha256")
    .update(concatenated)
    .digest("hex");

  return hash;
}
