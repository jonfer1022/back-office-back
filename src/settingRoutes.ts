import * as express from 'express';
import { attachControllers } from '@decorators/express';
import {
  AuthController,
  MessagesController,
  UserController,
} from './controllers';

const apiRouter = express.Router();

const settingRoutes = async () => {
  await attachControllers(apiRouter, [
    UserController,
    AuthController,
    MessagesController,
  ]);
  return apiRouter;
};

export default settingRoutes;
