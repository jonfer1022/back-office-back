import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export const messagesSchema = new dynamoose.Schema(
  {
    messageId: {
      type: String,
      hashKey: true,
      required: true,
    },
    createdAt: {
      type: String,
      rangeKey: true,
    },
    updatedAt: String,
    status: String,
    message: String,
    senderId: String,
    senderInfo: Object,
    receiverId: {
      type: String,
      index: {
        name: 'ReceiverIdIndex',
        type: "global",
        project: true
      },
    },
    data: Object,
  },
  {
    saveUnknown: [
      'senderInfo.*', 
      'data.**',
    ],
  },
);

export class MessagesItem extends Item {
  messageId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  message: string;
  senderId: string;
  senderInfo: Object;
  receiverId: string;
  data: Object;
}
