import Joi from 'joi';

// Schema for creating a new division
export const createDivisionSchema = Joi.object({
    divisionId: Joi.string()
        .length(6)
        .pattern(/^DIV[0-9]{3}$/)
        .required()
        .messages({
            'string.length': 'Division ID must be exactly 6 characters',
            'string.pattern.base': 'Division ID must follow format DIVxxx (e.g., DIV001)',
            'any.required': 'Division ID is required'
        }),
    
    divisionName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Division name must be at least 2 characters',
            'string.max': 'Division name must not exceed 100 characters',
            'any.required': 'Division name is required'
        }),

    gnUserId: Joi.string()
        .length(6)
        .pattern(/^GN[0-9]{4}$/)
        .optional()
        .messages({
            'string.length': 'GN User ID must be exactly 6 characters',
            'string.pattern.base': 'GN User ID must follow format GNxxxx (e.g., GN0001)'
        })
});

// Schema for updating division
export const updateDivisionSchema = Joi.object({
    divisionName: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Division name must be at least 2 characters',
            'string.max': 'Division name must not exceed 100 characters'
        }),

    gnUserId: Joi.string()
        .length(6)
        .pattern(/^GN[0-9]{4}$/)
        .allow(null, '')
        .optional()
        .messages({
            'string.length': 'GN User ID must be exactly 6 characters',
            'string.pattern.base': 'GN User ID must follow format GNxxxx (e.g., GN0001)'
        })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

// Schema for assigning GN to division
export const assignGNSchema = Joi.object({
    divisionId: Joi.string()
        .length(6)
        .pattern(/^DIV[0-9]{3}$/)
        .required()
        .messages({
            'string.length': 'Division ID must be exactly 6 characters',
            'string.pattern.base': 'Division ID must follow format DIVxxx (e.g., DIV001)',
            'any.required': 'Division ID is required'
        }),

    gnUserId: Joi.string()
        .length(6)
        .pattern(/^GN[0-9]{4}$/)
        .required()
        .messages({
            'string.length': 'GN User ID must be exactly 6 characters',
            'string.pattern.base': 'GN User ID must follow format GNxxxx (e.g., GN0001)',
            'any.required': 'GN User ID is required'
        })
});

// Schema for division ID parameter
export const divisionIdSchema = Joi.object({
    divisionId: Joi.string()
        .length(6)
        .pattern(/^DIV[0-9]{3}$/)
        .required()
        .messages({
            'string.length': 'Division ID must be exactly 6 characters',
            'string.pattern.base': 'Division ID must follow format DIVxxx (e.g., DIV001)',
            'any.required': 'Division ID is required'
        })
});

// Schema for GN User ID parameter
export const gnUserIdSchema = Joi.object({
    gnUserId: Joi.string()
        .length(6)
        .pattern(/^GN[0-9]{4}$/)
        .required()
        .messages({
            'string.length': 'GN User ID must be exactly 6 characters',
            'string.pattern.base': 'GN User ID must follow format GNxxxx (e.g., GN0001)',
            'any.required': 'GN User ID is required'
        })
});
