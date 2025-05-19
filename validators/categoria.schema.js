const Joi = require('joi');

const categoriaSchema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'El nombre es obligatorio',
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no debe exceder los 100 caracteres'
        }),
    descripcion: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
            'string.empty': 'La descripción es obligatoria',
            'string.min': 'La descripción debe tener al menos 10 caracteres',
            'string.max': 'La descripción no debe exceder los 500 caracteres'
        })
});

module.exports = categoriaSchema;