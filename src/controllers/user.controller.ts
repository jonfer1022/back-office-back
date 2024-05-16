import {
  Controller,
  Post,
  Request,
  Response,
  Get,
  Body,
  Query,
  Params,
} from '@decorators/express';
import { Request as Req, Response as Res } from 'express';
import { UserService } from '../services/user.service';
import { RequestAuth } from '../common/types/request.type';

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async getUsers(
    @Request() req: RequestAuth,
    @Query() params: { search: string },
    @Response() res: Res,
  ) {
    try {
      res.send(
        await this.userService.getUsers({
          userId: req.user.id,
          search: params.search,
        }),
      );
    } catch (error) {
      console.log('-----> ~ UserController ~ getUsers ~ error:', error);
      if (!error?.code) return res.status(400).send(error.message);
      return res.send(error);
    }
  }

  @Get('/:userId/messages')
  async getMessagesByUser(
    @Request() req: RequestAuth,
    @Params('userId') userId: string,
    @Response() res: Res,
  ) {
    try {
      res.send(await this.userService.getMessagesByUser(req.user.id, userId));
    } catch (error) {
      console.log('-----> ~ UserController ~ getUser ~ error:', error);
      if (!error?.code) return res.status(400).send(error.message);
      return res.send(error);
    }
  }
}
