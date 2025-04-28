const Joi = require('joi');

const cursoSchema = Joi.object({
    nombre: Joi.string()
        .required()
        .min(3)
        .max(50)
        .trim()
        .messages({
            'string.empty': 'El nombre del curso es obligatorio',
            'string.min': 'El nombre debe tener al menos {#limit} caracteres',
            'string.max': 'El nombre no puede exceder los {#limit} caracteres',
            'any.required': 'El nombre del curso es obligatorio'
        }),

    descripcion: Joi.string()
        .required()
        .min(10)
        .max(500)
        .trim()
        .messages({
            'string.empty': 'La descripción del curso es obligatoria',
            'string.min': 'La descripción debe tener al menos {#limit} caracteres',
            'string.max': 'La descripción no puede exceder los {#limit} caracteres',
            'any.required': 'La descripción del curso es obligatoria'
        })
});

module.exports = cursoSchema;