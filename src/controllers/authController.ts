import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { SERVER_CONFIG } from '../config/serverConfig';


export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }
  private setTokenCookie(res: Response, token: string): void {
    res.cookie('token', token, {
        httpOnly: true,
        secure: SERVER_CONFIG.NODE_ENV === 'production', // Use secure cookies in production
        signed: true,
        maxAge: SERVER_CONFIG.COOKIE_EXPIRES * 60 * 60 * 1000, // Convert hours to milliseconds
        sameSite: 'strict',
        path: '/'
    });
}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, token } = await this.authService.register(req.body);
      // setting up token cookie
      this.setTokenCookie(res, token);
      res.status(201).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);
      // setting up cookie token
      this.setTokenCookie(res, token);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  };
  logout = async (req: Request, res: Response): Promise<void> => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000), // Cookie expires in 5 seconds
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

}