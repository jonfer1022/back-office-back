import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export const userSchema = new dynamoose.Schema({
  userId: {
    type: String,
    hashKey: true,
    required: true,
  },
  createdAt: {
    type: String,
    rangeKey: true,
  },
  updatedAt: String,
  email: String,
  name: String,
});

export class UserItem extends Item {
  userId: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
}
