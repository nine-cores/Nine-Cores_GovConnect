import Joi from 'joi';

// Schema for creating availability
export const createAvailabilitySchema = Joi.object({
    availableDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'Available date must be in YYYY-MM-DD format',
            'any.required': 'Available date is required'
        }),

    startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.pattern.base': 'Start time must be in HH:MM format (24-hour)',
            'any.required': 'Start time is required'
        }),

    endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.pattern.base': 'End time must be in HH:MM format (24-hour)',
            'any.required': 'End time is required'
        }),

    slotDuration: Joi.number().integer().min(5).max(120).optional().default(30).messages({
        'number.base': 'Slot duration must be a number',
        'number.integer': 'Slot duration must be a whole number',
        'number.min': 'Slot duration must be at least 5 minutes',
        'number.max': 'Slot duration cannot exceed 120 minutes'
    })
});

// Schema for updating availability
export const updateAvailabilitySchema = Joi.object({
    availableDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Available date must be in YYYY-MM-DD format'
        }),

    startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
            'string.pattern.base': 'Start time must be in HH:MM format (24-hour)'
        }),

    endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
            'string.pattern.base': 'End time must be in HH:MM format (24-hour)'
        }),

    status: Joi.string().valid('Available', 'Booked', 'Cancelled').optional().messages({
        'any.only': 'Status must be one of: Available, Booked, Cancelled'
    })
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update'
    });

// Schema for getting availability with filters
export const getAvailabilitySchema = Joi.object({
    userId: Joi.string()
        .length(6)
        .pattern(/^GN[0-9]{4}$/)
        .optional()
        .messages({
            'string.length': 'User ID must be exactly 6 characters',
            'string.pattern.base': 'User ID must follow format GNxxxx (e.g., GN0001)'
        }),

    dateFrom: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Date from must be in YYYY-MM-DD format'
        }),

    dateTo: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Date to must be in YYYY-MM-DD format'
        }),

    status: Joi.string().valid('Available', 'Booked', 'Cancelled').optional().messages({
        'any.only': 'Status must be one of: Available, Booked, Cancelled'
    }),

    page: Joi.number().integer().min(1).optional().default(1).messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be a whole number',
        'number.min': 'Page must be at least 1'
    }),

    limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be a whole number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
    })
});

// Schema for getting available slots (public endpoint)
export const getAvailableSlotsSchema = Joi.object({
    userId: Joi.string()
        .length(6)
        .pattern(/^GN[0-9]{4}$/)
        .optional()
        .messages({
            'string.length': 'User ID must be exactly 6 characters',
            'string.pattern.base': 'User ID must follow format GNxxxx (e.g., GN0001)'
        }),

    dateFrom: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Date from must be in YYYY-MM-DD format'
        }),

    dateTo: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Date to must be in YYYY-MM-DD format'
        }),

    page: Joi.number().integer().min(1).optional().default(1).messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be a whole number',
        'number.min': 'Page must be at least 1'
    }),

    limit: Joi.number().integer().min(1).max(100).optional().default(50).messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be a whole number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
    })
});

// Schema for deleting availability
export const deleteAvailabilitySchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'Availability ID must be a number',
        'number.integer': 'Availability ID must be a whole number',
        'number.positive': 'Availability ID must be positive',
        'any.required': 'Availability ID is required'
    })
});

// Schema for bulk operations
export const bulkUpdateAvailabilitySchema = Joi.object({
    availabilityIds: Joi.array()
        .items(Joi.number().integer().positive())
        .min(1)
        .max(50)
        .required()
        .messages({
            'array.base': 'Availability IDs must be an array',
            'array.min': 'At least one availability ID is required',
            'array.max': 'Cannot update more than 50 availability slots at once',
            'any.required': 'Availability IDs are required'
        }),

    status: Joi.string().valid('Available', 'Cancelled').required().messages({
        'any.only': 'Status must be one of: Available, Cancelled',
        'any.required': 'Status is required'
    })
});

export const deleteAvailabilityByDateSchema = Joi.object({
    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'Date must be in YYYY-MM-DD format',
            'any.required': 'Date is required'
        }),
    mode: Joi.string().valid('skipBooked', 'failOnBooked').default('skipBooked')
});
