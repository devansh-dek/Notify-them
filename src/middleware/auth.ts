import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SERVER_CONFIG } from '../config/serverConfig';
import { UserRepository } from '../repositories/userRepository';

interface JWTPayload {
  _id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}


export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token;
        
        // Check for token in signed cookies first
        if (req.signedCookies.token) {
            token = req.signedCookies.token;
        }
        // Fallback to Authorization header
        else if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        console.log("token is ",token);

        if (!token) {
            res.status(401).json({ success: false, error: 'Not authorized' });
            return;
        }

        const decoded = jwt.verify(
            token,
            SERVER_CONFIG.JWT_SECRET
        ) as JWTPayload;

        const userRepository = new UserRepository();
        console.log('user is ',decoded);
        const user = await userRepository.findById(decoded._id);
        if (!user) {
            res.status(401).json({ success: false, error: 'User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Not authorized' });
    }
};
