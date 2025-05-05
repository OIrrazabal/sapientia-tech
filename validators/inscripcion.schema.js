const Joi = require('joi');

const inscripcionSchema = Joi.object({
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

    estado_curso: Joi.number()
        .valid(1) // Solo permite inscripción si está publicado (1)
        .required()
        .messages({
            'number.base': 'El estado del curso debe ser un número',
            'any.only': 'El curso debe estar publicado para inscribirse',
            'any.required': 'Se requiere el estado del curso'
        })
});

module.exports = inscripcionSchema;