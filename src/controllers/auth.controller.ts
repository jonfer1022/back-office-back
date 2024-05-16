import {
  Controller,
  Post,
  Request,
  Response,
  Get,
  Body,
} from '@decorators/express';
import { Request as Req, Response as Res } from 'express';
import { AuthService } from '../services';
import {
  AuthConfirmSignUpDto,
  AuthSignInDto,
  AuthSignUpDto,
} from './dto/auth.dto';
import { validateOrReject } from 'class-validator';
import { RequestAuth } from '../common/types/request.type';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  async signin(@Body() authDto: AuthSignInDto, @Response() res: Res) {
    try {
      const _authDto = new AuthSignInDto();
      _authDto.email = authDto.email;
      _authDto.password = authDto.password;
      await validateOrReject(_authDto).catch((errors) => {
        throw new Error(errors);
      });

      res.send(await this.authService.signIn(authDto));
    } catch (error) {
      console.log('-----> ~ AuthController ~ signin ~ error:', error.message);
      if (!error?.code) res.status(400).send(error.message);
    }
  }

  @Post('/signup')
  async signup(@Body() authDto: AuthSignUpDto, @Response() res: Res) {
    try {
      const _authDto = new AuthSignUpDto();
      _authDto.email = authDto.email;
      _authDto.password = authDto.password;
      _authDto.name = authDto.name;
      await validateOrReject(_authDto).catch((errors) => {
        throw new Error(errors);
      });

      res.send(await this.authService.signUp(authDto));
    } catch (error) {
      console.log('-----> ~ AuthController ~ signup ~ error:', error.message);
      if (!error?.code) res.status(400).send(error.message);
    }
  }

  @Post('/confirm-signup')
  async confirmSignup(
    @Body() authDto: AuthConfirmSignUpDto,
    @Response() res: Res,
  ) {
    try {
      const _authDto = new AuthConfirmSignUpDto();
      _authDto.email = authDto.email;
      _authDto.password = authDto.password;
      _authDto.name = authDto.name;
      _authDto.code = authDto.code;
      await validateOrReject(_authDto).catch((errors) => {
        throw new Error(errors);
      });

      res.send(await this.authService.confirmSignUp(authDto, authDto.code));
    } catch (error) {
      console.log('-----> ~ AuthController ~ confirmSignup ~ error:', error);
      if (!error?.code) res.status(400).send(error.message);
    }
  }

  @Post('/signout')
  async signout(@Request() req: RequestAuth, @Response() res: Res) {
    try {
      res.send(await this.authService.signOut(req.user.token));
    } catch (error) {
      console.log('-----> ~ AuthController ~ signout ~ error:', error.message);
      if (!error?.code) res.status(400).send(error.message);
    }
  }
}
