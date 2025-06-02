const Joi = require('joi');

const usuarioSchema = Joi.object({
    nombre: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.base': 'El nombre debe ser texto',
            'string.empty': 'El nombre es obligatorio',
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no debe exceder los 100 caracteres',
            'any.required': 'El nombre es obligatorio'
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.base': 'El correo electrónico debe ser texto',
            'string.email': 'El correo electrónico no es válido',
            'string.empty': 'El correo electrónico es obligatorio',
            'any.required': 'El correo electrónico es obligatorio'
        }),

    password: Joi.string()
        .required()
        .min(6)
        .messages({
            'string.base': 'La contraseña debe ser texto',
            'string.empty': 'La contraseña es obligatoria',
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'any.required': 'La contraseña es obligatoria'
        }),

    es_admin: Joi.number()
        .valid(0, 1)
        .default(0)
        .optional()
        .messages({
            'number.base': 'El indicador de admin debe ser un número',
            'any.only': 'El valor de administrador debe ser 0 o 1'
        }),

    telefono: Joi.string()
        .required()
        .min(7)
        .max(20)
        .messages({
            'string.base': 'El teléfono debe ser texto',
            'string.empty': 'El teléfono es obligatorio',
            'string.min': 'El teléfono debe tener al menos 7 caracteres',
            'string.max': 'El teléfono no debe exceder los 20 caracteres',
            'any.required': 'El teléfono es obligatorio'
        }),

    direccion: Joi.string()
        .required()
        .min(1)
        .max(200)
        .messages({
            'string.base': 'La dirección debe ser texto',
            'string.empty': 'La dirección es obligatoria', 
            'string.min': 'La dirección debe tener al menos 1 caracter',
            'string.max': 'La dirección no debe exceder los 200 caracteres',
            'any.required': 'La dirección es obligatoria'
        })
});

module.exports = usuarioSchema;