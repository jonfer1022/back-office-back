import { Response, NextFunction } from 'express';
import { CognitoService } from '../aws/cognito.service';
import * as dotenv from 'dotenv';
import { RequestAuth } from '../types/request.type';
import { ClientDb } from '../../client';
import { Item } from 'dynamoose/dist/Item';
import { userSchema } from '../../client/schemas/user.schema';
dotenv.config();

const publicPaths = ['/auth/signup', '/auth/signin', '/auth/confirm-signup'];

class Users extends Item {
  userId: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
}

export const AuthMiddleware = async (
  req: RequestAuth,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (publicPaths.includes(req.path)) {
      next();
    } else {
      const cognitoService = new CognitoService(
        process.env.REGION,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET_HASH,
      );
      const clientDb = new ClientDb();
      const { authorization } = req.headers;
      const accessToken = authorization?.split('Bearer ')[1];
      if (!accessToken) {
        return accessDenied(req.path, res);
      } else {
        const userVerified =
          await cognitoService.verifyAccessToken(accessToken);
        req.user = { token: accessToken };

        userVerified.UserAttributes.forEach(
          (element: { Name: string; Value: string }) => {
            if (element.Name === 'email') {
              req.user.email = element.Value;
            } else if (element.Name === 'name') {
              req.user.name = element.Value;
            }
          },
        );

        const model = clientDb.generateInitializer<Users>('User', userSchema);
        let user: any = null;
        await model
          .scan('email')
          .contains(req.user.email)
          .exec()
          .then((users) => (user = users[0]))
          .catch(() => {});

        if (!user) return accessDenied(req.path, res);
        req.user.id = user.userId;
      }
      next();
    }
  } catch (error) {
    console.log('-----> ~ AuthMiddleware ~ error:', error.message || error);
    accessDenied(req.path, res);
  }
};

export function accessDenied(url: string, res: Response) {
  res.status(403).json({
    statusCode: 403,
    message: 'Access Denied',
    error: 'Forbidden',
    path: url,
    timestamp: new Date().toISOString(),
  });
}
