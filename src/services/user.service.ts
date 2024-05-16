import { Injectable } from '@decorators/di';
import { ClientDb } from '../../src/client';
import { ModelType } from 'dynamoose/dist/General';
import { UserItem, userSchema } from '../../src/client/schemas/user.schema';
import { MessagesItem, messagesSchema } from '../client/schemas/message.schema';

@Injectable()
export class UserService {
  private modelMessages: ModelType<MessagesItem>;
  private modelUsers: ModelType<UserItem>;

  constructor(private clientDb: ClientDb) {
    this.modelMessages = this.clientDb.generateInitializer<MessagesItem>(
      'Message',
      messagesSchema,
    );
    this.modelUsers = this.clientDb.generateInitializer<UserItem>(
      'User',
      userSchema,
    );
  }

  async getUsers({ userId, status, search }: any) {
    try {
      const messages = await this.modelMessages
        .query('receiverId')
        .eq(userId)
        .where('status')
        .eq('unread')
        .exec();

      const _usersIdWithUnreadMessages = [userId],
        usersWithUnreadMessages = [];
      messages.forEach((message) => {
        if (!_usersIdWithUnreadMessages.includes(message.senderId)) {
          _usersIdWithUnreadMessages.push(message.senderId);
          usersWithUnreadMessages.push({
            userId: message.senderId,
            ...message.senderInfo,
            ...message,
          });
        }
      });

      if (status === 'unread') return usersWithUnreadMessages;

      const allUsers = search.length
        ? await this.modelUsers.scan().where('name').contains(search).exec()
        : await this.modelUsers.scan().all().exec();

      const usersWhoHaventSentMessagesCurrently = allUsers.filter(
        (user) =>
          !_usersIdWithUnreadMessages.includes(user.userId) && { ...user },
      );
      if (search.length === 0) {
        return [
          ...usersWithUnreadMessages,
          ...usersWhoHaventSentMessagesCurrently,
        ];
      } else {
        const users = [
          ...usersWithUnreadMessages,
          ...usersWhoHaventSentMessagesCurrently,
        ].filter((user) => user.name.includes(search) && { ...user });

        return users;
      }
    } catch (error) {
      const { message } = error;
      console.log('-----> ~ getUsers ~ error:', message || error);
      throw new Error('Failed to insert task: ' + error.message);
    }
  }

  async getMessagesByUser(receiverId: string, senderId: string) {
    try {
      const messagesReceived = await this.modelMessages
        .query('receiverId')
        .eq(receiverId)
        .where('senderId')
        .eq(senderId)
        // .limit(10)
        .exec();

      const messagesSent = await this.modelMessages
        .query('receiverId')
        .eq(senderId)
        .where('senderId')
        .eq(receiverId)
        // .limit(10)
        .exec();

      const messages = [...messagesReceived, ...messagesSent];
      messages.sort(
        (a: MessagesItem, b: MessagesItem) =>
          Number(new Date(a.createdAt)) - Number(new Date(b.createdAt)),
      );
      return messages;
    } catch (error) {
      const { message } = error;
      console.log('-----> ~ getUser ~ error:', message || error);
      throw new Error('Failed to insert task: ' + error.message);
    }
  }
}
