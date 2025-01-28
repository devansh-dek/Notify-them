import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export const validateRequest = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body, { abortEarly: false });
            next();
        } catch (error: any) {
            next(new ValidationError(error.message));
        }
    };
};