/// <reference types="../../types/express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/database';
import { User, UserAccountStatus } from '@/database/entities/user.entity';
import { dataResponse } from '@/core/responses';
import { NotFound, Forbidden } from '@/core/errors';

const userRepository = AppDataSource.getRepository(User);

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        return dataResponse(res, { user }, 'User profile retrieved successfully');
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [users, total] = await userRepository.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' }
        });

        const meta = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        };

        return dataResponse(res, { users }, 'Users retrieved successfully', 200, meta);
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const user = await userRepository.findOne({
            where: { userId: id }
        });

        if (!user) {
            throw new NotFound('User not found');
        }

        return dataResponse(res, { user }, 'User retrieved successfully');
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const user = await userRepository.findOne({
            where: { userId: id }
        });

        if (!user) {
            throw new NotFound('User not found');
        }

        // Prevent users from changing their own status
        if (user.userId === req.user?.userId) {
            throw new Forbidden('Cannot change your own status');
        }

        user.accountStatus = status;
        await userRepository.save(user);

        return dataResponse(res, { user }, 'User status updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await userRepository.findOne({
            where: { userId: id }
        });

        if (!user) {
            throw new NotFound('User not found');
        }

        // Prevent users from deleting themselves
        if (user.userId === req.user?.userId) {
            throw new Forbidden('Cannot delete your own account');
        }

        await userRepository.remove(user);

        return dataResponse(res, null, 'User deleted successfully');
    } catch (error) {
        next(error);
    }
};
