import { Injectable } from '@decorators/di';
import { ModelType } from 'dynamoose/dist/General';
import { ClientDb } from '../client';
import { MessagesItem, messagesSchema } from '../client/schemas/message.schema';
import * as uuid from 'uuid';

@Injectable()
export class MessagesService {
  private modelMessages: ModelType<MessagesItem>;

  constructor(private clientDb: ClientDb) {
    this.modelMessages = this.clientDb.generateInitializer<MessagesItem>(
      'Message',
      messagesSchema,
    );
  }

  async sendMessage({
    userId,
    message,
    receiverId,
    senderInfo,
    status = 'unread',
  }: any) {
    try {
      const msg = {
        messageId: uuid.v4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderId: userId,
        message,
        receiverId,
        senderInfo,
        status,
        data: {},
      };
      return await this.modelMessages.create(msg);
    } catch (error) {
      const { message } = error;
      console.log(
        '-----> ~ MessagesService ~ sendMessage ~ error:',
        message || error,
      );
      throw new Error('Failed to send message: ' + message);
    }
  }

  async updateMessages({ messages }: { messages: MessagesItem[] }) {
    try {
      const result = await this.modelMessages.batchPut(messages);
      return result;
    } catch (error) {
      const { message } = error;
      console.log(
        '-----> ~ MessagesService ~ updateMessages ~ error:',
        message || error,
      );
      throw new Error('Failed to update messages: ' + message);
    }
  }

  async deleteMessage({ messageId }: { messageId: string }) {
    try {
      const message = await this.modelMessages
        .query('messageId')
        .eq(messageId)
        .limit(1)
        .exec();

      if (!message) throw new Error('Message not found');
      if (message[0].status === 'read')
        throw new Error('You cannnot delete a message already read');

      const result = await this.modelMessages.delete({
        messageId: messageId,
        createdAt: message[0].createdAt,
      });
      return result;
    } catch (error) {
      const { message } = error;
      console.log(
        '-----> ~ MessagesService ~ deleteMessages ~ error:',
        message || error,
      );
      throw new Error('Failed to delete messages: ' + message);
    }
  }

  async updateMessage({
    messageId,
    message,
  }: {
    messageId: string;
    message: Partial<MessagesItem>;
  }) {
    try {
      const msg = await this.modelMessages
        .query('messageId')
        .eq(messageId)
        .limit(1)
        .exec();

      if (!msg) throw new Error('Message not found');
      if (msg[0].status === 'read')
        throw new Error('You cannnot update a message already read');

      const result = await this.modelMessages.update(message);
      return result;
    } catch (error) {
      const { message } = error;
      console.log(
        '-----> ~ MessagesService ~ updateMessage ~ error:',
        message || error,
      );
      throw new Error('Failed to update message: ' + message);
    }
  }
}
