import * as express from 'express';
import settingRoutes from './settingRoutes';
import { Container } from '@decorators/express';
import { UserService, AuthService, MessagesService } from './services';
import { ClientDb } from './client';
import { CognitoService } from './common/aws/cognito.service';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { RegisterMiddleware } from './common/middleware/register.middleware';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

async function main() {
  Container.provide([
    { provide: ClientDb, useClass: ClientDb },
    { provide: UserService, useClass: UserService },
    { provide: AuthService, useClass: AuthService },
    { provide: CognitoService, useClass: CognitoService },
    { provide: MessagesService, useClass: MessagesService },
  ]);

  app.use(cors());
  app.use(express.json());
  app.use(RegisterMiddleware);
  app.use(AuthMiddleware);

  // Register API routes
  const apiRouter = await settingRoutes();
  app.use('', apiRouter);

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

main()
  .then(async () => {
    console.log('Server started!');
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
