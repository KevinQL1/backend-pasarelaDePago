import Joi from 'joi';

// Esquema de validación para paymentInfo
export const payProcessSchema = Joi.object({
  paymentInfo: Joi.object({
    cardNumber: Joi.string()
      .creditCard()
      .required()
      .messages({
        "string.creditCard": "El número de tarjeta no es válido",
        "any.required": "El número de tarjeta es requerido"
      }),
    cardType: Joi.string().valid("VISA", "MASTERCARD").required().messages({
      "any.only": "Tipo de tarjeta no válido",
      "any.required": "El tipo de tarjeta es requerido"
    }),
    expiry: Joi.string()
      .pattern(/^(\d{2})\/(\d{2})$/)
      .required()
      .custom((value, helpers) => {
        const [month, year] = value.split('/').map(Number);
        if (month < 1 || month > 12) return helpers.error("any.invalidMonth");
        if (year < 26 || year > 50) return helpers.error("any.invalidYear");
        return value;
      })
      .messages({
        "string.pattern.base": "Expiry debe tener formato MM/YY",
        "any.required": "Expiry es requerido",
        "any.invalidMonth": "El mes de expiry debe estar entre 01 y 12",
        "any.invalidYear": "El año de expiry debe estar entre 26 y 50"
      }),
    cvc: Joi.string()
      .pattern(/^\d{3}$/)
      .required()
      .messages({
        "string.pattern.base": "CVC debe ser de 3 dígitos",
        "any.required": "CVC es requerido"
      }),
    customer: Joi.object({
      cedula: Joi.string()
        .pattern(/^\d+$/)
        .min(6)
        .max(10)
        .required()
        .messages({
          "string.base": "La cédula debe ser un texto",
          "string.pattern.base": "La cédula solo puede contener números",
          "string.min": "La cédula es muy corta",
          "string.max": "La cédula es muy larga",
          "any.required": "La cédula del cliente es requerida"
        }),
      name: Joi.string().min(3).max(100).required().messages({
        "string.base": "El nombre debe ser un texto",
        "string.min": "El nombre debe tener al menos 3 caracteres",
        "string.max": "El nombre debe tener máximo 100 caracteres",
        "any.required": "El nombre del cliente es requerido"
      }),
      email: Joi.string().email().required().messages({
        "string.email": "El email no es válido",
        "any.required": "El email del cliente es requerido"
      }),
      address: Joi.string().min(5).max(200).required().messages({
        "string.base": "La dirección debe ser un texto",
        "string.min": "La dirección es muy corta",
        "string.max": "La dirección es muy larga",
        "any.required": "La dirección del cliente es requerida"
      }),
      city: Joi.string().min(2).max(100).required().messages({
        "string.base": "La ciudad debe ser un texto",
        "string.min": "La ciudad es muy corta",
        "string.max": "La ciudad es muy larga",
        "any.required": "La ciudad del cliente es requerida"
      }),
      phone: Joi.string()
        .pattern(/^\d{10,13}$/)
        .required()
        .messages({
          "string.pattern.base": "El teléfono debe tener entre 10 y 13 dígitos",
          "any.required": "El teléfono del cliente es requerido"
        }),
    }).required().messages({
      "any.required": "El objeto customer es requerido"
    }),
    productId: Joi.string().min(17).max(20).required().messages({
      "string.base": "El productId debe ser un texto",
      'string.empty': 'El productId no puede estar vacío',
      'string.min': 'El productId debe tener al menos 17 caracteres',
      'string.max': 'El productId debe tener como máximo 20 caracteres',
      "any.required": "El productId del cliente es requerido"
    }),
    quantity: Joi.number()
      .integer()
      .min(1)
      .max(99)
      .required()
      .messages({
        "number.base": "El quantity debe ser un número",
        "number.integer": "El quantity debe ser un número entero",
        "number.min": "El quantity debe tener al menos 1 cantidad",
        "number.max": "El quantity debe tener como máximo 99 cantidades",
        "any.required": "El quantity del cliente es requerido"
      })
  }).required().messages({
    "any.required": "paymentInfo es requerido"
  })
});
