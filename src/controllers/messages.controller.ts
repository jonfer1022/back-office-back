import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  Put,
  Delete,
  Params,
} from '@decorators/express';
import { Request as Req, Response as Res } from 'express';
import { MessagesService } from '../services/messages.service';
import { RequestAuth } from '../common/types/request.type';
import { MessagesItem } from '../client/schemas/message.schema';

@Controller('/messages')
export class MessagesController {
  constructor(private messageService: MessagesService) {}

  @Post('/')
  async sendMessage(
    @Body() body: Partial<MessagesItem>,
    @Request() req: RequestAuth,
    @Response() res: Res,
  ) {
    try {
      res.send(
        await this.messageService.sendMessage({
          message: body.message,
          receiverId: body.receiverId,
          userId: req.user.id,
          senderInfo: {
            name: req.user.name,
            email: req.user.email,
          },
        }),
      );
    } catch (error) {
      console.log('-----> ~ MessagesController ~ sendMessage ~ error):', error);
      if (!error?.code) res.status(400).send(error.message);
    }
  }

  @Put('/')
  async updateMessages(
    @Body() body: { messages: Partial<MessagesItem[]> },
    @Response() res: Res,
  ) {
    try {
      const { messages } = body;
      res.send(
        await this.messageService.updateMessages({
          messages,
        }),
      );
    } catch (error) {
      console.log(
        '-----> ~ MessagesController ~ updateMessage ~ error):',
        error,
      );
      if (!error?.code) res.status(400).send(error.message);
    }
  }

  @Delete('/:messageId')
  async deleteMessage(
    @Params('messageId') messageId: string,
    @Response() res: Res,
  ) {
    try {
      res.send(await this.messageService.deleteMessage({ messageId }));
    } catch (error) {
      console.log(
        '-----> ~ MessagesController ~ deleteMessage ~ error):',
        error,
      );
      if (!error?.code) res.status(400).send(error.message);
    }
  }

  @Put('/:messageId')
  async updateMessage(
    @Params('messageId') messageId: string,
    @Body() body: MessagesItem,
    @Response() res: Res,
  ) {
    try {
      res.send(
        await this.messageService.updateMessage({ messageId, message: body }),
      );
    } catch (error) {
      console.log(
        '-----> ~ MessagesController ~ updateMessage ~ error):',
        error,
      );
      if (!error?.code) res.status(400).send(error.message);
    }
  }
}
