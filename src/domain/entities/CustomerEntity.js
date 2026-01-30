export class CustomerEntity {
  constructor({
    id,
    name,
    email,
    address,
    city,
    phone,
    createdAt,
    updatedAt, }) {
    this.validate({ id, name, email, address, city, phone });

    this.id = id;
    this.name = name;
    this.email = email;
    this.address = address;
    this.city = city;
    this.phone = phone;
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  validate({ id, name, email, address, city, phone }) {
    // id = cédula
    if (!id || typeof id !== 'string') {
      throw new Error('Customer id (cédula) es requerido y debe ser un string');
    }

    if (!name || typeof name !== 'string') {
      throw new Error('Customer name es requerido y debe ser un string');
    }

    if (!email || typeof email !== 'string') {
      throw new Error('Customer email es requerido y debe ser un string');
    }

    // validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Customer email no es válido');
    }

    if (!address || typeof address !== 'string') {
      throw new Error('Customer address es requerido y debe ser un string');
    }

    if (!city || typeof city !== 'string') {
      throw new Error('Customer city es requerido y debe ser un string');
    }

    if (!phone || typeof phone !== 'string') {
      throw new Error('Customer phone es requerido y debe ser un string');
    }

    // validación básica de teléfono (solo números, mínimo 7, máximo 15)
    const phoneRegex = /^\d{10,13}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Customer phone no es válido (debe contener solo números y entre 7 y 15 dígitos)');
    }
  }
}
