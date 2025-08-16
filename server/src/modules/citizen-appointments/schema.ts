import Joi from 'joi';

// Schema for creating appointment with time slot booking (combined operation)
export const createAppointmentSchema = Joi.object({
    gnServiceId: Joi.string()
        .length(6)
        .pattern(/^GNS[0-9]{3}$/)
        .required()
        .messages({
            'string.length': 'GN Service ID must be exactly 6 characters',
            'string.pattern.base': 'GN Service ID must follow format GNSxxx (e.g., GNS001)',
            'any.required': 'GN Service ID is required'
        }),

    availabilityId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Availability ID must be a number',
            'number.integer': 'Availability ID must be an integer',
            'number.positive': 'Availability ID must be positive',
            'any.required': 'Availability ID is required'
        }),

    purpose: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
            'string.min': 'Purpose must be at least 10 characters',
            'string.max': 'Purpose must not exceed 500 characters',
            'any.required': 'Purpose is required'
        })
});

// Schema for getting available slots
export const getAvailableSlotsSchema = Joi.object({
    citizenNic: Joi.string()
        .length(12)
        .pattern(/^[0-9]{9}[vVxX]?$|^[0-9]{12}$/)
        .required()
        .messages({
            'string.length': 'NIC must be exactly 12 characters',
            'string.pattern.base': 'Invalid NIC format',
            'any.required': 'Citizen NIC is required'
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
        })
});

// Schema for citizen NIC parameter
export const citizenNicSchema = Joi.object({
    citizenNic: Joi.string()
        .length(12)
        .pattern(/^[0-9]{9}[vVxX]?$|^[0-9]{12}$/)
        .required()
        .messages({
            'string.length': 'NIC must be exactly 12 characters',
            'string.pattern.base': 'Invalid NIC format',
            'any.required': 'Citizen NIC is required'
        })
});

// Schema for appointment ID parameter
export const appointmentIdSchema = Joi.object({
    gnAppointmentId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.integer': 'Appointment ID must be an integer',
            'number.positive': 'Appointment ID must be positive',
            'any.required': 'Appointment ID is required'
        })
});

// Schema for GN officers to query their appointments
export const gnAppointmentsQuerySchema = Joi.object({
    dateFrom: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.format': 'dateFrom must be a valid ISO date (YYYY-MM-DD)',
            'date.base': 'dateFrom must be a valid date'
        }),

    dateTo: Joi.date()
        .iso()
        .optional()
        .when('dateFrom', {
            is: Joi.exist(),
            then: Joi.date().min(Joi.ref('dateFrom')).messages({
                'date.min': 'dateTo must be after or equal to dateFrom'
            }),
            otherwise: Joi.date()
        })
        .messages({
            'date.format': 'dateTo must be a valid ISO date (YYYY-MM-DD)',
            'date.base': 'dateTo must be a valid date'
        }),

    status: Joi.string()
        .valid('Pending', 'Confirmed', 'Completed', 'Cancelled')
        .optional()
        .messages({
            'any.only': 'Status must be one of: Pending, Confirmed, Completed, Cancelled'
        }),

    citizenNic: Joi.string()
        .pattern(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Citizen NIC must be in format 123456789V or 123456789012'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(50)
        .optional()
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        }),

    offset: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .optional()
        .messages({
            'number.base': 'Offset must be a number',
            'number.integer': 'Offset must be an integer',
            'number.min': 'Offset must be at least 0'
        })
});
