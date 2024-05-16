import { Response, NextFunction, Request } from 'express';

export const RegisterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(
    `Time: ${Date.now().toString()} - Path: ${req.path} - Method: ${req.method}`,
  );
  next();
};
