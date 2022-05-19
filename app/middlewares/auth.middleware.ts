import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server';
import { Helper, constants } from '../utils';
import { config, Logger } from '../config';
import { DecodedPayload } from '@app/interfaces/user.interface';

const { verifyPassword } = Helper;

const logger = Logger.createLogger({ label: 'BLOG GRAPHQL' });

class AuthMiddleware {
    static async checkIfEmailAlreadyExist(context: any, args: any) {
        try {
            const { email } = args;
            const user = await context.prisma.user
                .findUnique({ where: { email } });
            if (user) {
                throw new Error(constants.RESOURCE_ALREADY_EXIST('User'));
            };
        } catch (error) {
            logger.error('Error: Input Error while validating email in checkIfEmailAlreadyExist method in auth.middleware.ts', error);
            throw new Error(error);
        }
    };

    static async checkIfEmailExist(context: any, args: any) {
        try {
            const { email } = args;
            const user = await context.prisma.user
                .findUnique({ where: { email } });
            if (!user) {
                throw new Error(constants.RESOURCE_NOT_FOUND('User'));
            };
            return user;
        } catch (error) {
            throw new Error(error);
        }
    };

    static async comparePassword(user: any, args: any) {
        try {
            if (!verifyPassword(args.password, user.password)) {
                throw new Error(constants.INVALID_CREDENTIAL);
            }
            const { password, ...newUser } = user;
            return newUser;
        } catch (error) {
            throw new Error(error);
        }
    };

    static checkAuthorizationToken(authorization: string) {
        let bearerToken = null;
        if (authorization) {
            const token = authorization.split(' ')[1];
            bearerToken = (authorization.includes('Bearer')) ? token : authorization;
        }
        return bearerToken;
    };

    static userAuth = async (context: any): Promise<DecodedPayload> => {
        try {
            const authorization = await context.req.headers.authorization;

            const bearerToken = this.checkAuthorizationToken(authorization);
            if (!bearerToken) {
                throw new AuthenticationError('Authorization token is required');
            }
            return jwt.verify(bearerToken, config.JWT_SECRET) as DecodedPayload;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AuthenticationError('Your session has expired');
            }
            throw new AuthenticationError('Invalid token');
        }
    };
};

export default AuthMiddleware;