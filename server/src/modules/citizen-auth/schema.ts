import Joi from 'joi';

// Email validation
const emailSchema = Joi.string()
    .email()
    .required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    });

// Password validation
const passwordSchema = Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });

// OTP validation
const otpSchema = Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only numbers',
        'any.required': 'OTP code is required'
    });

// Login with password
export const loginWithPasswordSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema.required(),
    loginMethod: Joi.string().valid('password').required()
});

// Login with OTP
export const loginWithOTPSchema = Joi.object({
    email: emailSchema,
    otpCode: otpSchema,
    loginMethod: Joi.string().valid('otp').required()
});

// Request OTP
export const requestOTPSchema = Joi.object({
    email: emailSchema,
    type: Joi.string()
        .valid('Login', 'PasswordReset', 'EmailVerification')
        .required()
        .messages({
            'any.only': 'Type must be one of: Login, PasswordReset, EmailVerification'
        })
});

// Set password
export const setPasswordSchema = Joi.object({
    citizenNic: Joi.string()
        .pattern(/^(?:\d{9}[VXvx]|\d{12})$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid NIC format'
        }),
    password: passwordSchema.required(),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match'
        }),
    otpCode: otpSchema
});

// Refresh token
export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

// Verify OTP
export const verifyOTPSchema = Joi.object({
    citizenNic: Joi.string()
        .pattern(/^(?:\d{9}[VXvx]|\d{12})$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid NIC format'
        }),
    otpCode: otpSchema,
    type: Joi.string()
        .valid('Login', 'PasswordReset', 'EmailVerification')
        .required()
});
