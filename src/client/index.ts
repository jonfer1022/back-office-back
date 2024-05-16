import { Injectable } from '@decorators/di';
import * as dotenv from 'dotenv';
import * as dynamoose from 'dynamoose';
import { ModelType } from 'dynamoose/dist/General';
import { Item } from 'dynamoose/dist/Item';
dotenv.config();

@Injectable()
export class ClientDb extends dynamoose.aws.ddb.DynamoDB {
  constructor() {
    super({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
    this.init();
  }

  async init() {
    dynamoose.aws.ddb.set(this);
  }

  generateInitializer<T extends Item>(name: string, schema: any) {
    try {
      return dynamoose.model<T>(name, schema, { create: true });
    } catch (error) {
      console.log('-----> ~ ClientDb ~ error:', error);
    }
  }

  async create(model: ModelType<Item>, data: any) {
    try {
      return await model.create(data);
    } catch (error) {
      console.log('-----> ~ ClientDb ~ error:', error);
    }
  }
}
