import Joi from 'joi';

export const customerSchema = Joi.object({
    idCustomer: Joi.string()
        .min(6)
        .max(12)
        .required()
        .messages({
            'string.base': 'El ID debe ser un texto',
            'string.empty': 'El ID no puede estar vacío',
            'string.min': 'El ID debe tener al menos 6 caracteres',
            'string.max': 'El ID debe tener como máximo 12 caracteres',
            'any.required': 'El ID es obligatorio',
        }),
});
