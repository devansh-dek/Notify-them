import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { SERVER_CONFIG } from './config/serverConfig';
import authRouter from './routes/authRoutes';  
import userRouter from './routes/userRoutes';
import cookieParser from 'cookie-parser';
import notificationRouter from './routes/notificationRoutes';

class App {
    private app: Express;

    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet({
            crossOriginResourcePolicy: { policy: "cross-origin" }
        }));
        // Cookie Parser
        this.app.use(cookieParser(SERVER_CONFIG.COOKIE_SECRET));

        // CORS configuration
        const corsOptions = {
            origin: SERVER_CONFIG.CORS_ORIGIN,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
            maxAge: 86400,
        };
        this.app.use(cors(corsOptions));

        // Body parsing middleware
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private setupRoutes(): void {
        // Health check route
        this.app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({ status: 'OK' });
        });

        // Add the authentication routes under /auth /users
this.app.use('/users', userRouter);
this.app.use('/api/notifications', notificationRouter);



        this.app.use('/auth', authRouter);  // Mount the router on /auth path
    }

    private setupErrorHandling(): void {
        // Error handling middleware
        this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error(err.stack);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        });
    }

    public async start(): Promise<void> {
        try {
            // Connect to MongoDB
            await mongoose.connect(SERVER_CONFIG.MONGODB_URI);
            console.log('Connected to MongoDB Database');

            // Start the server
            this.app.listen(SERVER_CONFIG.PORT, () => {
                console.log(`Server running on port ${SERVER_CONFIG.PORT}`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1); 
        }
    }
}

// Start the application
const app = new App();
app.start().catch(console.error);

export default app;
