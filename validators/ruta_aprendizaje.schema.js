const Joi = require('joi');

const rutaAprendizajeSchema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.base': 'El nombre debe ser texto',
            'string.empty': 'El nombre es obligatorio',
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 100 caracteres',
            'any.required': 'El nombre es obligatorio'
        }),
    descripcion: Joi.string()
        .allow('')
        .optional()
        .max(500)
        .messages({
            'string.base': 'La descripción debe ser texto',
            'string.max': 'La descripción no puede tener más de 500 caracteres'
        })
});

const validarNuevaRuta = (data) => {
    return rutaAprendizajeSchema.validate(data, { abortEarly: false });
};

module.exports = { 
    validarNuevaRuta,
    rutaAprendizajeSchema
};
