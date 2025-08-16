import Joi from 'joi';

export const registerSchema = Joi.object({
    userId: Joi.string()
        .trim()
        .length(10)
        .required()
        .messages({
            'string.empty': 'User ID is required',
            'string.length': 'User ID must be exactly 10 characters'
        }),
    
    displayName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Display name is required',
            'string.min': 'Display name must be at least 2 characters long',
            'string.max': 'Display name must not exceed 100 characters'
        }),
    
    phoneNumber: Joi.string()
        .trim()
        .pattern(/^[0-9+\-\s]+$/)
        .max(15)
        .required()
        .messages({
            'string.empty': 'Phone number is required',
            'string.pattern.base': 'Please provide a valid phone number',
            'string.max': 'Phone number must not exceed 15 characters'
        }),
    
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address'
        }),
    
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must not exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }),
    
    role: Joi.string()
        .valid('GN', 'Staff-MT', 'Admin')
        .required()
        .messages({
            'any.only': 'Role must be one of: GN, Staff-MT, Admin',
            'any.required': 'Role is required'
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required'
        })
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'string.empty': 'Refresh token is required'
        })
});

export const logoutSchema = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'string.empty': 'Refresh token is required'
        })
});
