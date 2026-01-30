import Joi from 'joi';

export const deliverySchema = Joi.object({
    idDelivery: Joi.string()
        .min(17)
        .max(20)
        .required()
        .messages({
            'string.base': 'El ID debe ser un texto',
            'string.empty': 'El ID no puede estar vacío',
            'string.min': 'El ID debe tener al menos 17 caracteres',
            'string.max': 'El ID debe tener como máximo 20 caracteres',
            'any.required': 'El ID es obligatorio',
        }),
});
