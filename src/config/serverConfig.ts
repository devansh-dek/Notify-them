import dotenv from 'dotenv';

dotenv.config();

export const SERVER_CONFIG = {
    PORT: process.env.PORT || 3000,
    REDIS_URL: process.env.REDIS_URL,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/user-management',
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie-secret',
    COOKIE_EXPIRES: parseInt(process.env.COOKIE_EXPIRES || '24') // in hours
} as const;



// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`Error: Environment variable ${envVar} is required`);
        process.exit(1);
    }
});