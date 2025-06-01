const Joi = require('joi');

const valoracionSchema = Joi.object({
    curso_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del curso debe ser un número',
            'number.integer': 'El ID del curso debe ser un número entero',
            'number.positive': 'El ID del curso debe ser positivo',
            'any.required': 'Se requiere el ID del curso'
        }),

    alumno_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del alumno debe ser un número',
            'number.integer': 'El ID del alumno debe ser un número entero',
            'number.positive': 'El ID del alumno debe ser positivo',
            'any.required': 'Se requiere el ID del alumno'
        }),

    comentario: Joi.string()
        .min(5)
        .max(500)
        .required()
        .messages({
            'string.empty': 'El comentario es obligatorio',
            'string.min': 'El comentario debe tener al menos {#limit} caracteres',
            'string.max': 'El comentario no puede exceder los {#limit} caracteres',
            'any.required': 'El comentario es obligatorio'
        }),

    estrellas: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.base': 'La valoración debe ser un número',
            'number.integer': 'La valoración debe ser un número entero',
            'number.min': 'La valoración mínima es de {#limit} estrella',
            'number.max': 'La valoración máxima es de {#limit} estrellas',
            'any.required': 'La valoración es obligatoria'
        })
});

module.exports = valoracionSchema;