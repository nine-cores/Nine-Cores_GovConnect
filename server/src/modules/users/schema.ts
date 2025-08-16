import Joi from 'joi';
import { UserAccountStatus } from '@/database/entities/user.entity';

export const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid(...Object.values(UserAccountStatus))
        .required()
        .messages({
            'any.only': 'Status must be one of: Active, Inactive, Suspended',
            'any.required': 'Status is required'
        })
});

export const getUserByIdSchema = Joi.object({
    id: Joi.string()
        .length(10)
        .required()
        .messages({
            'string.length': 'Invalid user ID format',
            'any.required': 'User ID is required'
        })
});
