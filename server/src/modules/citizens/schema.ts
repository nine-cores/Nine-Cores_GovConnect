import Joi from 'joi';
import { CitizenVerificationStatus } from '@/database/entities/citizen.entity';

export const createCitizenSchema = Joi.object({
    nic: Joi.string()
        .pattern(/^(\d{9}[vVxX]|\d{12})$/)
        .required()
        .messages({
            'string.pattern.base': 'NIC must be 10 digits ending with V/X or 12 digits',
            'any.required': 'NIC is required'
        }),
    
    displayName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Display name must be at least 2 characters',
            'string.max': 'Display name cannot exceed 100 characters',
            'any.required': 'Display name is required'
        }),
    
    phoneNumber: Joi.string()
        .pattern(/^\+94\d{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be in format +94XXXXXXXXX',
            'any.required': 'Phone number is required'
        }),
    
    email: Joi.string()
        .email()
        .max(100)
        .optional()
        .allow('')
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email cannot exceed 100 characters'
        }),
    
    address: Joi.string()
        .trim()
        .min(10)
        .max(255)
        .required()
        .messages({
            'string.min': 'Address must be at least 10 characters',
            'string.max': 'Address cannot exceed 255 characters',
            'any.required': 'Address is required'
        })
});

export const updateCitizenSchema = Joi.object({
    displayName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Display name must be at least 2 characters',
            'string.max': 'Display name cannot exceed 100 characters'
        }),
    
    phoneNumber: Joi.string()
        .pattern(/^\+94\d{9}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Phone number must be in format +94XXXXXXXXX'
        }),
    
    email: Joi.string()
        .email()
        .max(100)
        .optional()
        .allow('')
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email cannot exceed 100 characters'
        }),
    
    address: Joi.string()
        .trim()
        .min(10)
        .max(255)
        .optional()
        .messages({
            'string.min': 'Address must be at least 10 characters',
            'string.max': 'Address cannot exceed 255 characters'
        })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

export const verifyCitizenSchema = Joi.object({
    verificationStatus: Joi.string()
        .valid(...Object.values(CitizenVerificationStatus))
        .required()
        .messages({
            'any.only': 'Verification status must be one of: Pending, Verified, Rejected',
            'any.required': 'Verification status is required'
        })
});

export const getCitizenSchema = Joi.object({
    nic: Joi.string()
        .pattern(/^(\d{9}[vVxX]|\d{12})$/)
        .required()
        .messages({
            'string.pattern.base': 'NIC must be 10 digits ending with V/X or 12 digits',
            'any.required': 'NIC is required'
        })
});

export const searchCitizensSchema = Joi.object({
    query: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .messages({
            'string.min': 'Search query must be at least 1 character',
            'string.max': 'Search query cannot exceed 50 characters',
            'any.required': 'Search query is required'
        }),
    
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .messages({
            'number.min': 'Page must be at least 1'
        }),
    
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(20)
        .messages({
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        })
});

export const previewCitizenSchema = Joi.object({
    nic: Joi.string()
        .pattern(/^(\d{9}[vVxX]|\d{12})$/)
        .required()
        .messages({
            'string.pattern.base': 'NIC must be 10 digits ending with V/X or 12 digits',
            'any.required': 'NIC is required'
        })
});
