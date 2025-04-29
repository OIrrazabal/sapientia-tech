const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
        'string.email': 'El correo electrónico no es válido.',
        'string.empty': 'El correo electrónico es obligatorio.'
    }),
    password: Joi.string()
    .min(6)
    .required()
    .messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres.',
        'string.empty': 'La contraseña es obligatoria.'
    })
});

module.exports = loginSchema;